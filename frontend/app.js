const API_BASE = "http://localhost:3000/api";

const state = {
  events: [],
  users: [],
  registrations: [],
  editingEventId: null,
  editingUserId: null,
  eventSort: { col: null, dir: "asc" },
  userSort: { col: null, dir: "asc" },
  eventPage: 1,
  eventSearch: "",
  userSearch: "",
};

async function apiRequest(method, path, body) {
  const opts = {
    method,
    headers: { "Content-Type": "application/json" },
  };
  if (body !== undefined) opts.body = JSON.stringify(body);

  const res = await fetch(`${API_BASE}${path}`, opts);

  if (!res.ok) {
    let errMsg = `HTTP ${res.status}`;
    try {
      const errData = await res.json();
      errMsg = errData.error?.message || errData.error || errMsg;
    } catch {}
    throw new Error(errMsg);
  }

  if (res.status === 204) return null;
  return await res.json();
}

function buildQuery(params) {
  const parts = [];
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") {
      parts.push(`${encodeURIComponent(k)}=${encodeURIComponent(v)}`);
    }
  }
  return parts.length ? "?" + parts.join("&") : "";
}

async function loadEvents() {
  try {
    const params = { page: state.eventPage, pageSize: 10 };
    if (state.eventSort.col) {
      params.sortBy = state.eventSort.col;
      params.sortDir = state.eventSort.dir;
    }
    if (state.eventSearch) params.search = state.eventSearch;

    const result = await apiRequest("GET", "/events" + buildQuery(params));
    state.events = result.data || [];
    document.getElementById("eventCount").textContent = `${result.meta?.total ?? state.events.length} подій`;
    renderEvents();
    renderEventPagination(result.meta?.total ?? state.events.length);
  } catch (err) {
    showMessage("Помилка завантаження подій: " + err.message, true);
  }
}

async function loadUsers() {
  try {
    const params = {};
    if (state.userSort.col) {
      params.sortBy = state.userSort.col;
      params.sortDir = state.userSort.dir;
    }
    if (state.userSearch) params.search = state.userSearch;

    const result = await apiRequest("GET", "/users" + buildQuery(params));
    state.users = result.data || [];
    document.getElementById("userCount").textContent = `${result.meta?.total ?? state.users.length} користувачів`;
    renderUsers();
  } catch (err) {
    showMessage("Помилка завантаження користувачів: " + err.message, true);
  }
}

async function loadRegistrations() {
  try {
    const result = await apiRequest("GET", "/registrations");
    state.registrations = result.data || [];
    document.getElementById("registrationCount").textContent =
      `${result.meta?.total ?? state.registrations.length} реєстрацій`;
    renderRegistrations();
  } catch (err) {
    showMessage("Помилка завантаження реєстрацій: " + err.message, true);
  }
}

function renderEvents() {
  const tbody = document.getElementById("eventTableBody");
  tbody.innerHTML = "";

  const headers = document.querySelectorAll("#eventTable th[data-col]");
  headers.forEach((th) => {
    const arrow = th.querySelector(".sort-arrow");
    arrow.textContent = th.dataset.col === state.eventSort.col ? (state.eventSort.dir === "asc" ? "▲" : "▼") : "";
  });

  if (state.events.length === 0) {
    tbody.innerHTML = '<tr class="empty-row"><td colspan="7">Немає подій</td></tr>';
    return;
  }

  state.events.forEach((ev) => {
    const row = document.createElement("tr");
    if (state.editingEventId === ev.id) row.classList.add("editing-row");

    const regCount = ev.registrationCount ?? 0;
    const isFull = regCount >= ev.capacity;

    row.innerHTML = `
      <td>${escHtml(ev.title)}</td>
      <td>${escHtml(ev.date)}</td>
      <td>${escHtml(ev.location)}</td>
      <td>${ev.capacity}</td>
      <td><span class="registration-count ${isFull ? "full" : ""}">${regCount} / ${ev.capacity}</span></td>
      <td>${formatDate(ev.createdAt)}</td>
      <td>
        <button class="btn-edit" data-action="edit-event" data-id="${ev.id}">Ред</button>
        <button class="btn-delete" data-action="delete-event" data-id="${ev.id}">Видал</button>
      </td>
    `;

    tbody.appendChild(row);
  });
}

