import { NextFunction, Request, Response } from "express";
import prisma from "../config/prismaDb";
import { AuthRequest } from "../middlewares/authenticate";
import { calculateDays } from "../utils/daysCalculate";

const createTarget = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authReq = req as AuthRequest;
  const userId = authReq.userId;
  const currentTarget = await prisma.targets.findFirst({
    where: {
      AND: { userId: userId, isActive: true },
    },
  });

  if (currentTarget) {
    return next(new Error("You Already have a target to complete"));
  }

  const user = await prisma.user.findFirst({
    where: { id: userId },
  });
  if (!user) {
    return next(new Error("User not found"));
  }
  const name = req.body.name;
  let { targetDate, age } = req.query;
  if (targetDate) {
    targetDate = new Date(String(targetDate)).toISOString();
  }
  if (age && user?.dob && !targetDate) {
    const targetDate = new Date();
    targetDate.setFullYear(user?.dob.getFullYear() + Number(age));
    return res.json({ targetDate });
  }
  if (!targetDate) {
    return next(new Error("Target date is required"));
  }
  const noOfDays = calculateDays(targetDate);
  if (Number(noOfDays) <= 0) {
    return next(new Error("Target date should be in the future"));
  }

  try {
    const setTarget = await prisma.targets.create({
      data: {
        userId: userId,
        targetDate: targetDate,
        isActive: false,
        noOfDays: Number(noOfDays),
        startDate: new Date(),
        targetName: name,
      },
      select: {
        id: true,
        targetDate: true,
        isActive: true,
        noOfDays: true,
        startDate: true,
        targetName: true,
      },
    });
    if (setTarget) {
      return res.json({
        message: "Target set successfully",
        target: setTarget,
      });
    }
  } catch (error) {
    console.error(error);
    return next(new Error("Error in setting target"));
  }
  return res.json({ message: " Target set successfully" });
};

const listTargets = async (req: Request, res: Response, next: NextFunction) => {
  const authReq = req as AuthRequest;
  const userId = authReq.userId;
  if (!userId) {
    return next(new Error("User not found"));
  }
  const user = await prisma.user.findFirst({
    where: { id: userId },
  });
  if (!user) {
    return next(new Error("User not found"));
  }

  const target = await prisma.targets.findMany({
    where: { userId: userId },
    select: {
      id: true,
      targetDate: true,
      isActive: true,
      noOfDays: true,
      startDate: true,
      targetName: true,
    },
    orderBy: {
      startDate: "desc",
    },
  });
  if (target.length === 0) {
    return res.json({ message: "No targets found" });
  }
  return res.json({ targets: target });
};
export { createTarget, listTargets };
