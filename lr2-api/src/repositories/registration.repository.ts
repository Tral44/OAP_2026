import { v4 as uuidv4 } from "uuid";

export interface RegistrationEntity {
  id: string;
  eventId: string;
  userId: string;
  registeredAt: string;
}

const registrationsStore: RegistrationEntity[] = [];

export const registrationRepository = {
  findAll(): RegistrationEntity[] {
    return [...registrationsStore];
  },

  findById(id: string): RegistrationEntity | undefined {
    return registrationsStore.find((r) => r.id === id);
  },

  findByEventId(eventId: string): RegistrationEntity[] {
    return registrationsStore.filter((r) => r.eventId === eventId);
  },

  findByEventAndUser(eventId: string, userId: string): RegistrationEntity | undefined {
    return registrationsStore.find(
      (r) => r.eventId === eventId && r.userId === userId,
    );
  },

  countByEventId(eventId: string): number {
    return registrationsStore.filter((r) => r.eventId === eventId).length;
  },

  create(data: Omit<RegistrationEntity, "id" | "registeredAt">): RegistrationEntity {
    const newReg: RegistrationEntity = {
      id: uuidv4(),
      registeredAt: new Date().toISOString(),
      ...data,
    };
    registrationsStore.push(newReg);
    return newReg;
  },

  delete(id: string): boolean {
    const index = registrationsStore.findIndex((r) => r.id === id);
    if (index === -1) return false;
    registrationsStore.splice(index, 1);
    return true;
  },

  deleteByEventId(eventId: string): void {
    const indices = registrationsStore
      .map((r, i) => (r.eventId === eventId ? i : -1))
      .filter((i) => i !== -1)
      .reverse();
    indices.forEach((i) => registrationsStore.splice(i, 1));
  },
};
