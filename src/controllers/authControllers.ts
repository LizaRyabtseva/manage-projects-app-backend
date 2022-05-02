import {RequestHandler} from 'express';
import {validationResult} from 'express-validator';
import bcrypt from 'bcryptjs';
import jsonwebtoken from 'jsonwebtoken';
import HttpError from '../errors/HttpError';
import NotFoundError from '../errors/NotFoundError';
import {PrismaClient} from '@prisma/client';

const prisma = new PrismaClient();

export const signUp: RequestHandler = async (req, res, next) => {
    const errors = validationResult(req);
   
    const name = (req.body as {name: string}).name;
    const login = (req.body as {login: string}).login;
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
                    login: login,
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
        
        let token;
        try {
            if (newUser) {
                const secretKey: string = process.env.SECRET_KEY!;
                token = jsonwebtoken.sign({
                    userId: newUser.id,
                    email: newUser.email
                }, secretKey, {
                    expiresIn: '6h'
                });
            }
        } catch (err) {
            next(new HttpError('Registration is failed!'));
        }
        
        
        res.status(201).json({
            message: 'Your account was created!',
            user: newUser,
            token: token,
            expiration: 3600 * 1000 * 60
        });
    } else {
        errors.array().map(e => next(new HttpError(e.msg, 400)));
    }
};

export const login: RequestHandler = async (req, res, next) => {
    const email = (req.body as {email: string}).email;
    const password = (req.body as {password: string}).password;
    
    let user;
    try {
        user = await prisma.user.findUnique({
            where: {
                email: email
            }
        });
    } catch (err) {
        next(new HttpError('Could not find user with entered email!'));
    }
    
    if (user) {
        let token;
        let isValidPassword = false;
        isValidPassword = await bcrypt.compare(password, user.password);
        if (isValidPassword) {
            const secretKey: string = process.env.SECRET_KEY!;
            token = jsonwebtoken.sign({
                userId: user.id,
                email: user.email
            }, secretKey, {
                expiresIn: '6h'
            });
            res.status(200).json({
                user: {
                    id: user.id,
                    name: user.name,
                    login: user.login,
                    email: user.email,
                    currentProject: user.current_project_id
                },
                token,
                expiration: 3600 * 1000 * 6
            });
        } else {
            next(new HttpError('You put wrong data!', 401));
        }
    } else {
        next(new NotFoundError('User was not found!'));
    }
}

export const users: RequestHandler = async (req, res, next) => {
    try {
        const users = await prisma.user.findMany();
        if (users) {
            res.status(200).json({
                users: users
            });
        } else {
            next(new NotFoundError('Users were not found!'));
        }
    } catch (err) {
        console.error(err);
        next(new HttpError('Could not find users!'));
    }
};

