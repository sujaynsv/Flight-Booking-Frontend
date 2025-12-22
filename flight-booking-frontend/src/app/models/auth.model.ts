export interface LoginRequest{
    email: string;
    password: string;
}

export interface RegisterRequest{
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: string;
}

export interface AuthResponse{
  email: string;
  firstname: string;
  lastname: string;
  createdAt?: string;
  message: string;
  role?: string;
}


export interface User{
    email: string;
    firstName: string;
    lastName: string;
    createdAt: string;
    role?: string;

}