export interface UserInfoDto {
    id: string;
    firstname: string;
    lastname: string;
    email: string;
    family?: {
        id: string;
        users: Array<UserInfoDto>;
    },
    invitedUsers?: Array<{id?: string, email: string}>;
    displayValues?: Array<{id?: string, label: string, email: string, invitePending: boolean}>;
}

export interface UserFamily {
    id: string;
    displayValues?: Array<{id?: string, label: string, email: string, invitePending: boolean}>;
}