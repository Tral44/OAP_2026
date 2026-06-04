import type { ApiError, EventDto, UserDto, RegistrationDto } from "./dtos.js";
import {
  getEvents, getEventById, createEvent, updateEvent, deleteEvent,
  getUsers, getUserById, createUser, updateUser, deleteUser,
  getRegistrations, createRegistration, deleteRegistration,
} from "./apiClient.js";
import {
  renderEventStatus, renderUserStatus, renderRegistrationStatus,
  renderEvents, renderUsers, renderRegistrations,
  renderEventPagination, renderUserPagination, renderRegistrationPagination,
  populateEventSelect, populateUserSelect,
  setFormBusy, clearFieldErrors, showFieldError, showValidationErrors,
  getEventFormData, getUserFormData, getRegistrationFormData,
  setEventFormMode, setUserFormMode,
  updateEventCount, updateUserCount, updateRegistrationCount,
  showNotice,
} from "./ui.js";
import type { Status } from "./ui.js";

const state = {
  events: {
    status: "idle" as Status,
    items: [] as EventDto[],
    error: null as ApiError | null,
    total: 0,
    page: 1,
    pageSize: 10,
    search: "",
    sortCol: "date" as string,
    sortDir: "asc" as string,
    editingId: null as number | null,
  },
  users: {
    status: "idle" as Status,
    items: [] as UserDto[],
    error: null as ApiError | null,
    total: 0,
    page: 1,
    pageSize: 10,
    search: "",
    sortCol: "name" as string,
    sortDir: "asc" as string,
    editingId: null as number | null,
  },
  registrations: {
    status: "idle" as Status,
    items: [] as RegistrationDto[],
    error: null as ApiError | null,
    total: 0,
    page: 1,
    pageSize: 10,
  },
};

function getTarget(e: Event): HTMLElement {
  return e.target as HTMLElement;
}

async function loadEvents(): Promise<void> {
  state.events.status = "loading";
  renderEventStatus("loading");

  try {
    const result = await getEvents({
      search: state.events.search || undefined,
      sortBy: state.events.sortCol || undefined,
      sortDir: state.events.sortDir,
      page: state.events.page,
      pageSize: state.events.pageSize,
    });

    state.events.items = result.items;
    state.events.total = result.total;
    state.events.error = null;

    if (result.items.length === 0) {
      state.events.status = "empty";
      renderEventStatus("empty");
    } else {
      state.events.status = "success";
      renderEventStatus("success");
    }

    renderEvents(result.items, state.events.sortCol, state.events.sortDir);
    updateEventCount(result.total);
    renderEventPagination(result.total, state.events.page, state.events.pageSize, (p) => {
      state.events.page = p;
      loadEvents();
    });
  } catch (e) {
    state.events.error = e as ApiError;
    state.events.status = "error";
    state.events.items = [];
    renderEvents([], state.events.sortCol, state.events.sortDir);
    renderEventStatus("error", e as ApiError);
  }
}

async function loadUsers(): Promise<void> {
  state.users.status = "loading";
  renderUserStatus("loading");

  try {
    const result = await getUsers({
      search: state.users.search || undefined,
      sortBy: state.users.sortCol || undefined,
      sortDir: state.users.sortDir,
      page: state.users.page,
      pageSize: state.users.pageSize,
    });

    state.users.items = result.items;
    state.users.total = result.total;
    state.users.error = null;

    if (result.items.length === 0) {
      state.users.status = "empty";
      renderUserStatus("empty");
    } else {
      state.users.status = "success";
      renderUserStatus("success");
    }

    renderUsers(result.items, state.users.sortCol, state.users.sortDir);
    updateUserCount(result.total);
    renderUserPagination(result.total, state.users.page, state.users.pageSize, (p) => {
      state.users.page = p;
      loadUsers();
    });
  } catch (e) {
    state.users.error = e as ApiError;
    state.users.status = "error";
    state.users.items = [];
    renderUsers([], state.users.sortCol, state.users.sortDir);
    renderUserStatus("error", e as ApiError);
  }
}

async function loadRegistrations(): Promise<void> {
  state.registrations.status = "loading";
  renderRegistrationStatus("loading");

  try {
    const result = await getRegistrations({
      page: state.registrations.page,
      pageSize: state.registrations.pageSize,
    });

    state.registrations.items = result.items;
    state.registrations.total = result.total;
    state.registrations.error = null;

    if (result.items.length === 0) {
      state.registrations.status = "empty";
      renderRegistrationStatus("empty");
    } else {
      state.registrations.status = "success";
      renderRegistrationStatus("success");
    }

    renderRegistrations(result.items);
    updateRegistrationCount(result.total);
    renderRegistrationPagination(result.total, state.registrations.page, state.registrations.pageSize, (p) => {
      state.registrations.page = p;
      loadRegistrations();
    });
  } catch (e) {
    state.registrations.error = e as ApiError;
    state.registrations.status = "error";
    renderRegistrations([]);
    renderRegistrationStatus("error", e as ApiError);
  }
}

