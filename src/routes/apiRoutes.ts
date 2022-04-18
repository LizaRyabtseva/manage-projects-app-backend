import express from "express";
import * as apiControllers from '../controllers/apiControllers';
import {PrismaClient} from '@prisma/client';
// import {body, CustomValidator} from 'express-validator';

const router = express.Router();

router.get('/users/find', apiControllers.findHandler);
router.get('/projects/find', apiControllers.findHandler);

export default router;
