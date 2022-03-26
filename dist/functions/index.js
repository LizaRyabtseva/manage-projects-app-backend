"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userToProjectMappingHandler = exports.findUser = exports.findProject = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const findProject = async (param) => {
    let project;
    try {
        if (typeof param === 'number') {
            project = await prisma.project.findUnique({
                where: {
                    id: param
                }
            });
        }
        else {
            project = await prisma.project.findUnique({
                where: {
                    title: param
                }
            });
        }
        if (project) {
            return new Promise(((resolve) => resolve(project)));
        }
    }
    catch (err) {
        new Error('Something went wrong');
    }
};
exports.findProject = findProject;
const findUser = async (param) => {
    let user;
    try {
        if (typeof param === 'string') {
            user = await prisma.user.findUnique({
                where: {
                    email: param
                }
            });
        }
        else {
            user = await prisma.user.findUnique({
                where: {
                    id: param
                }
            });
        }
        if (user) {
            return new Promise((resolve) => resolve(user));
        }
    }
    catch (err) {
        new Error('Something went wrong');
    }
};
exports.findUser = findUser;
const userToProjectMappingHandler = async (projectId, personId) => {
    try {
        await prisma.usertoprojectmapping.create({
            data: {
                project_id: projectId,
                user_id: personId
            }
        });
    }
    catch (err) {
        new Error('Something went wrong');
    }
};
exports.userToProjectMappingHandler = userToProjectMappingHandler;
