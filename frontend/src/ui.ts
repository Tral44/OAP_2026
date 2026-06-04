import type { ApiError, EventDto, UserDto, RegistrationDto } from "./dtos.js";

export type Status = "idle" | "loading" | "success" | "empty" | "error";

const $ = (id: string): HTMLElement => document.getElementById(id)!;

function formatDate(iso: string | undefined): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("uk-UA", {
      year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit",
    });
  } catch { return iso; }
}

export function showNotice(text: string, isError = false): void {
  const el = $("notice");
  const div = document.createElement("div");
  div.className = `notice ${isError ? "notice-error" : "notice-success"}`;
  div.textContent = text;
  el.innerHTML = "";
  el.appendChild(div);
  setTimeout(() => { el.innerHTML = ""; }, 4000);
}

function renderStatus(containerId: string, status: Status, error?: ApiError | null): void {
  const el = $(containerId);
  if (status === "loading") {
    el.innerHTML = '<div class="status-loading">Завантаження...</div>';
  } else if (status === "empty") {
    el.innerHTML = '<div class="status-empty">Поки що немає записів.</div>';
  } else if (status === "error") {
    const msg = error?.message ?? "Невідома помилка";
    const div = document.createElement("div");
    div.className = "status-error";
    div.textContent = `Помилка: ${msg}`;
    if (error?.details) {
      const small = document.createElement("small");
      small.textContent = error.details;
      div.appendChild(document.createElement("br"));
      div.appendChild(small);
    }
    el.innerHTML = "";
    el.appendChild(div);
  } else {
    el.innerHTML = "";
  }
}

export function renderEventStatus(status: Status, error?: ApiError | null): void {
  renderStatus("eventStatus", status, error);
}

export function renderUserStatus(status: Status, error?: ApiError | null): void {
  renderStatus("userStatus", status, error);
}

export function renderRegistrationStatus(status: Status, error?: ApiError | null): void {
  renderStatus("registrationStatus", status, error);
}

function td(text: string, className = ""): HTMLTableCellElement {
  const cell = document.createElement("td");
  if (className) cell.className = className;
  cell.textContent = text;
  return cell;
}

function actionBtn(label: string, action: string, id: number, className: string): HTMLButtonElement {
  const btn = document.createElement("button");
  btn.className = `btn-sm ${className}`;
  btn.dataset.action = action;
  btn.dataset.id = String(id);
  btn.textContent = label;
  return btn;
}

export function renderEvents(items: EventDto[], sortCol: string, sortDir: string): void {
  const tbody = $("eventTableBody");
  tbody.innerHTML = "";

  document.querySelectorAll<HTMLElement>("#eventTable th[data-col]").forEach((th) => {
    const arrow = th.querySelector(".sort-arrow");
    if (arrow) {
      arrow.textContent = th.dataset.col === sortCol ? (sortDir === "asc" ? "▲" : "▼") : "";
    }
  });

  for (const ev of items) {
    const tr = document.createElement("tr");
    const regCount = ev.registrationCount ?? 0;
    const isFull = regCount >= ev.capacity;

    tr.appendChild(td(ev.title));
    tr.appendChild(td(ev.date));
    tr.appendChild(td(ev.location));
    tr.appendChild(td(String(ev.capacity)));

    const badge = document.createElement("span");
    badge.className = `badge ${isFull ? "badge-full" : "badge-ok"}`;
    badge.textContent = `${regCount} / ${ev.capacity}`;
    const badgeCell = document.createElement("td");
    badgeCell.appendChild(badge);
    tr.appendChild(badgeCell);

    tr.appendChild(td(formatDate(ev.createdAt)));

    const actions = document.createElement("td");
    actions.className = "actions";
    actions.appendChild(actionBtn("Ред", "edit-event", ev.id, "btn-edit"));
    actions.appendChild(actionBtn("Видал", "delete-event", ev.id, "btn-danger"));
    tr.appendChild(actions);

    tbody.appendChild(tr);
  }
}

