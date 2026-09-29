import User from "../models/User.js";
import { StatusCodes } from "http-status-codes";
import bcrypt from "bcrypt";
import { generateToken } from "../utils/generateToken.js";

export const registerUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone } = req.body;

    if (!firstName || !lastName || !email || !password || !phone) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Fill all required fields",
        status: false,
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(StatusCodes.CONFLICT).json({
        message: "Email already in use",
        status: false,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phone,
    });

    const token = generateToken(user);

    return res.status(StatusCodes.CREATED).json({
      message: "You have successfully created an account",
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        role: user.role,
      },
      token,
      status: true,
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Server error",
    });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Email and password are required",
        status: false,
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      res.status(StatusCodes.UNAUTHORIZED).json({
        message: "Invalid email or password",
        status: false,
      });
      return;
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      res.status(StatusCodes.UNAUTHORIZED).json({
        message: "Invalid email or password",
        status: false,
      });
      return;
    }

    const token = generateToken(user);
    return res.status(StatusCodes.OK).json({
      message: "Login successful",
      token,
      status: true,
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Server error",
    });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: "User not found",
        status: false,
      });
    }

    return res.status(StatusCodes.OK).json({
      message: "Profile fetched successfully",
      status: true,
      user,
    });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Server error",
    });
  }
};

export const updateService = async (req, res) => {
  try {
    const { name, description, price, duration } = req.body;

    const service = await Service.findById(req.params.id);

    if (!service || !service.isActive) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: "Service not found",
        status: false,
      });
    }

    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          message: "Service name cannot be empty",
          status: false,
        });
      }

      service.name = name.trim();
    }

    if (description !== undefined) {
      if (!description.trim()) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          message: "Service description cannot be empty",
          status: false,
        });
      }

      service.description = description.trim();
    }

    if (price !== undefined) {
      if (typeof price !== "number" || price < 0) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          message: "Price must be a valid non-negative number",
          status: false,
        });
      }

      service.price = price;
    }

    if (duration !== undefined) {
      if (typeof duration !== "number" || duration <= 0) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          message: "Duration must be a number greater than 0",
          status: false,
        });
      }

      service.duration = duration;
    }

    await service.save();

    return res.status(StatusCodes.OK).json({
      message: "Service updated successfully",
      status: true,
      service,
    });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Server error",
      status: false,
    });
  }
};