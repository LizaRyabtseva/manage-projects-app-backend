import express from "express";
import * as authControllers from '../controllers/authControllers';
import {PrismaClient} from '@prisma/client';
import {body, CustomValidator} from 'express-validator';

const router = express.Router();
const prisma = new PrismaClient();

const emailValidator: CustomValidator = async value => {
    const userRecord = await prisma.user.findUnique({
        where: {
            email: value
        }
    });
    if (userRecord) {
        return Promise.reject('E-mail already in use!');
    }
    return true;
}

router.post('/sign-up',
    body('email')
        .trim()
        .isEmail()
        .custom(emailValidator),
    authControllers.signUp);

router.post('/login', authControllers.login);

router.get('/users', authControllers.users);

export default router;