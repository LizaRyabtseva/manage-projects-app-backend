class HttpError extends Error {
    message: string;
    status?: number;
    constructor(message: string = 'Something went wrong!', errorCode?: number) {
        super(message);
        this.message = message;
        this.status = errorCode;
    }
}

export default HttpError;
