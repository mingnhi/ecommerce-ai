type UserResponse = {
    id: string;
    email: string;
    fullName?: string;
    status: string;
    createdAt: Date;
};

type DeleteUserResponse = {
    message: string;
    user: UserResponse;
};

type UpdateStatusResponse = {
    message: string;
    user: UserResponse;
};