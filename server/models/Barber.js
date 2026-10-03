import mongoose from "mongoose";

const barberSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    bio: {
      type: String,
      trim: true,
      maxlength: 500,
    },

    skills: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Service",
      },
    ],

    experience: {
      type: Number,
      min: 0,
    },

    profileImage: {
      type: String,
      default: "",
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    availability: {
      monday: {
        isWorking: { type: Boolean, default: true },
        startTime: { type: String, default: "09:30" },
        endTime: { type: String, default: "21:30" },
      },

      tuesday: {
        isWorking: { type: Boolean, default: true },
        startTime: { type: String, default: "09:30" },
        endTime: { type: String, default: "21:30" },
      },

      wednesday: {
        isWorking: { type: Boolean, default: true },
        startTime: { type: String, default: "09:30" },
        endTime: { type: String, default: "21:30" },
      },

      thursday: {
        isWorking: { type: Boolean, default: true },
        startTime: { type: String, default: "09:30" },
        endTime: { type: String, default: "21:30" },
      },

      friday: {
        isWorking: { type: Boolean, default: true },
        startTime: { type: String, default: "09:30" },
        endTime: { type: String, default: "21:30" },
      },

      saturday: {
        isWorking: { type: Boolean, default: true },
        startTime: { type: String, default: "10:00" },
        endTime: { type: String, default: "22:00" },
      },

      sunday: {
        isWorking: { type: Boolean, default: false },
        startTime: { type: String, default: "" },
        endTime: { type: String, default: "" },
      },
    },
  },
  {
    timestamps: true,
  },
);

const Barber = mongoose.model("Barber", barberSchema);

export default Barber;