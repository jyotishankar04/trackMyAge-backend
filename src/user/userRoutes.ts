import express, { Request, Response } from "express";
import {
  getUserProfile,
  userDataUpdate,
  userLogin,
  userRegistration,
} from "./userControler";
import authenticate from "../middlewares/authenticate";

const userRouter = express.Router();

userRouter.post("/register", userRegistration);

userRouter.post("/login", userLogin);
userRouter.patch("/update/metadata", authenticate, userDataUpdate);
userRouter.get("/profile", authenticate, getUserProfile);

export default userRouter;
