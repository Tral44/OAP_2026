import { v4 as uuidv4 } from "uuid";

export interface EventEntity {
  id: string;
  title: string;
  date: string;
  location: string;
  capacity: number;
  description: string;
}

// Параметри фільтрації
export interface EventQueryParams {
  search?: string;
  sortBy?: string;
  sortDir?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}

const eventsStore: EventEntity[] = [];

export const eventRepository = {
  findAll(params: EventQueryParams = {}): { items: EventEntity[]; total: number } {
    let items = [...eventsStore]; // копія, щоб не змінювати оригінал

    if (params.search) {
      const s = params.search.toLowerCase();
      items = items.filter((e) => e.title.toLowerCase().includes(s));
    }

    if (params.sortBy) {
      items.sort((a, b) => {
        const fieldA = a[params.sortBy as keyof EventEntity];
        const fieldB = b[params.sortBy as keyof EventEntity];
        if (typeof fieldA === "string" && typeof fieldB === "string") {
          return params.sortDir === "desc"
            ? fieldB.localeCompare(fieldA)
            : fieldA.localeCompare(fieldB);
        }
        if (typeof fieldA === "number" && typeof fieldB === "number") {
          return params.sortDir === "desc" ? fieldB - fieldA : fieldA - fieldB;
        }
        return 0;
      });
    }

    const total = items.length;

    // Пагінація
    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 10;
    const start = (page - 1) * pageSize;
    items = items.slice(start, start + pageSize);

    return { items, total };
  },

  findById(id: string): EventEntity | undefined {
    return eventsStore.find((e) => e.id === id);
  },

  create(data: Omit<EventEntity, "id">): EventEntity {
    const newEvent: EventEntity = {
      id: uuidv4(),
      ...data,
    };
    eventsStore.push(newEvent);
    return newEvent;
  },

  update(id: string, data: Omit<EventEntity, "id">): EventEntity | undefined {
    const index = eventsStore.findIndex((e) => e.id === id);
    if (index === -1) return undefined;
    eventsStore[index] = { id, ...data };
    return eventsStore[index];
  },

  delete(id: string): boolean {
    const index = eventsStore.findIndex((e) => e.id === id);
    if (index === -1) return false;
    eventsStore.splice(index, 1);
    return true;
  },
};
