import {person, PrismaClient, project} from "@prisma/client";
import {RequestHandler} from "express";
import {rejects} from "assert";

const prisma = new PrismaClient();

export const findProject = async (param: number | string) => {
    let project: project | null;
    try {
        if (typeof param === 'number') {
            project = await prisma.project.findUnique({
                where: {
                    id: param
                }
            });
        } else {
            project = await prisma.project.findUnique({
                where: {
                    title: param
                }
            });
        }
        if (project) {
            return new Promise<project | null>(((resolve) => resolve(project)));
        }
    } catch (err) {
        new Error('Something went wrong');
    }
};

export const findPerson = async (param: string | number) => {
    let person: person | null;

    try {
        if (typeof param === 'string') {
            person = await prisma.person.findUnique({
                where: {
                    email: param
                }
            });
        } else {
            person = await prisma.person.findUnique({
                where: {
                    id: param
                }
            });
        }
        if (person) {
            return new Promise<person | null>((resolve) => resolve(person));
        }
    } catch (err) {
        new Error('Something went wrong');
    }
};

export const projectToPersonMappingHandler = async (projectId: number, personId: number) => {
    try {
        await prisma.projecttopersonmaping.create({
            data: {
                projectid: projectId,
                personid: personId
            }
        });
    } catch (err) {
        new Error('Something went wrong');
    }
}