function renderUsers() {
  const tbody = document.getElementById("userTableBody");
  tbody.innerHTML = "";

  const headers = document.querySelectorAll("#userTable th[data-col]");
  headers.forEach((th) => {
    const arrow = th.querySelector(".sort-arrow");
    arrow.textContent = th.dataset.col === state.userSort.col ? (state.userSort.dir === "asc" ? "▲" : "▼") : "";
  });

  if (state.users.length === 0) {
    tbody.innerHTML = '<tr class="empty-row"><td colspan="4">Немає користувачів</td></tr>';
    return;
  }

  state.users.forEach((u) => {
    const row = document.createElement("tr");
    if (state.editingUserId === u.id) row.classList.add("editing-row");

    row.innerHTML = `
      <td>${escHtml(u.name)}</td>
      <td>${escHtml(u.email)}</td>
      <td>${formatDate(u.createdAt)}</td>
      <td>
        <button class="btn-edit" data-action="edit-user" data-id="${u.id}">Ред</button>
        <button class="btn-delete" data-action="delete-user" data-id="${u.id}">Видал</button>
      </td>
    `;

    tbody.appendChild(row);
  });
}

function renderRegistrations() {
  const tbody = document.getElementById("registrationTableBody");
  tbody.innerHTML = "";

  if (state.registrations.length === 0) {
    tbody.innerHTML = '<tr class="empty-row"><td colspan="5">Немає реєстрацій</td></tr>';
    return;
  }

  state.registrations.forEach((r) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${escHtml(r.userName || "—")}</td>
      <td>${escHtml(r.userEmail || "—")}</td>
      <td>${escHtml(r.eventTitle || "—")}</td>
      <td>${formatDate(r.registeredAt)}</td>
      <td>
        <button class="btn-danger" data-action="delete-registration" data-id="${r.id}">Скасувати</button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

function renderEventPagination(total) {
  const container = document.getElementById("eventPagination");
  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  if (totalPages <= 1) {
    container.innerHTML = "";
    return;
  }

  container.innerHTML = "";
  const prevBtn = document.createElement("button");
  prevBtn.textContent = "‹";
  prevBtn.disabled = state.eventPage <= 1;
  prevBtn.addEventListener("click", () => {
    state.eventPage--;
    loadEvents();
  });
  container.appendChild(prevBtn);

  const span = document.createElement("span");
  span.textContent = `${state.eventPage} / ${totalPages}`;
  container.appendChild(span);

  const nextBtn = document.createElement("button");
  nextBtn.textContent = "›";
  nextBtn.disabled = state.eventPage >= totalPages;
  nextBtn.addEventListener("click", () => {
    state.eventPage++;
    loadEvents();
  });
  container.appendChild(nextBtn);
}

function formatDate(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("uk-UA", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function escHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function showMessage(text, isError) {
  const existing = document.querySelector(".message");
  if (existing) existing.remove();

  const msg = document.createElement("div");
  msg.className = `message ${isError ? "message-error" : "message-success"}`;
  msg.textContent = text;
  const main = document.querySelector("main");
  main.prepend(msg);
  setTimeout(() => msg.remove(), 4000);
}

function clearErrors(form) {
  form.querySelectorAll(".error-text").forEach((e) => (e.textContent = ""));
  form.querySelectorAll(".invalid").forEach((e) => e.classList.remove("invalid"));
}

function setError(inputId, errorId, message) {
  document.getElementById(errorId).textContent = message;
  document.getElementById(inputId).classList.add("invalid");
}

document.addEventListener("DOMContentLoaded", () => {
  loadEvents();
  loadUsers();
  loadRegistrations();
  populateSelects();
});

async function populateSelects() {
  try {
    const [eventsResult, usersResult] = await Promise.all([
      apiRequest("GET", "/events?pageSize=100"),
      apiRequest("GET", "/users?pageSize=100"),
    ]);

    const eventSelect = document.getElementById("regEventSelect");
    eventSelect.innerHTML = '<option value="">Оберіть подію</option>';
    (eventsResult.data || []).forEach((ev) => {
      const opt = document.createElement("option");
      opt.value = ev.id;
      opt.textContent = `${ev.title} (${ev.date})`;
      eventSelect.appendChild(opt);
    });

    const userSelect = document.getElementById("regUserSelect");
    userSelect.innerHTML = '<option value="">Оберіть користувача</option>';
    (usersResult.data || []).forEach((u) => {
      const opt = document.createElement("option");
      opt.value = u.id;
      opt.textContent = `${u.name} (${u.email})`;
      userSelect.appendChild(opt);
    });
  } catch (err) {
    console.error("Failed to populate selects:", err);
  }
}

document.getElementById("eventForm").addEventListener("submit", async function (e) {
  e.preventDefault();
  clearErrors(this);

  const title = document.getElementById("eventTitle").value.trim();
  const date = document.getElementById("eventDate").value;
  const location = document.getElementById("eventLocation").value.trim();
  const capacity = Number(document.getElementById("eventCapacity").value);
  const description = document.getElementById("eventDescription").value.trim();

  let valid = true;
  if (!title || title.length < 2) {
    setError("eventTitle", "eventTitleError", "Мінімум 2 символи");
    valid = false;
  }
  if (!date) {
    setError("eventDate", "eventDateError", "Вкажіть дату");
    valid = false;
  }
  if (!location || location.length < 2) {
    setError("eventLocation", "eventLocationError", "Мінімум 2 символи");
    valid = false;
  }
  if (!capacity || capacity < 1) {
    setError("eventCapacity", "eventCapacityError", "Число > 0");
    valid = false;
  }
  if (!valid) return;

  const body = { title, date, location, capacity, description };

  try {
    if (state.editingEventId) {
      await apiRequest("PUT", `/events/${state.editingEventId}`, body);
      state.editingEventId = null;
      document.getElementById("eventFormTitle").textContent = "Додати подію";
      document.getElementById("cancelEventEdit").style.display = "none";
      showMessage("Подію оновлено", false);
    } else {
      await apiRequest("POST", "/events", body);
      showMessage("Подію створено", false);
    }

    this.reset();
    state.eventPage = 1;
    await loadEvents();
    await populateSelects();
  } catch (err) {
    showMessage("Помилка: " + err.message, true);
  }
});

document.getElementById("cancelEventEdit").addEventListener("click", function () {
  state.editingEventId = null;
  document.getElementById("eventForm").reset();
  clearErrors(document.getElementById("eventForm"));
  document.getElementById("eventFormTitle").textContent = "Додати подію";
  this.style.display = "none";
});

document.getElementById("eventTableBody").addEventListener("click", async function (e) {
  const action = e.target.dataset.action;
  const id = Number(e.target.dataset.id);
  if (!id) return;

  if (action === "delete-event") {
    if (!confirm("Видалити подію?")) return;
    try {
      await apiRequest("DELETE", `/events/${id}`);
      if (state.editingEventId === id) {
        state.editingEventId = null;
        document.getElementById("eventForm").reset();
        document.getElementById("eventFormTitle").textContent = "Додати подію";
        document.getElementById("cancelEventEdit").style.display = "none";
      }
      showMessage("Подію видалено", false);
      await loadEvents();
      await populateSelects();
    } catch (err) {
      showMessage("Помилка: " + err.message, true);
    }
  }

  if (action === "edit-event") {
    try {
      const result = await apiRequest("GET", `/events/${id}`);
      const ev = result.data || result;
      document.getElementById("eventTitle").value = ev.title;
      document.getElementById("eventDate").value = ev.date;
      document.getElementById("eventLocation").value = ev.location;
      document.getElementById("eventCapacity").value = ev.capacity;
      document.getElementById("eventDescription").value = ev.description || "";
      state.editingEventId = id;
      document.getElementById("eventFormTitle").textContent = "Редагувати подію";
      document.getElementById("cancelEventEdit").style.display = "";
    } catch (err) {
      showMessage("Помилка: " + err.message, true);
    }
  }
});

document.querySelectorAll("#eventTable th[data-col]").forEach((th) => {
  th.addEventListener("click", function () {
    const col = this.dataset.col;
    if (state.eventSort.col === col) {
      state.eventSort.dir = state.eventSort.dir === "asc" ? "desc" : "asc";
    } else {
      state.eventSort.col = col;
      state.eventSort.dir = "asc";
    }
    state.eventPage = 1;
    loadEvents();
  });
});

document.getElementById("eventSearch").addEventListener("input", function () {
  state.eventSearch = this.value;
  state.eventPage = 1;
  loadEvents();
});

document.getElementById("userForm").addEventListener("submit", async function (e) {
  e.preventDefault();
  clearErrors(this);

  const name = document.getElementById("userName").value.trim();
  const email = document.getElementById("userEmail").value.trim();

  let valid = true;
  if (!name || name.length < 2) {
    setError("userName", "userNameError", "Мінімум 2 символи");
    valid = false;
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    setError("userEmail", "userEmailError", "Коректний email");
    valid = false;
  }
  if (!valid) return;

  try {
    if (state.editingUserId) {
      await apiRequest("PUT", `/users/${state.editingUserId}`, { name, email });
      state.editingUserId = null;
      document.getElementById("userFormTitle").textContent = "Додати користувача";
      document.getElementById("cancelUserEdit").style.display = "none";
      showMessage("Користувача оновлено", false);
    } else {
      await apiRequest("POST", "/users", { name, email });
      showMessage("Користувача створено", false);
    }

    this.reset();
    await loadUsers();
    await populateSelects();
  } catch (err) {
    showMessage("Помилка: " + err.message, true);
  }
});

document.getElementById("cancelUserEdit").addEventListener("click", function () {
  state.editingUserId = null;
  document.getElementById("userForm").reset();
  clearErrors(document.getElementById("userForm"));
  document.getElementById("userFormTitle").textContent = "Додати користувача";
  this.style.display = "none";
});

document.getElementById("userTableBody").addEventListener("click", async function (e) {
  const action = e.target.dataset.action;
  const id = Number(e.target.dataset.id);
  if (!id) return;

  if (action === "delete-user") {
    if (!confirm("Видалити користувача?")) return;
    try {
      await apiRequest("DELETE", `/users/${id}`);
      if (state.editingUserId === id) {
        state.editingUserId = null;
        document.getElementById("userForm").reset();
        document.getElementById("userFormTitle").textContent = "Додати користувача";
        document.getElementById("cancelUserEdit").style.display = "none";
      }
      showMessage("Користувача видалено", false);
      await loadUsers();
      await populateSelects();
    } catch (err) {
      showMessage("Помилка: " + err.message, true);
    }
  }

  if (action === "edit-user") {
    try {
      const result = await apiRequest("GET", `/users/${id}`);
      const u = result.data || result;
      document.getElementById("userName").value = u.name;
      document.getElementById("userEmail").value = u.email;
      state.editingUserId = id;
      document.getElementById("userFormTitle").textContent = "Редагувати користувача";
      document.getElementById("cancelUserEdit").style.display = "";
    } catch (err) {
      showMessage("Помилка: " + err.message, true);
    }
  }
});

document.querySelectorAll("#userTable th[data-col]").forEach((th) => {
  th.addEventListener("click", function () {
    const col = this.dataset.col;
    if (state.userSort.col === col) {
      state.userSort.dir = state.userSort.dir === "asc" ? "desc" : "asc";
    } else {
      state.userSort.col = col;
      state.userSort.dir = "asc";
    }
    loadUsers();
  });
});

document.getElementById("userSearch").addEventListener("input", function () {
  state.userSearch = this.value;
  loadUsers();
});

document.getElementById("registrationForm").addEventListener("submit", async function (e) {
  e.preventDefault();
  clearErrors(this);

  const eventId = Number(document.getElementById("regEventSelect").value);
  const userId = Number(document.getElementById("regUserSelect").value);

  let valid = true;
  if (!eventId) {
    setError("regEventSelect", "regEventError", "Оберіть подію");
    valid = false;
  }
  if (!userId) {
    setError("regUserSelect", "regUserError", "Оберіть користувача");
    valid = false;
  }
  if (!valid) return;

  try {
    await apiRequest("POST", "/registrations", { eventId, userId });
    showMessage("Реєстрацію створено", false);
    this.reset();
    await loadRegistrations();
    await loadEvents();
  } catch (err) {
    showMessage("Помилка: " + err.message, true);
  }
});

document.getElementById("registrationTableBody").addEventListener("click", async function (e) {
  if (e.target.dataset.action !== "delete-registration") return;
  const id = Number(e.target.dataset.id);
  if (!id) return;

  if (!confirm("Скасувати реєстрацію?")) return;
  try {
    await apiRequest("DELETE", `/registrations/${id}`);
    showMessage("Реєстрацію скасовано", false);
    await loadRegistrations();
    await loadEvents();
  } catch (err) {
    showMessage("Помилка: " + err.message, true);
  }
});
