export interface CreateRegistrationRequestDto {
  eventId: string;
  userId: string;
}

export interface RegistrationResponseDto {
  id: string;
  eventId: string;
  userId: string;
  registeredAt: string;
}

export interface RegistrationListResponseDto {
  items: RegistrationResponseDto[];
  total: number;
}
