"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authControllers = __importStar(require("../controllers/authControllers"));
const client_1 = require("@prisma/client");
const express_validator_1 = require("express-validator");
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
const emailValidator = (req) => {
    const email = req.body.email;
    const userRecord = prisma.user.findUnique({
        where: {
            email: email
        }
    });
    return userRecord.then(user => {
        if (user) {
            return Promise.reject('Email is already in use!');
        }
    });
};
router.post('/sign-up', (0, express_validator_1.body)('email')
    .trim()
    .isEmail()
    .custom(emailValidator), authControllers.signUp);
router.get('/users', authControllers.users);
exports.default = router;
