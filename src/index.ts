import express, { Request, Response } from "express";
import { config } from "./config/config";
import globalErrorHandler from "./../globalErrorHandler";
import prisma from "./config/prismaDb";
import userRouter from "./user/userRoutes";
const app = express();
import cookieParser from "cookie-parser";
import authenticate from "./middlewares/authenticate";
import targetRouter from "./target/targetRoutes";
import logsRouter from "./productivityLogs/logsRoutes";

app.get("/", authenticate, async (req: Request, res: Response) => {
  return res.json({
    message: "Welcome to TrackMyAge",
  });
});
app.use(cookieParser());
app.use(express.json());
app.use("/api/user", userRouter);
app.use("/api/target", targetRouter);
app.use("/api/logs", logsRouter);

app.use(globalErrorHandler);

export default app;
