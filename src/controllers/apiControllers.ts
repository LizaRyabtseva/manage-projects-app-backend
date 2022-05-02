import {RequestHandler} from "express";
import {PrismaClient} from "@prisma/client";
import HttpError from "../errors/HttpError";
import {findUser, findUserToProjectMapping} from "../functions";
import NotFoundError from "../errors/NotFoundError";

const prisma = new PrismaClient();

export const searchHandler: RequestHandler = async (req, res, next) => {
    const category = req.url.split('/')[1];
    const query = (req.query as {query: string}).query.toLowerCase();
    
    if (category === 'usersInProject') {
        const projectId = +req.query.projectId!;
        console.log(projectId);
    
        try {
            const usersToProject = await findUserToProjectMapping(projectId);
            const users = usersToProject?.filter(member => member.project_id === projectId)
                .filter(member => member.user.email.startsWith(query));
            console.log(users?.map(item => item.user));
            res.status(200).json({users: users?.map(member => member.user)});
        } catch (err) {
            next(new HttpError(`Can not find records for ${category}!`));
        }
    }
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
                }
            });
            res.status(200).json({projects});
        }
        
    } catch (err) {
        next(new HttpError(`Can not find records for ${category}!`));
    }
};

export const getCurrentProject: RequestHandler = async (req, res, next) => {
    const userId = +req.params.userId;

    try {
        const user = await findUser(userId);
        if (user) {
            const currentProject = user?.current_project_id;
            res.status(200).json({message: 'Current project was found!', currentProject});
        } else {
            next(new NotFoundError(userId));
        }
    } catch (err) {
        next(new HttpError(`Can not found ${userId}`));
    }
}