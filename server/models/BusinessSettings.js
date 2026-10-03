import mongoose from "mongoose";

const businessSettingsSchema = new mongoose.Schema(
  {
    bookingWindowDays: {
      type: Number,
      required: true,
      min: 1,
      default: 30,
    },

    minimumBookingNoticeMinutes: {
      type: Number,
      required: true,
      min: 0,
      default: 60,
    },

    minimumAvailableBarbers: {
      type: Number,
      required: true,
      min: 0,
      default: 1,
    },

    bookingSlotInterval: {
      type: Number,
      required: true,
      min: 5,
      default: 30,
    },
  },
  {
    timestamps: true,
  },
);

const BusinessSettings = mongoose.model(
  "BusinessSettings",
  businessSettingsSchema,
);

export default BusinessSettings;
