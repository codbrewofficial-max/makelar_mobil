import type { Request, Response } from "express";
import {
  listPublicCars,
  getPublicCarBySlug,
  listAdminCars,
  getAdminCarById,
  createCar,
  updateCar,
  updateCarStatus,
  deleteCar,
} from "./cars.service";
import { success } from "../../utils/response";
import { getParam } from "../../utils/http";

export async function getCars(req: Request, res: Response) {
  const query = (req as any).validatedQuery;
  const { data, meta } = await listPublicCars(query);
  res.status(200).json(success(data, "Success", meta));
}

export async function getCarBySlug(req: Request, res: Response) {
  const car = await getPublicCarBySlug(getParam(req, "slug"));
  res.status(200).json(success(car));
}

export async function getAdminCars(_req: Request, res: Response) {
  const cars = await listAdminCars();
  res.status(200).json(success(cars));
}

export async function getAdminCarDetail(req: Request, res: Response) {
  const car = await getAdminCarById(getParam(req, "id"));
  res.status(200).json(success(car));
}

export async function postCar(req: Request, res: Response) {
  const car = await createCar(req.body, req.user!.id);
  res.status(201).json(success(car));
}

export async function putCar(req: Request, res: Response) {
  const car = await updateCar(getParam(req, "id"), req.body, req.user!.id);
  res.status(200).json(success(car));
}

export async function patchCarStatus(req: Request, res: Response) {
  const result = await updateCarStatus(getParam(req, "id"), req.body.status, req.user!.id);
  res.status(200).json(success(result));
}

export async function removeCar(req: Request, res: Response) {
  await deleteCar(getParam(req, "id"), req.user!.id);
  res.status(200).json(success(null));
}
