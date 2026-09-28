import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import mongoose from 'mongoose';
import net from 'node:net';
import test from 'node:test';

const configuredMongoUri = process.env.TEST_MONGO_URI;

test('production API protects roles, holdings, and numeric account values', {
  skip: !configuredMongoUri && 'Set TEST_MONGO_URI to run API integration tests',
  timeout: 30000,
}, async (t) => {
  const testDatabase = `marketboard_test_${Date.now()}_${process.pid}`;
  const mongoUrl = new URL(configuredMongoUri);
  mongoUrl.pathname = `/${testDatabase}`;
  const mongoUri = mongoUrl.toString();
  const port = await new Promise((resolve) => {
    const probe = net.createServer();
    probe.listen(0, '127.0.0.1', () => {
      const availablePort = probe.address().port;
      probe.close(() => resolve(availablePort));
    });
  });
  const server = spawn(process.execPath, ['server.js'], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      NODE_ENV: 'production',
      MONGO_URI: mongoUri,
      JWT_SECRET: `integration-test-${Date.now()}`,
      CLIENT_URL: 'http://localhost:5173',
      PORT: String(port),
      SEED_ADMIN_EMAIL: '',
      SEED_ADMIN_PASSWORD: '',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  t.after(async () => {
    if (server.exitCode === null) {
      const stopped = new Promise((resolve) => server.once('exit', resolve));
      server.kill('SIGTERM');
      await stopped;
    }
    await mongoose.connect(mongoUri);
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  });

  let serverOutput = '';
  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error(`Server startup timed out: ${serverOutput}`)), 15000);
    const readOutput = (chunk) => {
      serverOutput += chunk.toString();
      if (serverOutput.includes('Server running on port')) {
        clearTimeout(timeout);
        resolve();
      }
    };
    server.stdout.on('data', readOutput);
    server.stderr.on('data', readOutput);
    server.once('error', (error) => {
      clearTimeout(timeout);
      reject(error);
    });
    server.once('exit', (code) => {
      clearTimeout(timeout);
      reject(new Error(`Server exited before startup (${code}): ${serverOutput}`));
    });
  });

  const apiUrl = `http://127.0.0.1:${port}/api`;
  let response = await fetch(`${apiUrl}/health`);
  assert.equal(response.status, 200);

  response = await fetch(`${apiUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'invalid-email', password: 'test-password-123' }),
  });
  assert.equal(response.status, 400);

  response = await fetch(`${apiUrl}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Deployment Test', email: 'invalid-email', password: 'test-password-123' }),
  });
  assert.equal(response.status, 400);

  response = await fetch(`${apiUrl}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Deployment Test', email: 'short-password@example.test', password: 'short' }),
  });
  assert.equal(response.status, 400);

  response = await fetch(`${apiUrl}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Deployment Test',
      email: `deploy-${Date.now()}@example.test`,
      password: 'test-password-123',
      role: 'admin',
    }),
  });
  assert.equal(response.status, 201);
  const account = await response.json();
  assert.equal(account.role, 'investor');

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${account.token}`,
  };
  response = await fetch(`${apiUrl}/admin/stats`, { headers });
  assert.equal(response.status, 403);

  response = await fetch(`${apiUrl}/orders`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ symbol: 'BTC', side: 'buy', quantity: 'Infinity' }),
  });
  assert.equal(response.status, 400);

  response = await fetch(`${apiUrl}/wallet/deposit`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ amount: 'Infinity' }),
  });
  assert.equal(response.status, 400);

  response = await fetch(`${apiUrl}/wallet/withdraw`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ amount: 0.001 }),
  });
  assert.equal(response.status, 400);

  response = await fetch(`${apiUrl}/alerts`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ symbol: 'BTC', condition: 'above', target: 'Infinity' }),
  });
  assert.equal(response.status, 400);

  response = await fetch(`${apiUrl}/portfolio/holdings`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ symbol: 'BTC', quantity: 10, averageBuyPrice: 0 }),
  });
  assert.equal(response.status, 404);

  response = await fetch(`${apiUrl}/wallet/deposit`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ amount: 1.239 }),
  });
  assert.equal(response.status, 201);
  const deposit = await response.json();
  assert.equal(deposit.cashBalance, 50001.24);
  assert.equal(deposit.transaction.amount, 1.24);
});