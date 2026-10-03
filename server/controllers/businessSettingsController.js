import BusinessSettings from "../models/BusinessSettings.js";
import { StatusCodes } from "http-status-codes";

export const getBusinessSettings = async (req, res) => {
  try {
    const settings = await BusinessSettings.findOne();

    if (!settings) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: "Business settings not found",
        status: false,
      });
    }

    return res.status(StatusCodes.OK).json({
      message: "Business settings fetched successfully",
      status: true,
      settings,
    });
  } catch (error) {
    console.error(error);

    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Server error",
      status: false,
    });
  }
};

export const updateBusinessSettings = async (req, res) => {
  try {
    const {
      bookingWindowDays,
      minimumBookingNoticeMinutes,
      minimumAvailableBarbers,
      bookingSlotInterval,
    } = req.body;

    const settings = await BusinessSettings.findOne();

    if (!settings) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: "Business settings not found",
        status: false,
      });
    }

    if (bookingWindowDays !== undefined) {
      settings.bookingWindowDays = bookingWindowDays;
    }

    if (minimumBookingNoticeMinutes !== undefined) {
      settings.minimumBookingNoticeMinutes = minimumBookingNoticeMinutes;
    }

    if (minimumAvailableBarbers !== undefined) {
      settings.minimumAvailableBarbers = minimumAvailableBarbers;
    }

    if (bookingSlotInterval !== undefined) {
      settings.bookingSlotInterval = bookingSlotInterval;
    }

    await settings.save();

    return res.status(StatusCodes.OK).json({
      message: "Business settings updated successfully",
      status: true,
      settings,
    });
  } catch (error) {
    console.error(error);

    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Server error",
      status: false,
    });
  }
};