async function loadAll(): Promise<void> {
  await Promise.all([loadEvents(), loadUsers(), loadRegistrations()]);
  await loadSelects();
}

async function loadSelects(): Promise<void> {
  try {
    const [evResult, usResult] = await Promise.all([
      getEvents({ pageSize: 100 }),
      getUsers({ pageSize: 100 }),
    ]);
    populateEventSelect(evResult.items);
    populateUserSelect(usResult.items);
  } catch { /* select population is best-effort */ }
}

function validateEventForm(): boolean {
  clearFieldErrors("eventForm");
  const data = getEventFormData();
  let valid = true;

  if (!data.title || data.title.length < 2) {
    showFieldError("eventTitle", "eventTitleError", "Мінімум 2 символи");
    valid = false;
  }
  if (!data.date) {
    showFieldError("eventDate", "eventDateError", "Вкажіть дату");
    valid = false;
  }
  if (!data.location || data.location.length < 2) {
    showFieldError("eventLocation", "eventLocationError", "Мінімум 2 символи");
    valid = false;
  }
  if (!data.capacity || data.capacity < 1) {
    showFieldError("eventCapacity", "eventCapacityError", "Число > 0");
    valid = false;
  }

  return valid;
}

function validateUserForm(): boolean {
  clearFieldErrors("userForm");
  const data = getUserFormData();
  let valid = true;

  if (!data.name || data.name.length < 2) {
    showFieldError("userName", "userNameError", "Мінімум 2 символи");
    valid = false;
  }
  if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    showFieldError("userEmail", "userEmailError", "Коректний email");
    valid = false;
  }

  return valid;
}

function validateRegistrationForm(): boolean {
  clearFieldErrors("registrationForm");
  const data = getRegistrationFormData();
  let valid = true;

  if (!data.eventId) {
    showFieldError("regEventSelect", "regEventError", "Оберіть подію");
    valid = false;
  }
  if (!data.userId) {
    showFieldError("regUserSelect", "regUserError", "Оберіть користувача");
    valid = false;
  }

  return valid;
}

