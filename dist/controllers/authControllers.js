"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.users = exports.signUp = void 0;
const express_validator_1 = require("express-validator");
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const HttpError_1 = __importDefault(require("../errors/HttpError"));
const NotFoundError_1 = __importDefault(require("../errors/NotFoundError"));
const prisma = new client_1.PrismaClient();
const signUp = async (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    const name = req.body.name;
    const email = req.body.email;
    const role = req.body.role;
    const imgUrl = req.body.imgUrl;
    const password = req.body.password;
    if (errors.isEmpty()) {
        const hashedPassword = await bcryptjs_1.default.hash(password, 12);
        let newUser;
        try {
            newUser = await prisma.user.create({
                data: {
                    name: name,
                    email: email,
                    password: hashedPassword,
                    role: role,
                    img_url: imgUrl,
                }
            });
        }
        catch (err) {
            console.error(err);
            next(new HttpError_1.default('Could not create account!'));
        }
        res.status(201).json({
            message: 'Your account was created!',
            user: newUser
        });
    }
    else {
        errors.array().map(e => next(new HttpError_1.default(e.msg, 400)));
    }
};
exports.signUp = signUp;
const users = async (req, res, next) => {
    try {
        const users = await prisma.user.findMany();
        if (users) {
            res.status(200).json({
                users: users
            });
        }
        else {
            next(new NotFoundError_1.default('Users were not found!'));
        }
    }
    catch (err) {
        console.error(err);
        next(new HttpError_1.default('Could not find users!'));
    }
};
exports.users = users;
