import { Router } from "express";
import apiRouter from "./api.js";

const router = Router();

router.use("/api", apiRouter); //router trả về api (dữ liệu dạng json)

export default router;
