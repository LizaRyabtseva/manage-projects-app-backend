import {RequestHandler} from "express";
import {person, PrismaClient} from "@prisma/client";
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export const signUp: RequestHandler = async (req, res, next) => {
    const name = (req.body as {name: string}).name;
    const email = (req.body as {email: string}).email;
    const role = (req.body as {role: string}).role;
    const imgUrl = (req.body as {imgUrl: string}).imgUrl;
    const password = (req.body as {password: string}).password;
    const children = (req.body as {children: string}).children;
    try {
        const hashPassword = await bcrypt.hash(password, 12);

        const newPerson = await prisma.person.create({
            data: {
                name: name,
                email: email,
                password: hashPassword,
                role: role,
                imgurl: imgUrl,
            }
        })
        res.status(201).json({
            message: 'Your account was created!',
            // person: newPerson
        });
    } catch (err) {
        res.status(500).json({
            message: err
        });
    }
};

export const people: RequestHandler = async (req, res, next) => {
    try {
        const peopleRecords = await prisma.person.findMany();
        res.status(200).json({
            people: peopleRecords
        });
    } catch (err) {
        res.status(500).json({
            message: err
        });
    }
};

