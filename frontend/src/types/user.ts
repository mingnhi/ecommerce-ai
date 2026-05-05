export interface IUser {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    introduction?: string;
    name?: string;
    image?: string;
    roles?: string | string[];
}

