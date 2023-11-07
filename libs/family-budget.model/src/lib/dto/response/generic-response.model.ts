export interface GenericResponseModel {
    message?: string;
    success: boolean;
    code?: number;
    data?: any;
}