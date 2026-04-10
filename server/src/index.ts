import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

dotenv.config();
const app = express();
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));

// Webhook route must be before body-parser.json() to get raw body
app.post(
  "/payments/webhook",
  express.raw({ type: "application/json" }),
  (req, res, next) => {
    // This is handled by paymentRoutes, but we need to ensure it's not JSON parsed before
    // We don't call next() if we handle it here, but usually it's cleaner in routes.
    // So we just apply raw parser here and call next to let paymentRoutes handle it.
    next();
  }
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
import fs from "fs";
app.use(cors());
app.use((req, res, next) => {
  const logLine = `${new Date().toISOString()} - ${req.method} ${req.url} ${JSON.stringify(req.body)}\n`;
  fs.appendFileSync("logs.txt", logLine);
  console.log(logLine);
  next();
});
import tenantRoutes from "./routes/tenantRoutes";
import managerRoutes from "./routes/managerRoutes";
import propertyRoutes from "./routes/propertyRoutes";
import leaseRoutes from "./routes/leaseRoutes";
import applicationRoutes from "./routes/applicationRoutes";
import authRoutes from "./routes/authRoutes";
import paymentRoutes from "./routes/paymentRoutes";

app.get("/", (_req, res) => {
  res.send("This is home route");
});
app.use("/auth", authRoutes);
app.use("/applications", applicationRoutes);
app.use("/properties", propertyRoutes);
app.use("/leases", leaseRoutes);
app.use("/tenants", tenantRoutes);
app.use("/managers", managerRoutes);
app.use("/payments", paymentRoutes);


const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});