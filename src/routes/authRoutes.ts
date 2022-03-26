import express from "express";
import * as authControllers from '../controllers/authControllers';
import {PrismaClient} from "@prisma/client";
import {body, CustomValidator} from 'express-validator';

const router = express.Router();
const prisma = new PrismaClient();

const emailValidator: CustomValidator = (req: express.Request) => {
    const email = (req.body as {email: string}).email;
    const userRecord = prisma.user.findUnique({
        where: {
            email: email
        }
    });
    return userRecord.then(user => {
        if (user) {
            return Promise.reject('Email is already in use!')
        }
    });
}

router.post('/sign-up',
    body('email')
        .trim()
        .isEmail()
        .custom(emailValidator),
    authControllers.signUp);

router.get('/users', authControllers.users);

export default router;