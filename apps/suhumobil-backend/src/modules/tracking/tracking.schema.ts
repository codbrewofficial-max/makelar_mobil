import { z } from "zod";

export const trackEventSchema = z.object({
  carId: z.string().uuid().optional().nullable(),
  source: z.string().min(1, "Source wajib diisi").max(30),
});

export type TrackEventInput = z.infer<typeof trackEventSchema>;
