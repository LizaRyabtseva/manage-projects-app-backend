import express from "express";
import * as apiControllers from '../controllers/apiControllers';
import {PrismaClient} from '@prisma/client';
// import {body, CustomValidator} from 'express-validator';

const router = express.Router();

router.get('/users/find', apiControllers.findByQuery);
router.get('/projects/find', apiControllers.findByQuery);

export default router;
