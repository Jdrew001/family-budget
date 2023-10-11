export interface UserInfoDto {
    id: string;
    firstname: string;
    lastname: string;
    email: string;
    family?: {
        id: string;
        users: Array<UserInfoDto>;
    }
}