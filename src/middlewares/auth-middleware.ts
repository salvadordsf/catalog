import { Request, Response, NextFunction } from "express";
import { auth } from "../lib/auth";
import { fromNodeHeaders } from "better-auth/node";
import { HttpResponse } from "../utils/http-response.util";
import { User } from "@prisma/client";

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session) {
      HttpResponse.unauthorized(res, "Invalid session.");
      return;
    }

    req.user = session.user as unknown as User;

    next();
  } catch (error) {
    HttpResponse.unauthorized(res, "Invalid session.");
    return;
  }
};
