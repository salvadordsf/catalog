import { Response, Request, NextFunction } from "express";
import { HttpResponse } from "../utils/http-response.util";
import { Prisma } from "@prisma/client";

export const prismaErrorHandler = (
  error: unknown,
  _req: Request,
  res: Response,
  next: NextFunction,
): void => {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case "P2025":
        HttpResponse.notFound(res, error);
        return;
      case "P2002":
        HttpResponse.conflict(res, error);
        return;
      case "P2003":
        HttpResponse.badRequest(res, error);
        return;
      case "P2000":
        HttpResponse.badRequest(res, error);
        return;
      default:
        HttpResponse.serverError(res, `Prisma error: ${error.message}.`);
        return;
    }
  }

  next(error);
};
