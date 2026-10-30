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


// const app = express();

// // Middlewares
// app.use(
//   cors({
//     origin: [
//       "http://localhost:5173",
//       "http://localhost:5174",
//       "http://localhost:5175",
//     ],
//     credentials: true,
//   })
// );
// app.use(express.json({
//   strict: false
// }));
// app.use(express.urlencoded({ extended: true }));
// app.use(cookieParser());
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


// // Health Check Route

// app.use((req, res, next) => {
//   console.log("REQUEST:", req.method, req.url);
//   next();
// });

// app.get("/", (req, res) => {
//   res.status(200).json({
//     success: true,
//     message: "FoodHub API is running 🚀",
//   });
// });

// app.use((err, req, res, next) => {
//   console.log("BODY PARSER ERROR");
//   console.log(err);

//   next(err);
// });


import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.routes.js";
import errorHandler from "./middleware/error.middleware.js";
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

const app = express();

// Allowed frontend origins
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",

  "https://food-hub-2026.vercel.app",
  "https://customer-ruby-five.vercel.app",
  "https://customer-ysam.vercel.app",
  "https://customer-git-main-gouranmol7276-8664s-projects.vercel.app",
];

// CORS middleware: must run before API routes
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests without an Origin header, e.g. server-to-server.
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked origin: ${origin}`));
    },
    credentials: true,
    methods: [
      "GET",
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
  })
);

// Request body and cookie parsing
app.use(express.json({ strict: false }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Request logging
app.use((req, res, next) => {
  console.log("REQUEST:", req.method, req.url);
  next();
});

// Health check
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "FoodHub API is running 🚀",
  });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/auth/restaurant", restaurantAuthRoutes);
app.use("/api/restaurants", restaurantRoutes);
app.use("/api/restaurant/profile", restaurantProfileRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/delivery", deliveryRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/dashboard", dashboardRoutes);

// Body parser error logging
app.use((err, req, res, next) => {
  if (err.type === "entity.parse.failed") {
    console.error("BODY PARSER ERROR:", err.message);
  }

  next(err);
});

// Central error handler
app.use(errorHandler);

export default app;


// app.use(errorHandler);

// export default app;
