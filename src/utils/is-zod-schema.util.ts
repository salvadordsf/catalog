import z, { ZodTypeAny } from "zod/v3";

export const isZodSchema = (value: unknown): value is ZodTypeAny => {
  return value instanceof z.ZodType;
};
