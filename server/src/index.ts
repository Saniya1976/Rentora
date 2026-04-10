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

app.get("/", (_req, res) => {
  res.send("This is home route");
});
app.use("/auth", authRoutes);
app.use("/applications", applicationRoutes);
app.use("/properties", propertyRoutes);
app.use("/leases", leaseRoutes);
// Auth middleware applied per-route (not globally) so that POST /managers
// and POST /tenants (registration) don't require a pre-existing role in JWT
app.use("/tenants", tenantRoutes);
app.use("/managers", managerRoutes);


const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});