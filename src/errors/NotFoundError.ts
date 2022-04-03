import HttpError from './HttpError';

class NotFoundError extends HttpError {
    constructor(id?: number | string) {
        if (typeof id === 'number') {
            super(`Record with id = ${id} not found!`, 404);
        } else if (typeof id === 'string') {
            super(id, 404);
        } else {
            super(`Records was not found!`, 404);
        }
    }
}

export default NotFoundError;