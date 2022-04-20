import {user, PrismaClient, project} from "@prisma/client";

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

export const findUser = async (param: string | number) => {
    let user: user | null;

    try {
        if (typeof param === 'string') {
            user = await prisma.user.findUnique({
                where: {
                    email: param
                }
            });
        } else {
            user = await prisma.user.findUnique({
                where: {
                    id: param
                }
            });
        }
        if (user) {
            return new Promise<user | null>((resolve) => resolve(user));
        }
    } catch (err) {
        new Error('Something went wrong');
    }
};

export const userToProjectMapping = async (projectId: number, personId: number) => {
    try {
        await prisma.usertoprojectmapping.create({
            data: {
                project_id: projectId,
                user_id: personId
            }
        });
    } catch (err) {
        new Error('Something went wrong');
    }
};