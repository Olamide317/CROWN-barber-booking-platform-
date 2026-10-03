import express from "express";
import {
  getBusinessSettings,
  updateBusinessSettings,
} from "../controllers/businessSettingsController.js";
import authenticate from "../middleware/authMiddleware.js";
import authorize from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get(
  "/",
  authenticate,
  authorize("admin"),
  getBusinessSettings,
);

router.patch(
  "/",
  authenticate,
  authorize("admin"),
  updateBusinessSettings,
);

export default router;