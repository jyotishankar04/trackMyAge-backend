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

  const age = new Date().getFullYear() - new Date(dob).getFullYear();

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      dob: new Date(),
      age: age,
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
    });

    if (!user) {
      return next(createHttpError(404, "User not found"));
    }

    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      dob: user.dob,
      age: user.age,
    };

    return res.json(userData);
  } catch (error) {
    console.error(error);
    return next(createHttpError(500, "Error in fetching user profile"));
  }
};
export { userRegistration, userLogin, userDataUpdate, getUserProfile };
