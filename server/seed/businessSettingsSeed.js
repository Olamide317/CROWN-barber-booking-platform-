import dotenv from "dotenv";
import mongoose from "mongoose";
import BusinessSettings from "../models/BusinessSettings.js";

dotenv.config();

const seedBusinessSettings = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("Connected to MongoDB");

    const existingSettings = await BusinessSettings.findOne();

    if (existingSettings) {
      console.log("Business settings already exist");
      return;
    }

    await BusinessSettings.create({
      bookingWindowDays: 30,
      minimumBookingNoticeMinutes: 60,
      minimumAvailableBarbers: 1,
    });

    console.log("Business settings created successfully");
  } catch (error) {
    console.error(error);
  } finally {
    await mongoose.connection.close();
  }
};

seedBusinessSettings();