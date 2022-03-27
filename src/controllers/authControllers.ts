import {RequestHandler} from 'express';
import {validationResult} from 'express-validator';
import {PrismaClient} from '@prisma/client';
import bcrypt from 'bcryptjs';
import HttpError from '../errors/HttpError';
import NotFoundError from '../errors/NotFoundError';

const prisma = new PrismaClient();

export const signUp: RequestHandler = async (req, res, next) => {
    const errors = validationResult(req);
   
    const name = (req.body as {name: string}).name;
    const email = (req.body as {email: string}).email;
    const role = (req.body as {role: string}).role;
    const imgUrl = (req.body as {imgUrl: string}).imgUrl;
    const password = (req.body as {password: string}).password;
    
    if (errors.isEmpty()) {
        const hashedPassword = await bcrypt.hash(password, 12);
        
        let newUser;
        try {
            newUser = await prisma.user.create({
                data: {
                    name: name,
                    email: email,
                    password: hashedPassword,
                    role: role,
                    img_url: imgUrl,
                }
            });
        } catch (err) {
            console.error(err);
            next(new HttpError('Could not create account!'));
        }
        
        res.status(201).json({
            message: 'Your account was created!',
            user: newUser
        });
    } else {
        errors.array().map(e => next(new HttpError(e.msg, 422)));
    }
};

export const users: RequestHandler = async (req, res, next) => {
    try {
        const users = await prisma.user.findMany();
        if (users) {
            res.status(200).json({
                users: users
            });
        } else {
            next(new NotFoundError('Users not found!'));
        }
    } catch (err) {
        console.error(err);
       next(new HttpError());
    }
};

