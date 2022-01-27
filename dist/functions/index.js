"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectToPersonMappingHandler = exports.findPerson = exports.findProject = void 0;
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
const findPerson = async (param) => {
    let person;
    try {
        if (typeof param === 'string') {
            person = await prisma.person.findUnique({
                where: {
                    email: param
                }
            });
        }
        else {
            person = await prisma.person.findUnique({
                where: {
                    id: param
                }
            });
        }
        if (person) {
            return new Promise((resolve) => resolve(person));
        }
    }
    catch (err) {
        new Error('Something went wrong');
    }
};
exports.findPerson = findPerson;
const projectToPersonMappingHandler = async (projectId, personId) => {
    try {
        await prisma.projecttopersonmaping.create({
            data: {
                projectid: projectId,
                personid: personId
            }
        });
    }
    catch (err) {
        new Error('Something went wrong');
    }
};
exports.projectToPersonMappingHandler = projectToPersonMappingHandler;
