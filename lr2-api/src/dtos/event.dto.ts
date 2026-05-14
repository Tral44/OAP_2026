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
  id: string;
  title: string;
  date: string;
  location: string;
  capacity: number;
  description: string;
  registrationCount: number;
}

export interface EventListResponseDto {
  items: EventResponseDto[];
  total: number;
}
