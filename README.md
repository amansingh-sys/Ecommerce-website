# PremiumStore — Full-Stack E-commerce

PremiumStore is a full-stack e-commerce student project built with a vanilla HTML/CSS/JavaScript storefront, Node.js/Express REST API and MongoDB/Mongoose. It includes customer accounts, persistent carts and wishlists, Cash-on-Delivery checkout, and a role-protected admin dashboard for catalogue and order management.

## Technology
- **Frontend:** HTML5, CSS3, JavaScript (no frontend framework)
- **Backend:** Node.js, Express.js
- **Database:** MongoDB with Mongoose
- **Authentication:** bcrypt password hashing + JWT stored in an HttpOnly cookie
- **Security basics:** Helmet, API rate limiting, input validation, server-side role authorization

## Features
### Customer storefront
- Browse, search, filter and sort products loaded from MongoDB
- Register, sign in and sign out
- Persistent customer cart and wishlist
- Product detail page
- Checkout and order history API (COD only)

### Admin dashboard
- Separate admin sign-in page at `/admin-login.html`
- Dashboard statistics: revenue, orders, products, customers and low-stock count
- Add, edit and archive products (CRUD)
- View all orders and update order status
- View registered customer list
- Admin endpoints and pages require an authenticated account with the `admin` role

## Requirements
- Node.js 18+
- MongoDB Community Server running locally, or a MongoDB Atlas connection

## Run locally (Windows)
1. Extract the ZIP and open the `Premium-Store-FullStack` folder in VS Code.
2. Open a terminal in the project root.
3. Install backend dependencies:
   ```bash
   npm run install:backend
   ```
4. Create your environment file:
   ```powershell
   Copy-Item backend/.env.example backend/.env
   ```
   (If using Command Prompt, run `copy backend\.env.example backend\.env`.)
5. Open `backend/.env`. For local MongoDB, use:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://127.0.0.1:27017/premiumstore
   JWT_SECRET=replace_with_a_long_random_secret_at_least_32_characters
   JWT_EXPIRES_IN=7d
   NODE_ENV=development
   ```
   Replace `JWT_SECRET` with a private random string. Never upload `.env` to GitHub.
6. Ensure **MongoDB Server** is running in Windows Services (`services.msc`).
7. Create your first administrator account (see below).
8. Start the app:
   ```bash
   npm run dev
   ```
9. Open `http://localhost:5000` for the storefront or `http://localhost:5000/admin-login.html` for admin sign-in.

You do not need to run Live Server separately. Express serves the frontend and API from the same origin.

## Create the first admin account
There is intentionally **no seed file** and no public admin registration. The catalogue starts empty. Create a privileged account from the project root:

```bash
npm run create-admin -- admin@example.com StrongPassword123 "Store Administrator"
```

Use your own email and a strong password (at least 8 characters). The command connects to MongoDB and creates the account with the `admin` role. If the email already exists, it promotes that account and updates its password. Keep the credentials private. After creation, sign in at `/admin-login.html`.

## Add products without a seed file
1. Sign in to the admin dashboard.
2. Open **Products → Add product**.
3. Enter product name, category, price, stock, image URL/local image path and optional details.
4. Save. The product is stored in MongoDB and appears in the customer storefront while active.
5. Use Edit to update details or Archive to hide a product without deleting historical order data.

For local images, place image files inside `frontend/images/` and use a path such as `images/headphones.jpg`.

## Main API routes
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/health` | Public | API health |
| POST | `/api/auth/register` | Public | Customer registration |
| POST | `/api/auth/login` | Public | Sign in |
| POST | `/api/auth/logout` | Public | Clear session cookie |
| GET | `/api/auth/me` | Signed in | Current account |
| GET | `/api/products` | Public | Search/filter/sort active products |
| GET | `/api/products/:id` | Public | Product details |
| POST | `/api/products` | Admin | Create product |
| PUT | `/api/products/:id` | Admin | Update product |
| DELETE | `/api/products/:id` | Admin | Archive product |
| GET/POST/DELETE | `/api/cart` | Signed in | Read/add/clear cart |
| PATCH/DELETE | `/api/cart/:productId` | Signed in | Update/remove cart item |
| GET/POST/DELETE | `/api/wishlist` | Signed in | Read/add/remove wishlist items |
| POST | `/api/orders` | Signed in | Place COD order |
| GET | `/api/orders/my` | Signed in | Customer order history |
| GET | `/api/orders` | Admin | All orders |
| PATCH | `/api/orders/:id/status` | Admin | Update order status |
| GET | `/api/admin/stats` | Admin | Dashboard statistics |
| GET | `/api/admin/products` | Admin | All products, including archived |
| GET | `/api/admin/users` | Admin | Customer list |

## Project structure
```text
Premium-Store-FullStack/
├── backend/
│   ├── config/             # MongoDB connection
│   ├── controllers/        # Product and admin business logic
│   ├── middleware/         # Authentication and role authorization
│   ├── models/             # Mongoose schemas
│   ├── routes/             # REST API routes
│   ├── scripts/            # One-time admin account setup command
│   ├── utils/
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── admin/              # Admin dashboard assets
│   ├── images/
│   ├── admin-login.html
│   ├── admin-dashboard.html
│   └── storefront pages, CSS and JavaScript
├── .env is created locally inside backend/ (not included)
└── README.md
```

## Important limitations
- Online payment processing is not integrated. Checkout is Cash on Delivery only; no real UPI/card payment is collected.
- Product image upload is not implemented; use a URL or a local file path in `frontend/images/`.
- This is a learning/demo project, not a production commerce platform. Before production use, add automated tests, CSRF protection appropriate to cookie authentication, transactional stock/order handling, secure deployment/HTTPS, logging, backups and operational monitoring.

## GitHub upload checklist
- Do not commit `backend/.env` or any passwords/secrets.
- Do not upload `node_modules`; run `npm install` after cloning.
- Commit `backend/package-lock.json` for reproducible dependency installation.
