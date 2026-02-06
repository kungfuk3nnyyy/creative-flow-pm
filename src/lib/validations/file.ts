import { z } from "zod";

export const uploadFileSchema = z.object({
  projectId: z.string().cuid(),
});

export type UploadFileInput = z.infer<typeof uploadFileSchema>;
