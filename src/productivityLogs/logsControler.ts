import { NextFunction, Request, Response } from "express";
import { AuthRequest } from "../middlewares/authenticate";
import prisma from "../config/prismaDb";
import { undefined } from "zod";

const createToday = async (req: Request, res: Response, next: NextFunction) => {
  const authReq = req as AuthRequest;
  const userId = authReq.userId;
  const { score, targetId, description } = req.body;
  const isTodayExists = await prisma.productivityLog.findFirst({
    where: {
      AND: { userId, date: new Date() },
    },
  });
  if (isTodayExists) {
    return next(new Error("Today's productivity log already exists"));
  }
  const target = await prisma.targets.findFirst({
    where: { id: targetId },
  });

  if (!target || target.userId !== userId) {
    return next(new Error("Invalid target or user"));
  }
  if (!target.isActive) {
    return next(new Error("Target is not active"));
  }
  if (score > 10) {
    return next(new Error("Score should be between 0 and 10"));
  }
  const isProductive = score >= 5 ? true : false;
  const today = new Date();
  const log = await prisma.productivityLog.create({
    data: {
      productivityRating: score,
      taskId: targetId,
      userId,
      date: today,
      idProductive: isProductive,
      description: description,
    },
  });
  if (!log) {
    return next(new Error("Error in creating today's productivity log"));
  }
  return res.json({ message: "Today's productivity log created successfully" });
};

const listLogs = async (req: Request, res: Response, next: NextFunction) => {
  const authReq = req as AuthRequest;

  const userId = authReq.userId;
  const taskId = req.body.targetId;
  const logs = await prisma.productivityLog.findMany({
    where: { AND: { userId: userId, taskId: taskId } },
    select: {
      id: true,
      productivityRating: true,
      date: true,
      description: true,
      idProductive: true,
      task: {
        select: {
          targetName: true,
          id: true,
        },
      },
      user: {
        select: {
          name: true,
        },
      },
    },
  });
  if (!logs) {
    return next(new Error("Error in fetching logs"));
  }
  return res.json({ logs });
};

export { createToday, listLogs };
