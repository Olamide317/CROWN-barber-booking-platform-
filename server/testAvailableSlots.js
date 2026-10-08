import dotenv from "dotenv";
import mongoose from "mongoose";
import { getAvailableSlots } from "./utils/bookingUtils.js";

dotenv.config();

const runTest = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected");

    const slots = await getAvailableSlots({
      serviceId: "6ac0fa87fd410ba77c39e2e6",
      date: "2026-10-10",
    });

    console.log(slots);
  } catch (error) {
    console.error(error);
  } finally {
    await mongoose.connection.close();
  }
};

runTest();