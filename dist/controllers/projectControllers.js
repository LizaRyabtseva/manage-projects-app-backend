"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProject = exports.updateProject = exports.createProject = exports.findOneProject = exports.projects = void 0;
const client_1 = require("@prisma/client");
const functions_1 = require("../functions");
const prisma = new client_1.PrismaClient();
const projects = async (req, res, next) => {
    try {
        const projectRecords = await prisma.project.findMany();
        res.status(200).json({ projects: projectRecords });
    }
    catch (err) {
        res.status(500).json({ message: err });
    }
};
exports.projects = projects;
const findOneProject = async (req, res, next) => {
    const projectId = +req.params.id;
    try {
        const projectRecord = await (0, functions_1.findProject)(projectId);
        if (projectRecord) {
            res.status(200).json({
                message: 'Project wad found',
                project: projectRecord
            });
        }
        else {
            res.status(404).json({ message: 'Can not found the project!' });
        }
    }
    catch (err) {
        res.status(500).json({
            message: err
        });
    }
};
exports.findOneProject = findOneProject;
const createProject = async (req, res, next) => {
    const title = req.body.title;
    const description = req.body.description;
    const email = req.body.email;
    //email надо получать из текущего пользователя
    const people = req.body.people;
    // массив строк с email'ми пользователей
    try {
        const userRecord = await (0, functions_1.findPerson)(email);
        const projectRecord = await (0, functions_1.findProject)(title);
        let newProject;
        if (!projectRecord && userRecord) {
            try {
                newProject = await prisma.project.create({
                    data: {
                        title: title,
                        description: description,
                        ownerid: userRecord.id
                    }
                });
            }
            catch (err) {
                res.status(500).json({
                    message: err
                });
            }
            const newProjectRecord = await (0, functions_1.findProject)(title);
            if (newProjectRecord) {
                const newProjectToPersonMapping = await (0, functions_1.projectToPersonMappingHandler)(newProjectRecord.id, newProjectRecord.ownerid);
                people.map(async (email) => {
                    const personRecord = await (0, functions_1.findPerson)(email);
                    if (personRecord) {
                        const map = await (0, functions_1.projectToPersonMappingHandler)(newProjectRecord.id, personRecord.id);
                    }
                });
                res.status(201).json({
                    message: 'Project was created!',
                    project: newProjectRecord,
                    map: newProjectToPersonMapping
                });
            }
        }
        else {
            res.status(200).json({
                message: 'This project already exists!'
            });
        }
    }
    catch (err) {
        res.status(500).json({
            err
        });
    }
};
exports.createProject = createProject;
const updateProject = async (req, res, next) => {
    const projectId = +req.params.id;
    const title = req.body.title;
    const description = req.body.description;
    try {
        if (projectId) {
            const projectRecord = await (0, functions_1.findProject)(projectId);
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
            }
            else {
                res.status(404).json({ message: 'Can not found the project!' });
            }
        }
        else {
            res.status(404).json({ message: 'Can not found the project!' });
        }
    }
    catch (err) {
        res.status(500).json({
            message: err
        });
    }
};
exports.updateProject = updateProject;
const deleteProject = async (req, res, next) => {
    const projectId = +req.params.id;
    let projects;
    try {
        const projectRecord = await (0, functions_1.findProject)(projectId);
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
        }
        else {
            res.status(404).json({ message: 'Can not found the project!' });
        }
    }
    catch (err) {
        res.status(500).json({
            message: err
        });
    }
};
exports.deleteProject = deleteProject;
