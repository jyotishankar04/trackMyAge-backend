import express from "express";
import authenticate from "../middlewares/authenticate";
import { createToday, listLogs } from "./logsControler";

const logsRouter = express.Router();

logsRouter.post("/create/today", authenticate, createToday);
logsRouter.get("/list", authenticate, listLogs);

export default logsRouter;
