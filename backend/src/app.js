
// import express from "express";
// import cors from "cors";
// import cookieParser from "cookie-parser";

// import authRoutes from "./routes/auth.routes.js";
// import errorHandler from "./middleware/error.middleware.js";
// import restaurantRoutes from "./routes/restaurant.routes.js";
// import categoryRoutes from "./routes/category.routes.js";
// import menuRoutes from "./routes/menu.routes.js";
// import cartRoutes from "./routes/cart.routes.js";
// import orderRoutes from "./routes/order.routes.js";
// import reviewRoutes from "./routes/review.routes.js";
// import deliveryRoutes from "./routes/delivery.routes.js";
// import paymentRoutes from "./routes/payment.routes.js";
// import restaurantAuthRoutes from "./routes/restaurantAuth.routes.js";
// import dashboardRoutes from "./routes/dashboard.routes.js";
// import restaurantProfileRoutes from "./routes/restaurantProfile.routes.js";
// import restaurantImageRoutes from "./routes/restaurantImage.routes.js";

// const app = express();

// // Allowed frontend origins
// const allowedOrigins = [
//   // Local development
//   "http://localhost:5173",
//   "http://localhost:5174",
//   "http://localhost:5175",

//   // Customer frontend
//   "https://food-hub-2026.vercel.app",
//   "https://customer-ruby-five.vercel.app",
//   "https://customer-ysam.vercel.app",
//   "https://customer-git-main-gouranmol7276-8664s-projects.vercel.app",

//   // Restaurant frontend
//   "https://food-hub-2026-of48.vercel.app",
// ];

// // CORS middleware MUST run before API routes
// app.use(
//   cors({
//     origin: allowedOrigins,
//     credentials: true,
//     methods: [
//       "GET",
//       "HEAD",
//       "POST",
//       "PUT",
//       "PATCH",
//       "DELETE",
//       "OPTIONS",
//     ],
//     allowedHeaders: [
//       "Content-Type",
//       "Authorization",
//     ],
//     optionsSuccessStatus: 204,
//   })
// );

// // Parse request bodies and cookies
// app.use(express.json({ strict: false }));
// app.use(express.urlencoded({ extended: true }));
// app.use(cookieParser());

// // Request logging
// app.use((req, res, next) => {
//   console.log(
//     `[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`,
//     "| Origin:",
//     req.headers.origin || "none"
//   );
//   next();
// });

// // Health check
// app.get("/", (req, res) => {
//   res.status(200).json({
//     success: true,
//     message: "FoodHub API is running 🚀",
//   });
// });

// // API routes
// app.use("/api/auth", authRoutes);
// app.use("/api/auth/restaurant", restaurantAuthRoutes);
// app.use("/api/restaurants", restaurantRoutes);
// app.use("/api/restaurant/profile", restaurantProfileRoutes);
// app.use("/api/categories", categoryRoutes);
// app.use("/api/menu", menuRoutes);
// app.use("/api/cart", cartRoutes);
// app.use("/api/orders", orderRoutes);
// app.use("/api/reviews", reviewRoutes);
// app.use("/api/delivery", deliveryRoutes);
// app.use("/api/payment", paymentRoutes);
// app.use("/api/dashboard", dashboardRoutes);
// app.use("/api/restaurant-image", restaurantImageRoutes);

// // Handle unknown routes
// app.use((req, res) => {
//   res.status(404).json({
//     success: false,
//     message: `Route not found: ${req.method} ${req.originalUrl}`,
//   });
// });

// // Central error handler - keep this last
// app.use((err, req, res, next) => {
//   console.error("Backend error:", err);

//   if (res.headersSent) {
//     return next(err);
//   }

//   const statusCode = err.status || err.statusCode || 500;

//   res.status(statusCode).json({
//     success: false,
//     message:
//       statusCode >= 500
//         ? "Internal server error"
//         : err.message || "Request failed",
//   });
// });

// export default app;


