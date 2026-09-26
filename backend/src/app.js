const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const apiRoutes = require("./routes");
const { errorHandler, notFound } = require("./middleware/error.middleware");

const app = express();

// Build allowed origins list — supports FRONTEND_URL env var plus localhost for dev.
// Also accepts any Vercel preview URL for the same project.
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
];
if (process.env.FRONTEND_URL) {
  // Strip trailing slash if present
  allowedOrigins.push(process.env.FRONTEND_URL.replace(/\/$/, ""));
}

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser requests (curl, Render health checks) and allowed origins
      if (!origin || allowedOrigins.includes(origin) || /\.vercel\.app$/.test(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: origin '${origin}' not allowed`));
      }
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

app.get("/api/health", (req, res) => {
  res.json({ success: true, data: { status: "ok" } });
});

app.use("/api", apiRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
