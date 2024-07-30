import express, { Request, Response } from "express";
import { config } from "./config/config";
import globalErrorHandler from "./../globalErrorHandler";
import prisma from "./config/prismaDb";
import userRouter from "./user/userRoutes";
const app = express();
import cookieParser from "cookie-parser";
import authenticate from "./middlewares/authenticate";

app.get("/", authenticate, async (req: Request, res: Response) => {
  return res.json({
    message: "Welcome to TrackMyAge",
  });
});
app.use(cookieParser());
app.use(express.json());
app.use("/api/user", userRouter);
app.use(globalErrorHandler);

export default app;
