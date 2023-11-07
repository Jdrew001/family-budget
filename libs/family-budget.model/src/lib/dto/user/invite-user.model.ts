export interface UserInviteDto {
    email: string;
    familyId: string;
    action: string;
    userId: string;
}

export enum InviteAction {
    invite = 'INVITE',
    remove = 'REMOVE',
    accept = 'ACCEPT'
}