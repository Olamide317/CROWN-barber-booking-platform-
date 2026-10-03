import express from "express";
import {
  createBarber,
  getAllBarbers,
  getOneBarber,
  updateBarber,
  deactivateBarber,
  activateBarber,
  updateBarberAvailability,
} from "../controllers/barberController.js";
import authenticate from "../middleware/authMiddleware.js";
import authorize from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post("/", authenticate, authorize("admin"), createBarber);
router.get("/", getAllBarbers);
router.get("/:id", getOneBarber);
router.patch("/:id", authenticate, updateBarber);
router.patch(
  "/:id/deactivate",
  authenticate,
  authorize("admin"),
  deactivateBarber,
);
router.patch("/:id/activate", authenticate, authorize("admin"), activateBarber);
router.patch(
  "/:id/availability",
  authenticate,
  authorize("admin"),
  updateBarberAvailability,
);

export default router;
