"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const HttpError_1 = __importDefault(require("./HttpError"));
class NotFoundError extends HttpError_1.default {
    constructor(id) {
        if (typeof id === 'number') {
            super(`Record with id = ${id} not found!`, 404);
        }
        else if (typeof id === 'string') {
            super(id, 404);
        }
        else {
            super(`Records was not found!`, 404);
        }
    }
}
exports.default = NotFoundError;
