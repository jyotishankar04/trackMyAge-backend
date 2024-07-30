import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import jwt from "jsonwebtoken";
import { config } from "../config/config";
export interface AuthRequest extends Request {
  userId: string;
}
const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const accessToken = req.headers.cookie;
  let token;
  if (accessToken) {
    token = accessToken.split("=")[1];
  } else {
    return res.status(400).json({ message: "Invalid User Token" });
  }
  if (!token) {
    return next(createHttpError("401", "Unauthorized"));
  }

  try {
    const payload = jwt.verify(token, config.JWT_SECRET as string);
    if (!payload) {
      return next(createHttpError("401", "Unauthorized"));
    }
    const _req = req as AuthRequest;
    _req.userId = payload.sub as string;
    next();
  } catch (error) {
    console.error(error);
    return next(createHttpError("500", "Error in authentication"));
  }
};

export default authenticate;