document.addEventListener("DOMContentLoaded", () => {
  loadAll();

  document.getElementById("eventForm")!.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!validateEventForm()) return;

    const data = getEventFormData();
    setFormBusy("eventForm", true);

    try {
      if (state.events.editingId) {
        await updateEvent(state.events.editingId, data);
        state.events.editingId = null;
        setEventFormMode("create");
        showNotice("Подію оновлено");
      } else {
        await createEvent(data);
        showNotice("Подію створено");
      }
      state.events.page = 1;
      await loadEvents();
      await loadSelects();
    } catch (err) {
      const apiErr = err as ApiError;
      if (apiErr.errors && apiErr.errors.length > 0) {
        showValidationErrors(apiErr.errors);
      }
      showNotice(apiErr.message || "Помилка збереження події", true);
    } finally {
      setFormBusy("eventForm", false);
    }
  });

  document.getElementById("cancelEventEdit")!.addEventListener("click", () => {
    state.events.editingId = null;
    setEventFormMode("create");
    clearFieldErrors("eventForm");
  });

  document.getElementById("eventTableBody")!.addEventListener("click", async (e) => {
    const target = getTarget(e);
    const action = target.dataset.action;
    const id = target.dataset.id ? Number(target.dataset.id) : null;
    if (!id) return;

    if (action === "edit-event") {
      try {
        const ev = await getEventById(id);
        state.events.editingId = id;
        setEventFormMode("edit", ev);
      } catch {
        showNotice("Помилка завантаження події", true);
      }
    }

    if (action === "delete-event") {
      if (!confirm("Видалити подію?")) return;
      try {
        await deleteEvent(id);
        if (state.events.editingId === id) {
          state.events.editingId = null;
          setEventFormMode("create");
        }
        state.events.items = state.events.items.filter((e) => e.id !== id);
        state.events.total -= 1;
        showNotice("Подію видалено");
        if (state.events.items.length === 0 && state.events.page > 1) {
          state.events.page -= 1;
          await loadEvents();
        } else {
          renderEvents(state.events.items, state.events.sortCol, state.events.sortDir);
          updateEventCount(state.events.total);
          renderEventPagination(state.events.total, state.events.page, state.events.pageSize, (p) => {
            state.events.page = p;
            loadEvents();
          });
        }
        populateEventSelect(state.events.items);
      } catch {
        showNotice("Помилка видалення події", true);
      }
    }
  });

  document.querySelectorAll<HTMLElement>("#eventTable th[data-col]").forEach((th) => {
    th.addEventListener("click", () => {
      const col = th.dataset.col!;
      if (state.events.sortCol === col) {
        state.events.sortDir = state.events.sortDir === "asc" ? "desc" : "asc";
      } else {
        state.events.sortCol = col;
        state.events.sortDir = "asc";
      }
      state.events.page = 1;
      loadEvents();
    });
  });

  document.getElementById("eventSearch")!.addEventListener("input", function () {
    state.events.search = (this as HTMLInputElement).value;
    state.events.page = 1;
    loadEvents();
  });

  document.getElementById("userForm")!.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!validateUserForm()) return;

    const data = getUserFormData();
    setFormBusy("userForm", true);

    try {
      if (state.users.editingId) {
        await updateUser(state.users.editingId, data);
        state.users.editingId = null;
        setUserFormMode("create");
        showNotice("Користувача оновлено");
      } else {
        await createUser(data);
        showNotice("Користувача створено");
      }
      await loadUsers();
      await loadSelects();
    } catch (err) {
      const apiErr = err as ApiError;
      if (apiErr.errors && apiErr.errors.length > 0) {
        showValidationErrors(apiErr.errors);
      }
      showNotice(apiErr.message || "Помилка збереження користувача", true);
    } finally {
      setFormBusy("userForm", false);
    }
  });

  document.getElementById("cancelUserEdit")!.addEventListener("click", () => {
    state.users.editingId = null;
    setUserFormMode("create");
    clearFieldErrors("userForm");
  });

  document.getElementById("userTableBody")!.addEventListener("click", async (e) => {
    const target = getTarget(e);
    const action = target.dataset.action;
    const id = target.dataset.id ? Number(target.dataset.id) : null;
    if (!id) return;

    if (action === "edit-user") {
      try {
        const user = await getUserById(id);
        state.users.editingId = id;
        setUserFormMode("edit", user);
      } catch {
        showNotice("Помилка завантаження користувача", true);
      }
    }

    if (action === "delete-user") {
      if (!confirm("Видалити користувача?")) return;
      try {
        await deleteUser(id);
        if (state.users.editingId === id) {
          state.users.editingId = null;
          setUserFormMode("create");
        }
        state.users.items = state.users.items.filter((u) => u.id !== id);
        state.users.total -= 1;
        showNotice("Користувача видалено");
        if (state.users.items.length === 0 && state.users.page > 1) {
          state.users.page -= 1;
          await loadUsers();
        } else {
          renderUsers(state.users.items, state.users.sortCol, state.users.sortDir);
          updateUserCount(state.users.total);
          renderUserPagination(state.users.total, state.users.page, state.users.pageSize, (p) => {
            state.users.page = p;
            loadUsers();
          });
        }
        populateUserSelect(state.users.items);
      } catch {
        showNotice("Помилка видалення користувача", true);
      }
    }
  });

  document.querySelectorAll<HTMLElement>("#userTable th[data-col]").forEach((th) => {
    th.addEventListener("click", () => {
      const col = th.dataset.col!;
      if (state.users.sortCol === col) {
        state.users.sortDir = state.users.sortDir === "asc" ? "desc" : "asc";
      } else {
        state.users.sortCol = col;
        state.users.sortDir = "asc";
      }
      loadUsers();
    });
  });

  document.getElementById("userSearch")!.addEventListener("input", function () {
    state.users.search = (this as HTMLInputElement).value;
    state.users.page = 1;
    loadUsers();
  });

  document.getElementById("registrationForm")!.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!validateRegistrationForm()) return;

    const data = getRegistrationFormData();
    setFormBusy("registrationForm", true);

    try {
      await createRegistration(data);
      showNotice("Реєстрацію створено");
      (document.getElementById("registrationForm") as HTMLFormElement).reset();
      await loadRegistrations();
      await loadEvents();
    } catch (err) {
      const apiErr = err as ApiError;
      if (apiErr.errors && apiErr.errors.length > 0) {
        showValidationErrors(apiErr.errors);
      }
      showNotice(apiErr.message || "Помилка реєстрації", true);
    } finally {
      setFormBusy("registrationForm", false);
    }
  });

  document.getElementById("registrationTableBody")!.addEventListener("click", async (e) => {
    const target = getTarget(e);
    if (target.dataset.action !== "delete-registration") return;
    const id = target.dataset.id ? Number(target.dataset.id) : null;
    if (!id) return;

    if (!confirm("Скасувати реєстрацію?")) return;
    try {
      await deleteRegistration(id);
      state.registrations.items = state.registrations.items.filter((r) => r.id !== id);
      state.registrations.total -= 1;
      showNotice("Реєстрацію скасовано");
      renderRegistrations(state.registrations.items);
      updateRegistrationCount(state.registrations.total);
      renderRegistrationPagination(state.registrations.total, state.registrations.page, state.registrations.pageSize, (p) => {
        state.registrations.page = p;
        loadRegistrations();
      });
      await loadEvents();
    } catch {
      showNotice("Помилка скасування реєстрації", true);
    }
  });
});
