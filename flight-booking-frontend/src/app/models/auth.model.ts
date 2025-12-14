export interface LoginRequest{
    email: string;
    password: string;
}

export interface RegisterRequest{
    email: string;
    password: string;
    firstName: string;
    lastName: string;
}

export interface AuthResponse{
    email: string;
    firstName: string;
    lastName: string;
    createdAt?: string;
    message: string;
}

export interface User{
    email: string;
    firstName: string;
    lastName: string;
    createdAt: string;

}