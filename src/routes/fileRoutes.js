import { Router } from "express";
import { uploadFile, getFiles } from "../controllers/fileController.js";
import upload from "../middlewares/uploadMiddleware.js";

const router = Router();

router.post("/upload", upload.single("archivo"), uploadFile);
router.get("/files", getFiles);

export default router;