export function renderUsers(items: UserDto[], sortCol: string, sortDir: string): void {
  const tbody = $("userTableBody");
  tbody.innerHTML = "";

  document.querySelectorAll<HTMLElement>("#userTable th[data-col]").forEach((th) => {
    const arrow = th.querySelector(".sort-arrow");
    if (arrow) {
      arrow.textContent = th.dataset.col === sortCol ? (sortDir === "asc" ? "▲" : "▼") : "";
    }
  });

  for (const u of items) {
    const tr = document.createElement("tr");
    tr.appendChild(td(u.name));
    tr.appendChild(td(u.email));
    tr.appendChild(td(formatDate(u.createdAt)));

    const actions = document.createElement("td");
    actions.className = "actions";
    actions.appendChild(actionBtn("Ред", "edit-user", u.id, "btn-edit"));
    actions.appendChild(actionBtn("Видал", "delete-user", u.id, "btn-danger"));
    tr.appendChild(actions);

    tbody.appendChild(tr);
  }
}

export function renderRegistrations(items: RegistrationDto[]): void {
  const tbody = $("registrationTableBody");
  tbody.innerHTML = "";

  for (const r of items) {
    const tr = document.createElement("tr");
    tr.appendChild(td(r.userName ?? "—"));
    tr.appendChild(td(r.userEmail ?? "—"));
    tr.appendChild(td(r.eventTitle ?? "—"));
    tr.appendChild(td(formatDate(r.registeredAt)));

    const actions = document.createElement("td");
    actions.className = "actions";
    actions.appendChild(actionBtn("Скасувати", "delete-registration", r.id, "btn-danger"));
    tr.appendChild(actions);

    tbody.appendChild(tr);
  }
}

export function renderEventPagination(total: number, page: number, pageSize: number, onPage: (p: number) => void): void {
  const el = $("eventPagination");
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1) { el.innerHTML = ""; return; }

  el.innerHTML = "";
  const prev = document.createElement("button");
  prev.textContent = "‹";
  prev.disabled = page <= 1;
  prev.addEventListener("click", () => onPage(page - 1));
  el.appendChild(prev);

  const span = document.createElement("span");
  span.textContent = `${page} / ${totalPages}`;
  el.appendChild(span);

  const next = document.createElement("button");
  next.textContent = "›";
  next.disabled = page >= totalPages;
  next.addEventListener("click", () => onPage(page + 1));
  el.appendChild(next);
}

function makePagination(
  containerId: string, total: number, page: number, pageSize: number, onPage: (p: number) => void,
): void {
  const el = $(containerId);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1) { el.innerHTML = ""; return; }

  el.innerHTML = "";
  const prev = document.createElement("button");
  prev.textContent = "‹";
  prev.disabled = page <= 1;
  prev.addEventListener("click", () => onPage(page - 1));
  el.appendChild(prev);

  const span = document.createElement("span");
  span.textContent = `${page} / ${totalPages}`;
  el.appendChild(span);

  const next = document.createElement("button");
  next.textContent = "›";
  next.disabled = page >= totalPages;
  next.addEventListener("click", () => onPage(page + 1));
  el.appendChild(next);
}

export function renderUserPagination(total: number, page: number, pageSize: number, onPage: (p: number) => void): void {
  makePagination("userPagination", total, page, pageSize, onPage);
}

export function renderRegistrationPagination(total: number, page: number, pageSize: number, onPage: (p: number) => void): void {
  makePagination("registrationPagination", total, page, pageSize, onPage);
}

export function populateEventSelect(items: EventDto[]): void {
  const sel = $("regEventSelect") as HTMLSelectElement;
  sel.innerHTML = '<option value="">Оберіть подію</option>';
  for (const ev of items) {
    const opt = document.createElement("option");
    opt.value = String(ev.id);
    opt.textContent = `${ev.title} (${ev.date})`;
    sel.appendChild(opt);
  }
}

export function populateUserSelect(items: UserDto[]): void {
  const sel = $("regUserSelect") as HTMLSelectElement;
  sel.innerHTML = '<option value="">Оберіть користувача</option>';
  for (const u of items) {
    const opt = document.createElement("option");
    opt.value = String(u.id);
    opt.textContent = `${u.name} (${u.email})`;
    sel.appendChild(opt);
  }
}

export function setFormBusy(formId: string, busy: boolean): void {
  const form = $(formId) as HTMLFormElement;
  const btns = form.querySelectorAll<HTMLButtonElement>("button[type=submit]");
  btns.forEach((b) => { b.disabled = busy; });
}

export function clearFieldErrors(formId: string): void {
  const form = $(formId) as HTMLFormElement;
  form.querySelectorAll(".field-error").forEach((e) => { e.textContent = ""; });
  form.querySelectorAll(".invalid").forEach((e) => e.classList.remove("invalid"));
}

