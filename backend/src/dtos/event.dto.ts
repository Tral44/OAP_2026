export interface CreateEventRequestDto {
  title: string;
  date: string;
  location: string;
  capacity: number;
  description: string;
}

export interface UpdateEventRequestDto {
  title: string;
  date: string;
  location: string;
  capacity: number;
  description: string;
}

export interface EventResponseDto {
  id: number;
  title: string;
  date: string;
  location: string;
  capacity: number;
  description: string;
  createdAt: string;
  registrationCount: number;
}

export interface EventListResponseDto {
  items: EventResponseDto[];
  total: number;
}
