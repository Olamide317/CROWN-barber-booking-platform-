import express from "express";
import {
  createService,
  getAllServices,
  getOneService,
  updateService,
  deactivateService,
  activateService,
} from "../controllers/serviceController.js";
import authenticate from "../middleware/authMiddleware.js";
import authorize from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post("/create", authenticate, authorize("admin"), createService);
router.get("/", getAllServices);
router.get("/:id", getOneService);
router.patch("/:id", authenticate, authorize("admin"), updateService);
router.patch("/:id/deactivate", authenticate, authorize("admin"), deactivateService);
router.patch("/:id/activate", authenticate, authorize("admin"), activateService);

export default router;