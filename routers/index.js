import Router from "express";
import {
  adminController,
  requestsController,
  vehicleController
} from "../controllers/index.js";

const router = Router();

router.use("/admin", adminController);
router.use("/vehicle", vehicleController);
router.use("/request", requestsController);

export { router };
