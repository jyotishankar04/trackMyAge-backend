import { NextFunction, Request, Response } from "express";

import {
  userLoginSchema,
  userRegistrationSchema,
} from "../middlewares/zodValidator";
import { AuthRequest } from "../middlewares/authenticate";
import createHttpError from "http-errors";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import prisma from "../config/prismaDb";
import { config } from "../config/config";
import { date } from "zod";
import { dateToDatetimeConverter } from "../utils/dateToDatetimeConverter";
import { calculateAge, calculateSpanAge } from "../utils/ageCalculater";
import { getTargetStatistics } from "../utils/allStats";
import { calculateCompletedDays, calculateDays } from "../utils/daysCalculate";
const userRegistration = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const validation = await userRegistrationSchema.safeParseAsync(req.body);
  if (!validation.success) {
    return next(createHttpError("400", "Invalid Input information"));
  }

  const { name, email, password } = req.body;
  try {
    const isExist = await prisma.user.findFirst({
      where: { email },
    });
    if (isExist) {
      return next(createHttpError("400", "Email already exists"));
    }
  } catch (error) {
    console.error(error);
    return next(createHttpError("500", "Error in checking email existence"));
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });
    if (!user) {
      return next(createHttpError("500", "Error in user Registration"));
    }
    const token = jwt.sign({ sub: user.id }, config.JWT_SECRET as string);
    return res
      .cookie("accessToken", token)
      .json({ message: "User Registration Successful" });
  } catch (error) {
    console.error(error);
    return next(createHttpError("500", "Error in user Registration"));
  }
  return;
};

const userLogin = async (req: Request, res: Response, next: NextFunction) => {
  const validationResult = await userLoginSchema.safeParseAsync(req.body);
  if (!validationResult.success) {
    return next(createHttpError("400", "Invalid Input information"));
  }
  const { email, password } = req.body;
  try {
    const isExist = await prisma.user.findFirst({
      where: { email },
    });
    if (!isExist) {
      return next(createHttpError("404", "User do not exist"));
    }
    const isMatch = await bcrypt.compare(password, isExist.password);
    if (!isMatch) {
      return next(createHttpError("401", "Invalid Password"));
    }
    const token = jwt.sign({ sub: isExist.id }, config.JWT_SECRET as string);
    return res
      .cookie("accessToken", token)
      .json({ message: "User logged in successfully" });
  } catch (error) {
    console.error(error);
    return next(createHttpError("500", "Error in checking email existence"));
  }
  return;
};

const userDataUpdate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const _req = req as AuthRequest;
  const { dob } = req.body;
  const userId = _req.userId;
  const idExists = await prisma.user.findFirst({
    where: { id: userId },
  });
  if (!idExists) {
    return next(createHttpError("404", "User not found"));
  }
  const dateOfBirth = dateToDatetimeConverter(dob);
  const age = calculateAge(String(dateOfBirth));

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      dob: dateOfBirth,
      age: age as number,
    },
  });
  if (!user) {
    return next(createHttpError("500", "Error in user data update"));
  }
  return res.json({ message: "User data updated successfully" });
};

const getUserProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const _req = req as AuthRequest;
  const userId = _req.userId;
  try {
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        dob: true,
        age: true,
      },
    });

    if (!user) {
      return next(createHttpError(404, "User not found"));
    }
    const target = await prisma.targets.findFirst({
      where: {
        AND: {
          userId: userId,
          isActive: true,
        },
      },
      select: {
        id: true,
        targetName: true,
        targetDate: true,
        isActive: true,
        noOfDays: true,
        startDate: true,
        productivityLogs: {
          select: {
            id: true,
            productivityRating: true,
            date: true,
            description: true,
            idProductive: true,
          },
          orderBy: {
            date: "asc",
          },
        },
      },
    });
    if (!target) {
      return res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        dob: user.dob,
        age: user.age,
        targets: null,
      });
    }

    const targetAge = calculateSpanAge(
      user.age.toLocaleString(),
      target.targetDate.toISOString()
    );
    const completedDays = calculateCompletedDays(
      target.startDate.toISOString()
    );
    const productiveDays = target.productivityLogs.filter(
      (log: any) => log.isProductive
    ).length;

    const completePercentage = (Number(completedDays) / target.noOfDays) * 100;
    const unproductiveDays = Number(completedDays) - productiveDays;

    const daysRemaining = target.noOfDays - Number(completedDays);
    const avgRating =
      target.productivityLogs.reduce(
        (sum, log) => sum + Number(log.productivityRating),
        0
      ) / Number(completedDays);

    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      dob: user.dob,
      age: user.age,
      targets: {
        id: target?.id,

        targetName: target?.targetName,
        targetDate: target?.targetDate,
        isActive: target?.isActive,
        noOfDays: target?.noOfDays,
        startDate: target?.startDate,
        daysRemaining: daysRemaining,
        targetAge: targetAge,
        productiveDays: productiveDays,
        completePercentage: completePercentage,
        completedDays: completedDays,
        unproductiveDays: unproductiveDays,
        avgRating: avgRating,
      },
      productivityLogs: target.productivityLogs,
    };

    return res.json({ user: userData });
  } catch (error) {
    console.error(error);
    return next(createHttpError(500, "Error in fetching user profile"));
  }
};

const userLogout = async (req: Request, res: Response, next: NextFunction) => {
  res
    .clearCookie("accessToken")
    .json({ message: "User logged out successfully" });
};
export { userRegistration, userLogin, userDataUpdate, getUserProfile };
