import mongoose from "mongoose";
import dotenv from "dotenv";
import { findNearbyAvailableSlots } from "./utils/bookingUtils.js";

dotenv.config();

const test = async () => {
  try {
    console.time("Database connection");

    await mongoose.connect(process.env.MONGO_URI);

    console.timeEnd("Database connection");

    console.log("Database connected");

    const requestedStartAt = new Date("2026-10-10T12:00:00+01:00");

    console.time("findNearbyAvailableSlots");

    const alternatives = await findNearbyAvailableSlots({
      serviceId: "6ac0fa87fd410ba77c39e2e6",
      requestedStartAt,
      serviceDuration: 45,
    });

    console.timeEnd("findNearbyAvailableSlots");

    console.log("Number of alternatives:", alternatives.length);

    await mongoose.connection.close();
  } catch (error) {
    console.error(error);
  }
};

test();
