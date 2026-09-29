import { StatusCodes } from "http-status-codes";

const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(StatusCodes.FORBIDDEN).json({
        message: "You do not have permission to access this resource",
        status: false,
      });
    }

    next();
  };
};

export default authorize;