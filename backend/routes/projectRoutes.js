import express from "express";
import multer from "multer";
import { body, validationResult } from "express-validator";
import {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  participateInProject,
  leaveProject,
  getMyProjects,
} from "../controllers/projectController.js";

import { authMiddleware } from "../middlewares/authMiddleware.js";
import { authorizeRoles } from "../middlewares/roleMiddleware.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post(
  "/",
  authMiddleware,
  authorizeRoles("organizer", "admin"),
  upload.single("image"),
  [
    body("title")
      .isLength({ min: 3 })
      .withMessage("Title must be at least 3 chars"),
    body("description")
      .isLength({ min: 10 })
      .withMessage("Description must be at least 10 chars"),
    body("dateStart").isISO8601().toDate().withMessage("Invalid start date"),
    body("dateEnd").isISO8601().toDate().withMessage("Invalid end date"),
    body("dateEnd").custom((value, { req }) => {
      if (value && new Date(value) < new Date(req.body.dateStart)) {
        throw new Error("'dateEnd' cannot be earlier than 'dateStart'");
      }
      return true;
    }),
    body("location")
      .optional()
      .isString()
      .isLength({ min: 2 })
      .withMessage("Location must be at least 2 chars"),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  createProject
);

router.get("/", getProjects);
router.get("/my", authMiddleware, getMyProjects);
router.get("/:id", getProjectById);

router.put(
  "/:id",
  authMiddleware,
  authorizeRoles("organizer", "admin"),
  upload.single("image"),
  [
    body("title")
      .optional()
      .isLength({ min: 3 })
      .withMessage("Title must be at least 3 chars"),
    body("description")
      .optional()
      .isLength({ min: 10 })
      .withMessage("Description must be at least 10 chars"),
    body("dateStart")
      .optional()
      .isISO8601()
      .toDate()
      .withMessage("Invalid start date"),
    body("dateEnd")
      .optional()
      .isISO8601()
      .toDate()
      .withMessage("Invalid end date"),
    body("dateEnd").custom((value, { req }) => {
      if (
        value &&
        req.body.dateStart &&
        new Date(value) < new Date(req.body.dateStart)
      ) {
        throw new Error("'dateEnd' cannot be earlier than 'dateStart'");
      }
      return true;
    }),
    body("location")
      .optional()
      .isString()
      .isLength({ min: 2 })
      .withMessage("Location must be at least 2 chars"),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  updateProject
);

router.delete(
  "/:id",
  authMiddleware,
  authorizeRoles("organizer", "admin"),
  deleteProject
);

router.post("/:id/participate", authMiddleware, participateInProject);
router.delete("/:id/participate", authMiddleware, leaveProject);

export default router;
