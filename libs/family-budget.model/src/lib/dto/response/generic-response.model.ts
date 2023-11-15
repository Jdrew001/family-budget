export class GenericResponseModel<T> {
    private message?: string;
    private success: boolean;
    private code?: number;
    private data?: T;


    // constructor
    constructor(success: boolean, message?: string, code?: number, data?: any) {
        this.success = success;
        this.message = message;
        this.code = code;
        this.data = data;
    }
}