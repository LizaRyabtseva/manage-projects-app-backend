"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class HttpError extends Error {
    constructor(message = 'Something went wrong!', errorCode) {
        super(message);
        this.message = message;
        this.status = errorCode;
    }
}
exports.default = HttpError;
