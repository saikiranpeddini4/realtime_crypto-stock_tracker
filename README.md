# MarketBoard - Stock, Crypto & Forex Monitoring / Trading Platform

A full-stack market-monitoring and trading simulator built with **React 18**, **Vite**, **Node.js**, **Express.js**, and **MongoDB (Mongoose)** with **JWT Authentication** and **Role-Based Authorization**. Prices and wallet funds are simulated; this app has no live market-data feed, payment integration, or real-money trading.

---

## 📁 Project Structure

```
stock-and-crypto/
│
├── frontend/
│   ├── src/
│   │   ├── services/
│   │   │   └── api.js              # Centralized API service layer
│   │   ├── market-monitor-app.jsx   # Main React UI component
│   │   └── main.jsx                 # React root mounting script
│   ├── public/                      # Static assets
│   ├── index.html                   # HTML template
│   ├── package.json                 # Frontend dependencies
│   └── vite.config.js               # Vite config with API proxy
│
├── backend/
│   ├── config/
│   │   └── db.js                    # MongoDB Mongoose connection
│   │
│   ├── models/                      # Database Schemas & Models
│   │   ├── User.js                  # User credentials, bcrypt pre-save, role
│   │   ├── Asset.js                 # Stocks, Crypto, Forex/Currency data & history
│   │   ├── Portfolio.js             # User holdings & average buy prices
│   │   ├── Order.js                 # Buy/Sell order execution logs
│   │   ├── Alert.js                 # Target price alert triggers
│   │   ├── Notification.js          # System notifications
│   │   ├── Watchlist.js             # Tracked assets per user
│   │   └── WalletTransaction.js     # Cash deposits & withdrawals log
│   │
│   ├── controllers/                 # Route Business Logic
│   │   ├── authController.js        # Register, Login, Current User Profile
│   │   ├── assetController.js       # List, Search, Filter Assets
│   │   ├── portfolioController.js   # Holdings CRUD
│   │   ├── orderController.js       # Buy/Sell Order Execution logic
│   │   ├── alertController.js       # Alert CRUD
│   │   ├── notificationController.js# Notification status management
│   │   ├── watchlistController.js   # Add/Remove Watchlist items
│   │   ├── walletController.js      # Deposit/Withdraw cash balance
│   │   └── adminController.js       # System stats, user status control
│   │
│   ├── routes/                      # Express Endpoint Routers
│   │   ├── authRoutes.js
│   │   ├── assetRoutes.js
│   │   ├── portfolioRoutes.js
│   │   ├── orderRoutes.js
│   │   ├── alertRoutes.js
│   │   ├── notificationRoutes.js
│   │   ├── watchlistRoutes.js
│   │   ├── walletRoutes.js
│   │   └── adminRoutes.js
│   │
│   ├── middleware/
│   │   ├── authMiddleware.js        # JWT Bearer token protection
│   │   ├── adminMiddleware.js       # Admin role check
│   │   ├── errorMiddleware.js       # Centralized error handler
│   │   └── notFoundMiddleware.js    # 404 handler
│   │
│   ├── utils/
│   │   └── generateToken.js         # JWT signing helper
│   │
│   ├── seed/
│   │   └── seedData.js              # Idempotent DB seeding script
│   │
│   ├── .env.example                 # Environment configuration template
│   ├── package.json                 # Backend dependencies
│   └── server.js                    # Express application entry point
│
└── README.md                        # Documentation
```

---

## ⚡ Installation & Execution Commands

### Prerequisites
- **Node.js**: v18+ recommended
- **MongoDB**: Local MongoDB instance (`mongodb://127.0.0.1:27017/stock_crypto_market`) or MongoDB Atlas URI.

---

### 1. Backend Setup & Startup

```powershell
# Navigate to the backend directory
cd "stock and crypto/backend"

# Install backend dependencies
npm install

# (Optional) Seed the database with initial assets and test users
npm run seed

# Start the Express server
npm start
```

Backend will run on: `http://localhost:5000`

Backend integration tests use a disposable MongoDB database. Set `TEST_MONGO_URI` to a MongoDB connection URI before running `npm test` from `backend`; the suite creates and drops a uniquely named test database. Without this variable, the integration test is skipped.

```powershell
cd backend
$env:TEST_MONGO_URI = "mongodb://127.0.0.1:27017"
npm test
```

---

### 2. Frontend Setup & Startup

Open a second terminal window:

```powershell
# Navigate to the frontend directory
cd "stock and crypto/frontend"

# Install frontend dependencies
npm install

# Start the Vite development server
npm run dev
```

Frontend will run on: `http://localhost:5173`

### Production deployment

The repository includes a `render.yaml` blueprint for deploying the backend as a Node web service and the frontend as a static site on Render. The backend requires these production variables:

```text
NODE_ENV=production
MONGO_URI=<MongoDB Atlas connection string>
JWT_SECRET=<long randomly generated secret>
CLIENT_URL=https://<your-frontend-host>
```

