import Service from "../models/Service.js";
import { StatusCodes } from "http-status-codes";

export const createService = async (req, res) => {
  try {
    const { name, description, price, duration } = req.body;

    if (!name || !name.trim()) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Service name is required",
        status: false,
      });
    }

    if (!description || !description.trim()) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Service description is required",
        status: false,
      });
    }

    if (price === undefined || typeof price !== "number" || price < 0) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Price must be a valid non-negative number",
        status: false,
      });
    }

    if (
      duration === undefined ||
      typeof duration !== "number" ||
      duration <= 0
    ) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Duration must be a number greater than 0",
        status: false,
      });
    }

    const service = await Service.create({
      name: name.trim(),
      description: description.trim(),
      price,
      duration,
    });

    return res.status(StatusCodes.CREATED).json({
      message: "Service created successfully",
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

export const getAllServices = async (req, res) => {
  try {
    const services = await Service.find({ isActive: true });

    if (services.length === 0) {
      return res.status(StatusCodes.OK).json({
        message: "No services are currently available",
        status: true,
        services: [],
      });
    }

    return res.status(StatusCodes.OK).json({
      message: "Services fetched successfully",
      status: true,
      services,
    });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Server error",
      status: false,
    });
  }
};

export const getOneService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service || !service.isActive) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: "Service not found",
        status: false,
      });
    }

    return res.status(StatusCodes.OK).json({
      message: "Service fetched successfully",
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

export const deactivateService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: "Service not found",
        status: false,
      });
    }

    if (!service.isActive) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Service is already inactive",
        status: false,
      });
    }

    service.isActive = false;

    await service.save();

    return res.status(StatusCodes.OK).json({
      message: "Service deactivated successfully",
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

export const activateService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: "Service not found",
        status: false,
      });
    }

    if (service.isActive) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Service is already active",
        status: false,
      });
    }

    service.isActive = true;

    await service.save();

    return res.status(StatusCodes.OK).json({
      message: "Service activated successfully",
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