export function showFieldError(inputId: string, errorId: string, msg: string): void {
  const inp = $(inputId) as HTMLElement;
  inp.classList.add("invalid");
  $(errorId).textContent = msg;
}

export function showValidationErrors(errors: Array<{ field: string; message: string }>): void {
  const fieldMap: Record<string, { input: string; error: string }> = {
    title: { input: "eventTitle", error: "eventTitleError" },
    date: { input: "eventDate", error: "eventDateError" },
    location: { input: "eventLocation", error: "eventLocationError" },
    capacity: { input: "eventCapacity", error: "eventCapacityError" },
    description: { input: "eventDescription", error: "eventDescriptionError" },
    name: { input: "userName", error: "userNameError" },
    email: { input: "userEmail", error: "userEmailError" },
    eventId: { input: "regEventSelect", error: "regEventError" },
    userId: { input: "regUserSelect", error: "regUserError" },
  };

  for (const err of errors) {
    const mapping = fieldMap[err.field];
    if (mapping) {
      showFieldError(mapping.input, mapping.error, err.message);
    }
  }
}

export function getEventFormData(): {
  title: string; date: string; location: string; capacity: number; description: string;
} {
  return {
    title: ($("eventTitle") as HTMLInputElement).value.trim(),
    date: ($("eventDate") as HTMLInputElement).value,
    location: ($("eventLocation") as HTMLInputElement).value.trim(),
    capacity: Number(($("eventCapacity") as HTMLInputElement).value),
    description: ($("eventDescription") as HTMLTextAreaElement).value.trim(),
  };
}

export function getUserFormData(): { name: string; email: string } {
  return {
    name: ($("userName") as HTMLInputElement).value.trim(),
    email: ($("userEmail") as HTMLInputElement).value.trim(),
  };
}

export function getRegistrationFormData(): { eventId: number; userId: number } {
  return {
    eventId: Number(($("regEventSelect") as HTMLSelectElement).value),
    userId: Number(($("regUserSelect") as HTMLSelectElement).value),
  };
}

export function setEventFormMode(mode: "create" | "edit", event?: EventDto): void {
  const title = $("eventFormTitle");
  const cancel = $("cancelEventEdit") as HTMLElement;
  if (mode === "edit" && event) {
    title.textContent = "Редагувати подію";
    cancel.style.display = "";
    ($("eventTitle") as HTMLInputElement).value = event.title;
    ($("eventDate") as HTMLInputElement).value = event.date;
    ($("eventLocation") as HTMLInputElement).value = event.location;
    ($("eventCapacity") as HTMLInputElement).value = String(event.capacity);
    ($("eventDescription") as HTMLTextAreaElement).value = event.description;
  } else {
    title.textContent = "Додати подію";
    cancel.style.display = "none";
    ($("eventForm") as HTMLFormElement).reset();
  }
}

export function setUserFormMode(mode: "create" | "edit", user?: UserDto): void {
  const title = $("userFormTitle");
  const cancel = $("cancelUserEdit") as HTMLElement;
  if (mode === "edit" && user) {
    title.textContent = "Редагувати користувача";
    cancel.style.display = "";
    ($("userName") as HTMLInputElement).value = user.name;
    ($("userEmail") as HTMLInputElement).value = user.email;
  } else {
    title.textContent = "Додати користувача";
    cancel.style.display = "none";
    ($("userForm") as HTMLFormElement).reset();
  }
}

export function updateEventCount(total: number): void {
  $("eventCount").textContent = `${total} подій`;
}

export function updateUserCount(total: number): void {
  $("userCount").textContent = `${total} користувачів`;
}

export function updateRegistrationCount(total: number): void {
  $("registrationCount").textContent = `${total} реєстрацій`;
}

export function renderDemoUserSelector(users: UserDto[], currentUserId: number, onChange: (id: number) => void): void {
  const container = $("demoUserSelector");
  container.innerHTML = "";

  const label = document.createElement("label");
  label.htmlFor = "demoUserSelect";
  label.textContent = "Увійшов як: ";
  container.appendChild(label);

  const sel = document.createElement("select");
  sel.id = "demoUserSelect";
  for (const u of users) {
    const opt = document.createElement("option");
    opt.value = String(u.id);
    opt.textContent = `${u.name} (${u.email})`;
    if (u.id === currentUserId) opt.selected = true;
    sel.appendChild(opt);
  }
  sel.addEventListener("change", () => {
    onChange(Number(sel.value));
  });
  container.appendChild(sel);
}
