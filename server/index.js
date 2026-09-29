import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import authRoutes from "./routes/auth.js";
import serviceRoutes from "./routes/serviceRoutes.js";

const app = express();

dotenv.config();

const PORT = process.env.PORT;
const MONGO_URI = process.env.MONGO_URI;

app.use(express.json());

app.use("/auth", authRoutes);
app.use("/services", serviceRoutes);

async function start() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("My Database is connected");

    app.listen(PORT, () => {
      console.log(`Server is listening on port ${PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
}

start();