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

    specialties: {
      type: [String],
      default: [],
    },

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
  },
  {
    timestamps: true,
  },
);

const Barber = mongoose.model("Barber", barberSchema);

export default Barber;