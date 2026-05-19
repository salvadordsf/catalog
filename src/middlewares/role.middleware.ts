import { Request, Response, NextFunction } from "express";
import { HttpResponse } from "../utils/http-response.util";

export const rolMiddleware =
  (
    allowedRoles: ("USER" | "EDITOR" | "ADMIN")[],
    ownerCheck?: (
      req: Request,
      res: Response,
    ) => boolean | Promise<boolean | void>,
  ) =>
  async (req: Request, res: Response, next: NextFunction) => {
    //Create the array of allowed roles from within the function to provide greater security
    const allowedRolesFinal = [];

    if (allowedRoles.includes("USER")) allowedRolesFinal.push("USER");
    if (allowedRoles.includes("EDITOR")) allowedRolesFinal.push("EDITOR");
    if (allowedRoles.includes("ADMIN")) allowedRolesFinal.push("ADMIN");

    if (allowedRolesFinal.length < 1) {
      throw new Error("Non valid role");
    }

    const user = req.user;

    if (!user) {
      HttpResponse.unauthorized(res);
      return;
    }

    if (!["USER", "EDITOR", "ADMIN"].includes(user.role)) {
      throw new Error("Non valid user role");
    }

    if (!allowedRoles.includes(user.role)) {
      HttpResponse.forbidden(res);
      return;
    }

    if (ownerCheck) {
      const isOwner = await ownerCheck(req, res);

      if (!isOwner) {
        HttpResponse.forbidden(res, "You are not the owner of this resource");
        return;
      }
    }

    next();
  };
