export type Id = number;

export interface EventDto {
  id: Id;
  title: string;
  date: string;
  location: string;
  capacity: number;
  description: string;
  createdAt: string;
  registrationCount: number;
}

export interface CreateEventDto {
  title: string;
  date: string;
  location: string;
  capacity: number;
  description: string;
}

export interface UserDto {
  id: Id;
  name: string;
  email: string;
  createdAt: string;
}

export interface CreateUserDto {
  name: string;
  email: string;
}

export interface RegistrationDto {
  id: Id;
  eventId: Id;
  userId: Id;
  registeredAt: string;
  userName?: string;
  userEmail?: string;
  eventTitle?: string;
}

export interface CreateRegistrationDto {
  eventId: Id;
  userId: Id;
}

export interface ListResponse<T> {
  items: T[];
  total: number;
}

export interface ApiError {
  status: number;
  message: string;
  details?: string;
  errors?: Array<{ field: string; message: string }>;
}

export interface StatsDto {
  totalEvents: number;
  totalCapacity: number;
  totalRegistrations: number;
  avgDescriptionWordCapacity: number;
}
