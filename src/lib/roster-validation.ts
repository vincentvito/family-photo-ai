import { z } from "zod";
import { ROSTER_NAME_MAX_LENGTH } from "@/lib/roster-constants";

export const rosterCreateBodySchema = z
  .object({
    name: z.string().trim().min(1).max(ROSTER_NAME_MAX_LENGTH),
    role: z.enum(["adult", "child", "pet"]),
  })
  .strict();

export const rosterPatchBodySchema = z
  .object({
    name: z.string().trim().min(1).max(ROSTER_NAME_MAX_LENGTH).optional(),
    role: z.enum(["adult", "child", "pet"]).optional(),
  })
  .strict();