import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.routes.js";
import restaurantRoutes from "./routes/restaurant.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import menuRoutes from "./routes/menu.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import orderRoutes from "./routes/order.routes.js";
import reviewRoutes from "./routes/review.routes.js";
import deliveryRoutes from "./routes/delivery.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import restaurantAuthRoutes from "./routes/restaurantAuth.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import restaurantProfileRoutes from "./routes/restaurantProfile.routes.js";
import restaurantImageRoutes from "./routes/restaurantImage.routes.js";

const app = express();

// ============================================
// 1. CORS CONFIGURATION
// ============================================

const allowedOrigins = [
  // Local development
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",

  // Customer frontend
  "https://food-hub-2026.vercel.app",
  "https://customer-ruby-five.vercel.app",
  "https://customer-ysam.vercel.app",
  "https://customer-git-main-gouranmol7276-8664s-projects.vercel.app",

  // Current Vercel preview deployment
  "https://food-hub-2026-git-main-gouranmol7276-8664s-projects.vercel.app",

  // Restaurant frontend
  "https://food-hub-2026-of48.vercel.app",

  // Additional frontend URLs from Render environment
  ...(process.env.FRONTEND_URLS || "")
    .split(",")
    .map((url) => url.trim().replace(/\/$/, ""))
    .filter(Boolean),
];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests without Origin (Postman/server-to-server)
    if (!origin) {
      return callback(null, true);
    }

    // Check exact allowed origins
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Allow preview deployments belonging to this Vercel project
    const isVercelPreview =
      /^https:\/\/food-hub-2026-[a-z0-9-]+-gouranmol7276-8664s-projects\.vercel\.app$/i.test(
        origin
      );

    if (isVercelPreview) {
      return callback(null, true);
    }

    console.error("CORS blocked origin:", origin);

    return callback(new Error("Origin not allowed by CORS"));
  },

  credentials: true,

  methods: [
    "GET",
    "HEAD",
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
    "OPTIONS",
  ],

  allowedHeaders: [
    "Content-Type",
    "Authorization",
  ],

  optionsSuccessStatus: 204,
};

// CORS must execute before all API routes and middleware
app.use(cors(corsOptions));

// ============================================
// 2. BODY PARSING AND COOKIE MIDDLEWARE
// ============================================

app.use(express.json({ strict: false }));

app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(cookieParser());

// ============================================
// 3. REQUEST LOGGING
// ============================================

app.use((req, res, next) => {
  console.log(
    `[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`,
    "| Origin:",
    req.headers.origin || "none"
  );

  next();
});

// ============================================
// 4. HEALTH CHECK
// ============================================

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "FoodHub API is running 🚀",
    environment: process.env.NODE_ENV || "development",
  });
});

// ============================================
// 5. API ROUTES
// ============================================

// Authentication
app.use("/api/auth", authRoutes);
app.use("/api/auth/restaurant", restaurantAuthRoutes);

// Restaurant
app.use("/api/restaurants", restaurantRoutes);
app.use("/api/restaurant/profile", restaurantProfileRoutes);
app.use("/api/restaurant-image", restaurantImageRoutes);

// Categories and Menu
app.use("/api/categories", categoryRoutes);
app.use("/api/menu", menuRoutes);

// Customer Cart
app.use("/api/cart", cartRoutes);

// Orders and Reviews
app.use("/api/orders", orderRoutes);
app.use("/api/reviews", reviewRoutes);

// Delivery
app.use("/api/delivery", deliveryRoutes);

// Payments
app.use("/api/payment", paymentRoutes);

// Dashboard
app.use("/api/dashboard", dashboardRoutes);

// ============================================
// 6. UNKNOWN ROUTE HANDLER
// ============================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// ============================================
// 7. CENTRAL ERROR HANDLER
// ============================================

app.use((err, req, res, next) => {
  console.error("Backend error:", err);

  if (res.headersSent) {
    return next(err);
  }

  const statusCode = err.status || err.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message:
      statusCode >= 500
        ? "Internal server error"
        : err.message || "Request failed",
  });
});

// ============================================
// 8. EXPORT APP
// ============================================

export default app;

