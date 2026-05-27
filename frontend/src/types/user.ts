export interface IUser {
    id: string;
    email: string;
    fullName?: string;
    phoneNumber?: string;
    introduction?: string;
    image?: string;
    roles?: string | string[];
}
