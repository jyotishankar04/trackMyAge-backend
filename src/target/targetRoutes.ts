import express from "express";
import { createTarget, listTargets } from "./targetControler";
import authenticate from "../middlewares/authenticate";

const targetRouter = express.Router();

targetRouter.post("/create", authenticate, createTarget);
targetRouter.get("/list", authenticate, listTargets);

export default targetRouter;
