import {NextFunction, Request, Response} from 'express';
import HttpError from '../errors/HttpError';

const errorMiddleware = (error: HttpError, req:Request, res: Response, next: NextFunction) => {
    const message = error.message;
    const status = error.status || 500;
    
    res.status(status).send({message, status});
};

export default errorMiddleware;