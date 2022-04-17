import {RequestHandler} from "express";
import {PrismaClient} from "@prisma/client";
import HttpError from "../errors/HttpError";

const prisma = new PrismaClient();

export const findUser: RequestHandler = async (req, res, next) => {
    const query = (req.query as {query: string}).query.toLowerCase();
    try {
        const users = await prisma.user.findMany({
            where: {
                email: {
                    startsWith: query
                }
            }
        });
        
        res.status(200).json({users});
        
    } catch (err) {
        next(new HttpError('Can not find users!'));
    }
}