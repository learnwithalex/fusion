import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth";
import userRoutes from "./routes/users";
import assetRoutes from "./routes/assets";

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Routes
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/assets", assetRoutes);

app.get("/", (req, res) => {
  res.send("Fusion API is running");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
