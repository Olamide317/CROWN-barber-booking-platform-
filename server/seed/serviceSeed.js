import mongoose from "mongoose";
import dotenv from "dotenv";
import Service from "../models/Service.js";

dotenv.config();

const services = [
  {
    name: "Classic Haircut",
    description: "A clean and traditional haircut tailored to your preferred style.",
    price: 5000,
    duration: 45,
  },
  {
    name: "Skin Fade",
    description: "A sharp fade that gradually blends down to the skin.",
    price: 6000,
    duration: 45,
  },
  {
    name: "Low Fade",
    description: "A subtle fade that starts low around the ears and neckline.",
    price: 5500,
    duration: 45,
  },
  {
    name: "Mid Fade",
    description: "A balanced fade that starts around the middle of the sides.",
    price: 5500,
    duration: 45,
  },
  {
    name: "High Fade",
    description: "A bold fade that starts higher on the sides of the head.",
    price: 6000,
    duration: 45,
  },
  {
    name: "Bald Fade",
    description: "A smooth fade that blends completely down to the skin.",
    price: 6500,
    duration: 50,
  },
  {
    name: "Taper Fade",
    description: "A clean taper around the temples and neckline.",
    price: 5500,
    duration: 45,
  },
  {
    name: "Hair Design",
    description: "Creative patterns and designs shaved into the hair.",
    price: 7000,
    duration: 60,
  },
  {
    name: "Beard Trim",
    description: "A professional beard trim to maintain a clean appearance.",
    price: 3000,
    duration: 20,
  },
  {
    name: "Beard Shaping",
    description: "Detailed shaping and definition of the beard.",
    price: 4000,
    duration: 30,
  },
  {
    name: "Box Braids",
    description: "Classic box braids styled according to your preferred look.",
    price: 15000,
    duration: 180,
  },
  {
    name: "Cornrows",
    description: "Neat and detailed cornrow braiding.",
    price: 12000,
    duration: 120,
  },
  {
    name: "Knotless Braids",
    description: "Lightweight knotless braids designed for a comfortable finish.",
    price: 18000,
    duration: 210,
  },
  {
    name: "Loc Maintenance",
    description: "Professional maintenance and grooming for locs.",
    price: 10000,
    duration: 90,
  },
  {
    name: "Hair Coloring",
    description: "Professional hair coloring using your selected shade.",
    price: 15000,
    duration: 120,
  },
  {
    name: "Hair Highlights",
    description: "Strategically placed highlights for added dimension and style.",
    price: 12000,
    duration: 90,
  },
  {
    name: "Deep Conditioning",
    description: "A deep conditioning treatment designed to nourish the hair.",
    price: 7000,
    duration: 45,
  },
  {
    name: "Scalp Treatment",
    description: "A professional treatment focused on scalp care and maintenance.",
    price: 6000,
    duration: 45,
  },
  {
    name: "Head Massage",
    description: "A relaxing scalp and head massage session.",
    price: 5000,
    duration: 30,
  },
  {
    name: "Facial",
    description: "A professional facial treatment for refreshed and clean skin.",
    price: 8000,
    duration: 60,
  },
];

const seedServices = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("Connected to MongoDB");

    await Service.deleteMany({});

    await Service.insertMany(services);

    console.log("Services seeded successfully");

    await mongoose.connection.close();
  } catch (error) {
    console.error("Error seeding services:", error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

seedServices();