export interface CreateUserRequestDto {
  name: string;
  email: string;
}

export interface UpdateUserRequestDto {
  name: string;
  email: string;
}

export interface UserResponseDto {
  id: string;
  name: string;
  email: string;
}

export interface UserListResponseDto {
  items: UserResponseDto[];
  total: number;
}
