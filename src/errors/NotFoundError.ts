import HttpError from './HttpError';

class NotFoundError extends HttpError {
    constructor(id?: string) {
        if (id) {
            super(`Record with id = ${id} not found!`, 404);
        } else {
            super(`Records was not found!`, 404);
        }
    }
}

export default NotFoundError;