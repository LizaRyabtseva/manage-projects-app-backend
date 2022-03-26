import {RequestHandler} from "express";
import {PrismaClient} from "@prisma/client";
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export const signUp: RequestHandler = async (req, res, next) => {
    const name = (req.body as {name: string}).name;
    const email = (req.body as {email: string}).email;
    const role = (req.body as {role: string}).role;
    const imgUrl = (req.body as {imgUrl: string}).imgUrl;
    const password = (req.body as {password: string}).password;

    try {
        const hashedPassword = await bcrypt.hash(password, 12);

        const newPerson = await prisma.user.create({
            data: {
                name: name,
                email: email,
                password: hashedPassword,
                role: role,
                img_url: imgUrl,
            }
        })
        res.status(201).json({
            message: 'Your account was created!',
            person: newPerson
        });
    } catch (err) {
        res.status(500).json({
            message: err
        });
    }
};

export const users: RequestHandler = async (req, res, next) => {
    try {
        const users = await prisma.user.findMany();
        res.status(200).json({
            people: users
        });
    } catch (err) {
        res.status(500).json({
            message: err
        });
    }
};

