import { Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";

// Extend Express Request to include correlationId
declare module "express-serve-static-core" {
  interface Request {
    correlationId?: string;
  }
}

export const correlationIdMiddleware = (req: Request, res: Response, next: NextFunction) => {
    console.log("inside correlationIdMiddleware function")
  let correlationId = req.headers["x-correlation-id"] as string | undefined;

  if (!correlationId) {
    correlationId = uuidv4();
  } else {
    console.log("Received correlationId:", correlationId);
  }

  // Set correlationId in request and response
  req.headers["x-correlation-id"] = correlationId;
  req.correlationId = correlationId;
  res.setHeader("x-correlation-id", correlationId);

  console.log("Current correlationId:", correlationId);
  next();
};
