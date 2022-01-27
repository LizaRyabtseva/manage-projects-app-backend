import {RequestHandler} from "express";
import {PrismaClient, project} from "@prisma/client";
import {findPerson, findProject, projectToPersonMappingHandler} from "../functions";

const prisma = new PrismaClient();


export const projects: RequestHandler = async (req, res, next) => {
    try {
        const projectRecords = await prisma.project.findMany();
        res.status(200).json({projects: projectRecords});
    } catch (err) {
        res.status(500).json({message: err});
    }
}

export const findOneProject: RequestHandler = async (req, res, next) => {
    const projectId = +req.params.id;
    try {
        const projectRecord = await findProject(projectId);
        if (projectRecord) {
            res.status(200).json({
                message: 'Project wad found',
                project: projectRecord
            });
        } else {
            res.status(404).json({message: 'Can not found the project!'});
        }
    } catch (err) {
        res.status(500).json({
            message: err
        });
    }
}

export const createProject: RequestHandler = async (req, res, next) => {
    const title = (req.body as {title: string}).title;
    const description = (req.body as {description: string}).description;
    const email = (req.body as {email: string}).email;
    //email надо получать из текущего пользователя
    const people = (req.body as {people: string[]}).people;
    // массив строк с email'ми пользователей

    try {
        const userRecord = await findPerson(email);
        const projectRecord = await findProject(title);
        let newProject: project;
        if (!projectRecord && userRecord) {
            try {
                newProject = await prisma.project.create({
                    data: {
                        title: title,
                        description: description,
                        ownerid: userRecord.id
                    }
                });
            } catch (err) {
                res.status(500).json({
                    message: err
                });
            }
            const newProjectRecord = await findProject(title);
            if (newProjectRecord) {
                const newProjectToPersonMapping = await projectToPersonMappingHandler(newProjectRecord.id, newProjectRecord.ownerid);

                people.map(async (email: string) => {
                    const personRecord = await findPerson(email);
                    if (personRecord) {
                        const map = await projectToPersonMappingHandler(newProjectRecord.id, personRecord.id);
                    }
                });

                res.status(201).json({
                    message: 'Project was created!',
                    project: newProjectRecord,
                    map: newProjectToPersonMapping
                });
            }
        } else {
            res.status(200).json({
                message: 'This project already exists!'
            });
        }
    } catch (err) {
        res.status(500).json({
            err
        });
    }
}

export const updateProject: RequestHandler = async (req, res, next) => {
    const projectId = +req.params.id;
    const title = (req.body as {title: string}).title;
    const description = (req.body as {description: string}).description;

    try {
        if (projectId) {
            const projectRecord = await findProject(projectId);
            if (projectRecord) {
                const updatedProject = await prisma.project.update({
                    where: {
                        id: projectId
                    },
                    data: {
                        title: title,
                        description: description
                    }
                });
                res.status(200).json({
                    message: 'Project was updated!',
                    project: updatedProject
                });
            } else {
                res.status(404).json({message: 'Can not found the project!'});
            }
        } else {
            res.status(404).json({message: 'Can not found the project!'});
        }
    } catch (err) {
        res.status(500).json({
            message: err
        });
    }
}

export const deleteProject: RequestHandler = async (req, res, next) => {
    const projectId = +req.params.id;
    let projects: project[];

    try {
        const projectRecord = await findProject(projectId);

        if (projectRecord) {
            await prisma.project.delete({
                where: {
                    id: projectId
                }
            });
            projects = await prisma.project.findMany();

            res.status(200).json({
                message: 'Project was deleted!',
                projects: projects
            });
        } else {
            res.status(404).json({message: 'Can not found the project!'});
        }
    } catch (err) {
        res.status(500).json({
            message: err
        });
    }
}
