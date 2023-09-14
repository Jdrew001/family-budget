export interface GenericResponse<T> {
    data: T;
    message: string;
    error: any;
}