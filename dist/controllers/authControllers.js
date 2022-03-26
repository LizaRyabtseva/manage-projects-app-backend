"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.users = exports.signUp = void 0;
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
const signUp = async (req, res, next) => {
    const name = req.body.name;
    const email = req.body.email;
    const role = req.body.role;
    const imgUrl = req.body.imgUrl;
    const password = req.body.password;
    try {
        const hashedPassword = await bcryptjs_1.default.hash(password, 12);
        const newPerson = await prisma.user.create({
            data: {
                name: name,
                email: email,
                password: hashedPassword,
                role: role,
                img_url: imgUrl,
            }
        });
        res.status(201).json({
            message: 'Your account was created!',
            person: newPerson
        });
    }
    catch (err) {
        res.status(500).json({
            message: err
        });
    }
};
exports.signUp = signUp;
const users = async (req, res, next) => {
    try {
        const users = await prisma.user.findMany();
        res.status(200).json({
            people: users
        });
    }
    catch (err) {
        res.status(500).json({
            message: err
        });
    }
};
exports.users = users;
