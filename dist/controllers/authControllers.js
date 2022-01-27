"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.people = exports.signUp = void 0;
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
const signUp = async (req, res, next) => {
    const name = req.body.name;
    const email = req.body.email;
    const role = req.body.role;
    const imgUrl = req.body.imgUrl;
    const password = req.body.password;
    const children = req.body.children;
    try {
        const hashPassword = await bcryptjs_1.default.hash(password, 12);
        const newPerson = await prisma.person.create({
            data: {
                name: name,
                email: email,
                password: hashPassword,
                role: role,
                imgurl: imgUrl,
            }
        });
        res.status(201).json({
            message: 'Your account was created!',
            // person: newPerson
        });
    }
    catch (err) {
        res.status(500).json({
            message: err
        });
    }
};
exports.signUp = signUp;
const people = async (req, res, next) => {
    try {
        const peopleRecords = await prisma.person.findMany();
        res.status(200).json({
            people: peopleRecords
        });
    }
    catch (err) {
        res.status(500).json({
            message: err
        });
    }
};
exports.people = people;
