import {RequestHandler} from "express";
import {PrismaClient} from "@prisma/client";
import HttpError from "../errors/HttpError";

const prisma = new PrismaClient();

export const findByQuery: RequestHandler = async (req, res, next) => {
    const category = req.url.split('/')[1];
    const query = (req.query as {query: string}).query.toLowerCase();
    try {
        if (category === 'users') {
            const users = await prisma.user.findMany({
                where: {
                    email: {
                        startsWith: query
                    }
                }
            });
            res.status(200).json({users});
        } else if (category === 'projects') {
            const projects = await prisma.project.findMany({
                where: {
                    title: {
                        startsWith: query
                    }
                }, include: {
                    user: true
                }
            });
            console.log(projects);
            res.status(200).json({projects});
        }
    } catch (err) {
        next(new HttpError(`Can not find ${category}!`));
    }
}