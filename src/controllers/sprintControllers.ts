import {RequestHandler} from "express";
import {PrismaClient} from '@prisma/client';
import {findProject} from "../functions";

const prisma = new PrismaClient();

export const createSprint: RequestHandler = async (req, res, next) => {
    const title = (req.body as { title: string }).title;
    const description = (req.body as { description: string }).description;
    let dateStart: string[] | Date = (req.body as {dateStart: string}).dateStart.toString().split('-');
    let dateEnd: string[] | Date = (req.body as {dateEnd: string}).dateEnd.toString().split('-');
    const projectId = +req.params.projectId;
    console.log(dateStart);
    
    dateStart = new Date(+dateStart[0], +dateStart[1] - 1, +dateStart[2]);
    dateEnd = new Date(+dateEnd[0], +dateEnd[1] - 1, +dateEnd[2]);
    // const projectTitle = (req.body as { projectTitle: string }).projectTitle;
    
    console.log('here');

    try {
        const newSprint = await prisma.sprint.create({
            data: {
                title: title,
                description: description,
                date_start: dateStart,
                date_end: dateEnd,
                project_id: projectId
            }
        });
        res.status(201).json({
            message: 'New sprint was created!',
            sprint: newSprint
        });
    } catch (err) {
        res.status(500).json({
            err
        });
    }
};