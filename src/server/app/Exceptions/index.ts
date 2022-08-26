// import { ErrorResponseType } from '@stypes/index';

export default class ErrorHandler extends Error {
    statusCode: number;

    message: string;

    name: string;

    messageResponse: string;

    statusResponse: number;

    constructor({ message = '', statusCode = 500, messageResponse = '', statusResponse = 5000, name = '' }) {
        super();
        this.statusResponse = statusResponse;
        this.statusCode = statusCode;
        this.message = message;
        this.name = name;
        this.messageResponse = messageResponse;
    }
}
