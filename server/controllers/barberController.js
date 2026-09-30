import Barber from "../models/Barber.js";
import User from "../models/User.js";
import { StatusCodes } from "http-status-codes";

export const createBarber = async (req, res) => {
  try {
    const { user, bio, specialties, experience, profileImage } = req.body;

    if (!user) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "User ID is required",
        status: false,
      });
    }

    const existingUser = await User.findById(user);

    if (!existingUser) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: "User not found",
        status: false,
      });
    }

    if (existingUser.role !== "barber") {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "This user is not registered as a barber",
        status: false,
      });
    }

    const existingBarber = await Barber.findOne({ user });

    if (existingBarber) {
      return res.status(StatusCodes.CONFLICT).json({
        message: "Barber profile already exists",
        status: false,
      });
    }

    const barber = await Barber.create({
      user,
      bio,
      specialties,
      experience,
      profileImage,
    });

    return res.status(StatusCodes.CREATED).json({
      message: "Barber profile created successfully",
      status: true,
      barber,
    });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Server error",
      status: false,
    });
  }
};

export const getAllBarbers = async (req, res) => {
  try {
    const barbers = await Barber.find({ isActive: true }).populate(
      "user",
      "-password",
    );

    if (barbers.length === 0) {
      return res.status(StatusCodes.OK).json({
        message: "No barbers are currently available",
        status: true,
        barbers: [],
      });
    }

    return res.status(StatusCodes.OK).json({
      message: "Barbers fetched successfully",
      status: true,
      barbers,
    });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Server error",
      status: false,
    });
  }
};

export const getOneBarber = async (req, res) => {
  try {
    const barber = await Barber.findOne({
      _id: req.params.id,
      isActive: true,
    }).populate("user", "-password");

    if (!barber) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: "Barber not found",
        status: false,
      });
    }

    return res.status(StatusCodes.OK).json({
      message: "Barber fetched successfully",
      status: true,
      barber,
    });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Server error",
      status: false,
    });
  }
};

export const updateBarber = async (req, res) => {
  try {
    const { bio, specialties, experience, profileImage } = req.body;

    const barber = await Barber.findOne({
      _id: req.params.id,
      isActive: true,
    });

    if (!barber) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: "Barber not found",
        status: false,
      });
    }

    // Admin can update any barber
    if (req.user.role === "admin") {
      if (bio !== undefined) barber.bio = bio.trim();
      if (specialties !== undefined) barber.specialties = specialties;
      if (experience !== undefined) barber.experience = experience;
      if (profileImage !== undefined) barber.profileImage = profileImage;
    }

    // Barber can only update their own profile
    else if (req.user.role === "barber") {
      if (barber.user.toString() !== req.user.id) {
        return res.status(StatusCodes.FORBIDDEN).json({
          message: "You can only update your own barber profile",
          status: false,
        });
      }

      if (bio !== undefined) barber.bio = bio.trim();
      if (specialties !== undefined) barber.specialties = specialties;
      if (experience !== undefined) barber.experience = experience;
      if (profileImage !== undefined) barber.profileImage = profileImage;
    }

    // Everyone else
    else {
      return res.status(StatusCodes.FORBIDDEN).json({
        message: "You do not have permission to update a barber profile",
        status: false,
      });
    }

    await barber.save();

    return res.status(StatusCodes.OK).json({
      message: "Barber profile updated successfully",
      status: true,
      barber,
    });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Server error",
      status: false,
    });
  }
};

export const deactivateBarber = async (req, res) => {
  try {
    const barber = await Barber.findById(req.params.id);

    if (!barber) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: "Barber not found",
        status: false,
      });
    }

    if (!barber.isActive) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Barber is already inactive",
        status: false,
      });
    }

    barber.isActive = false;

    await barber.save();

    return res.status(StatusCodes.OK).json({
      message: "Barber deactivated successfully",
      status: true,
      barber,
    });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Server error",
      status: false,
    });
  }
};

export const activateBarber = async (req, res) => {
  try {
    const barber = await Barber.findById(req.params.id);

    if (!barber) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: "Barber not found",
        status: false,
      });
    }

    if (barber.isActive) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Barber is already active",
        status: false,
      });
    }

    barber.isActive = true;

    await barber.save();

    return res.status(StatusCodes.OK).json({
      message: "Barber activated successfully",
      status: true,
      barber,
    });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Server error",
      status: false,
    });
  }
};