The frontend uses `/api` by default for same-origin deployments. For a separately hosted backend, set `VITE_API_URL` to the full API base URL, including `/api`, before the frontend build. `VITE_DEV_API_URL` only changes the local Vite proxy target.

Deployment checklist:

1. Create a production MongoDB database and restrict its network access to the backend service.
2. Set the backend variables in the hosting provider; never commit `.env` files or production secrets.
3. Deploy the backend and confirm `GET /api/health` returns `status: "ok"`.
4. Deploy the frontend with `VITE_API_URL` pointing to the backend when the services use different hosts.
5. Run `npm run seed` to provision market sample data. Bundled demo users are created only outside production. To provision a production admin during seeding, set `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD` for that invocation; keep the password secret and remove the variables afterward.

The backend exits during production startup when required variables are missing, and only begins listening after MongoDB connects. `npm ci` and `npm run build` are the reproducible install and build commands used by the deployment blueprint.

### Vercel deployment

Deploy this repository as two Vercel projects:

1. Create a Vercel project with the repository root directory set to `frontend`. Vercel uses `npm run build`, publishes `dist`, and uses `frontend/vercel.json` for SPA refreshes.
2. Create a second Vercel project with the repository root directory set to `backend`. Vercel uses `backend/api/index.js` as the serverless Express function.
3. In the backend Vercel project, add `NODE_ENV=production`, `MONGO_URI`, `JWT_SECRET`, and `CLIENT_URL=https://<frontend-project>.vercel.app`.
4. In the frontend Vercel project, add `VITE_API_URL=https://<backend-project>.vercel.app/api`, then redeploy.
5. Confirm `https://<backend-project>.vercel.app/api/health` returns `status: "ok"` before testing login.

The Vercel backend keeps MongoDB connections warm between function invocations when possible. Use MongoDB Atlas and allow the required Vercel outbound access in its network settings.

---

## 🔑 Local Demo Seed Users

These accounts are created only when seeding outside production. They are not suitable for a public deployment.

| Email | Password | Role | Description |
| :--- | :--- | :--- | :--- |
| `ananya@mail.com` | `password123` | `investor` | Standard Investor Account |
| `devesh@mail.com` | `password123` | `investor` | Standard Investor Account |
| `admin@mail.com` | `adminpassword` | `admin` | Administrator Account |

---

## 🔌 API Endpoint Reference

### Authentication (`/api/auth`)
- `POST /api/auth/register` - Register a new user (`name`, `email`, `password`, `role`)
- `POST /api/auth/login` - Login user and obtain JWT token
- `GET /api/auth/me` - Get logged-in user profile (Protected)
- `PUT /api/auth/profile` - Update profile name, email, or password (Protected)

### Assets (`/api/assets`)
- `GET /api/assets` - Get all assets (Supports `?type=stock|crypto|currency` and `?search=query`)
- `GET /api/assets/:id` - Get asset details by MongoDB ID
- `GET /api/assets/symbol/:symbol` - Get asset details by Ticker Symbol

### Portfolio (`/api/portfolio`)
- `GET /api/portfolio` - Get logged-in user's portfolio holdings (Protected)
- Portfolio holdings are read-only and change only through executed orders, keeping holdings, wallet balance, and order history aligned.

### Orders (`/api/orders`)
- `POST /api/orders` - Execute a `buy` or `sell` order with validation and cash adjustment (Protected)
- `GET /api/orders` - Get order execution history for user (Protected)
- `GET /api/orders/:id` - Get specific order details (Protected)

### Watchlist (`/api/watchlist`)
- `GET /api/watchlist` - Get user's watchlist (Protected)
- `POST /api/watchlist/:assetId` - Add asset to watchlist (Protected)
- `DELETE /api/watchlist/:assetId` - Remove asset from watchlist (Protected)

### Price Alerts (`/api/alerts`)
- `GET /api/alerts` - Get user's price alerts (Protected)
- `POST /api/alerts` - Create a price alert (`assetId`, `condition`, `target`) (Protected)
- `PUT /api/alerts/:id` - Update alert status or target (Protected)
- `DELETE /api/alerts/:id` - Delete price alert (Protected)

### Notifications (`/api/notifications`)
- `GET /api/notifications` - Get user notifications (Protected)
- `PUT /api/notifications/:id/read` - Mark single notification read (Protected)
- `PUT /api/notifications/read-all` - Mark all notifications read (Protected)
- `DELETE /api/notifications/:id` - Delete notification (Protected)

### Wallet (`/api/wallet`)
- `GET /api/wallet` - Get wallet balance & transaction history (Protected)
- `POST /api/wallet/deposit` - Deposit cash balance (Protected)
- `POST /api/wallet/withdraw` - Withdraw cash balance with validation (Protected)

### Admin (`/api/admin`)
- `GET /api/admin/stats` - System statistics summary (Admin Only)
- `GET /api/admin/users` - Get all user accounts (Admin Only)
- `PUT /api/admin/users/:id/status` - Change user status `active` vs `suspended` (Admin Only)
- `GET /api/admin/orders` - View all orders across all users (Admin Only)
