import { v4 as uuidv4 } from "uuid";

export interface UserEntity {
  id: string;
  name: string;
  email: string;
}

const usersStore: UserEntity[] = [];

export const userRepository = {
  findAll(): UserEntity[] {
    return [...usersStore];
  },

  findById(id: string): UserEntity | undefined {
    return usersStore.find((u) => u.id === id);
  },

  findByEmail(email: string): UserEntity | undefined {
    return usersStore.find((u) => u.email === email);
  },

  create(data: Omit<UserEntity, "id">): UserEntity {
    const newUser: UserEntity = { id: uuidv4(), ...data };
    usersStore.push(newUser);
    return newUser;
  },

  update(id: string, data: Omit<UserEntity, "id">): UserEntity | undefined {
    const index = usersStore.findIndex((u) => u.id === id);
    if (index === -1) return undefined;
    usersStore[index] = { id, ...data };
    return usersStore[index];
  },

  delete(id: string): boolean {
    const index = usersStore.findIndex((u) => u.id === id);
    if (index === -1) return false;
    usersStore.splice(index, 1);
    return true;
  },
};
