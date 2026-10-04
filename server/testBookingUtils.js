import dotenv from "dotenv";
import mongoose from "mongoose";
import { hasAppointmentConflict } from "./utils/bookingUtils.js";

dotenv.config();

const test = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("Connected to MongoDB");

    const barberId = "6ac0f7ef0316b5c35fb440b7";

    const requestedStartAt = new Date("2026-10-10T14:30:00+01:00");
    const requestedEndAt = new Date("2026-10-10T15:15:00+01:00");

    const conflict = await hasAppointmentConflict(
      barberId,
      requestedStartAt,
      requestedEndAt,
    );

    console.log("Has conflict:", conflict);
  } catch (error) {
    console.error(error);
  } finally {
    await mongoose.connection.close();
  }
};

test();