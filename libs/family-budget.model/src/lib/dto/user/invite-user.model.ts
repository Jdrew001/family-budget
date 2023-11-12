export interface UserInviteDto {
    email: string;
    familyId: string;
    action: InviteAction;
    userId: string;
}

export enum InviteAction {
    invite = 'INVITE',
    remove = 'REMOVE'
}