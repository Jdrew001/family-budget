export class AlertBoxDto {
    title: string;
    message: string;
    cancelText: string;
    confirmText: string;
    canDismiss?: boolean;
    type?: AlertType;
    dialogType: AlertDialogType;
    key: string;
    data: any;
}

export enum AlertDialogType {
    CONFIRM = 'confirm',
    ALERT = 'alert'
}

export enum AlertType {
    SUCCESS = 'success',
    ERROR = 'error',
    WARNING = 'warning',
    INFO = 'info'
}