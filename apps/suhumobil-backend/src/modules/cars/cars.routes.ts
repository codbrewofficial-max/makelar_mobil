import { Router } from "express";
import {
  getCars,
  getCarBySlug,
  getAdminCars,
  getAdminCarDetail,
  postCar,
  putCar,
  patchCarStatus,
  removeCar,
} from "./cars.controller";
import { validateBody, validateQuery } from "../../middleware/validate-request";
import {
  createCarSchema,
  updateCarSchema,
  updateCarStatusSchema,
  listCarsQuerySchema,
  listAdminCarsQuerySchema, // 🆕
} from "./cars.schema";
import { authGuard } from "../../middleware/auth-guard";
import carImagesRouter from "../car-images/car-images.routes";

const router = Router();

// Public
router.get("/cars", validateQuery(listCarsQuerySchema), getCars);
router.get("/cars/:slug", getCarBySlug);

// Admin
router.get("/admin/cars", authGuard, validateQuery(listAdminCarsQuerySchema), getAdminCars); // 🆕 validateQuery ditambahkan
router.get("/admin/cars/:id", authGuard, getAdminCarDetail);
router.post("/admin/cars", authGuard, validateBody(createCarSchema), postCar);
router.put("/admin/cars/:id", authGuard, validateBody(updateCarSchema), putCar);
router.patch("/admin/cars/:id/status", authGuard, validateBody(updateCarStatusSchema), patchCarStatus);
router.delete("/admin/cars/:id", authGuard, removeCar);

// Car images nested routes (/admin/cars/:id/images...)
router.use(carImagesRouter);

export default router;
