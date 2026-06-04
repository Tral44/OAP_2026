export interface CreateRegistrationRequestDto {
  eventId: number;
  userId: number;
}

export interface UpdateRegistrationRequestDto {
  eventId: number;
  userId: number;
}

export interface RegistrationResponseDto {
  id: number;
  eventId: number;
  userId: number;
  registeredAt: string;
  userName?: string;
  userEmail?: string;
  eventTitle?: string;
}

export interface RegistrationListResponseDto {
  items: RegistrationResponseDto[];
  total: number;
}
