"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errorMiddleware = (error, req, res, next) => {
    const message = error.message;
    const status = error.status || 500;
    res.status(status).send({ message, status });
};
exports.default = errorMiddleware;
