import { Prisma } from "@prisma/client";
import { ZodError, ZodIssue } from "zod/v3";

export type ErrorCode =
  | "BAD_REQUEST"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "SERVER_ERROR"
  | "VALIDATION_ERROR"
  | "UNIQUE_CONSTRAINT"
  | "FOREIGN_KEY_CONSTRAINT"
  | "FIELD_LENGTH_EXCEEDED"
  | "PRISMA_ERROR"
  | "ERROR";

export interface FormattedError {
  code: ErrorCode;
  status: number;
  message: string;
  details?: any;
}

export const errorFormater = (
  error: unknown,
  defaultStatus = 400,
  defaultCode: ErrorCode = "ERROR",
): FormattedError => {
  // Zod
  if (error instanceof ZodError) {
    return {
      status: 400,
      code: "VALIDATION_ERROR",
      message: "Invalid request data.",
      details: error.errors.map((issue: ZodIssue) => ({
        field: issue.path.join("."),
        message: issue.message,
        ...("code" in issue ? { code: (issue as any).code } : {}),
        ...("expected" in issue ? { expected: (issue as any).expected } : {}),
        ...("received" in issue ? { received: (issue as any).received } : {}),
        ...("options" in issue ? { options: (issue as any).options } : {}),
        ...("minimum" in issue ? { minimum: (issue as any).minimum } : {}),
        ...("maximum" in issue ? { maximum: (issue as any).maximum } : {}),
      })),
    };
  }

  // Prisma
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case "P2002":
        return {
          status: 409,
          code: "UNIQUE_CONSTRAINT",
          message: "Duplicate record found.",
          details: error.meta || undefined,
        };
      case "P2025":
        return {
          status: 404,
          code: "NOT_FOUND",
          message: "Resource not found.",
          details: error.meta || undefined,
        };
      case "P2003":
        return {
          status: 400,
          code: "FOREIGN_KEY_CONSTRAINT",
          message: "Foreign key constraint failed.",
          details: error.meta || undefined,
        };
      case "P2000":
        return {
          status: 400,
          code: "FIELD_LENGTH_EXCEEDED",
          message: "Field length exceeded.",
          details: error.meta || undefined,
        };
      default:
        return {
          status: 500,
          code: "PRISMA_ERROR",
          message: error.message,
          details: error.meta || undefined,
        };
    }
  }

  // Generic error String
  if (typeof error === "string") {
    return {
      status: defaultStatus,
      code: defaultCode,
      message: error,
    };
  }

  // Generic Error
  if (error instanceof Error) {
    return {
      status: defaultStatus,
      code: defaultCode,
      message: error.message,
    };
  }

  // Fallback
  return {
    status: defaultStatus,
    code: defaultCode,
    message: "An unknown error occurred.",
  };
};
