import { z } from "zod";

export const RESTORE_CONFIRMATION_TEXT = "SUHUMOBIL RESTORE";

export const restoreConfirmSchema = z.object({
  confirmationText: z.literal(RESTORE_CONFIRMATION_TEXT, {
    errorMap: () => ({ message: `Ketik persis "${RESTORE_CONFIRMATION_TEXT}" untuk konfirmasi` }),
  }),
});

export type RestoreConfirmInput = z.infer<typeof restoreConfirmSchema>;
