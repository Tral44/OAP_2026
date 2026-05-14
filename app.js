'use strict';

const EVENTS_KEY = 'EventsStorage';
const USERS_KEY  = 'UsersStorage';

const state = {
  events:          [],
  editingEventId:  null,

  users:           [],
  editingUserId:   null,

  eventSort: { col: null, dir: 'asc' },
  userSort:  { col: null, dir: 'asc' },
};


const eventForm        = document.getElementById('eventForm');
const formTitle        = document.getElementById('formTitle');
const cancelEditBtn    = document.getElementById('cancelEdit');

const titleInput       = document.getElementById('title');
const dateInput        = document.getElementById('date');
const locationInput    = document.getElementById('location');
const capacityInput    = document.getElementById('capacity');
const descriptionInput = document.getElementById('description');

const titleError       = document.getElementById('titleError');
const dateError        = document.getElementById('dateError');
const locationError    = document.getElementById('locationError');
const capacityError    = document.getElementById('capacityError');

const searchInput      = document.getElementById('search');
const eventTableBody   = document.getElementById('eventTableBody');

const eventTableHeaders = document.querySelectorAll('#eventTable th[data-col]');


const userForm         = document.getElementById('userForm');
const userFormTitle    = document.getElementById('userFormTitle');
const cancelUserEditBtn= document.getElementById('cancelUserEdit');

const userNameInput    = document.getElementById('userName');
const userEmailInput   = document.getElementById('userEmail');

const userNameError    = document.getElementById('userNameError');
const userEmailError   = document.getElementById('userEmailError');

const userTableBody    = document.getElementById('userTableBody');

const userTableHeaders = document.querySelectorAll('#userTable th[data-col]');


function saveEvents() {
  localStorage.setItem(EVENTS_KEY, JSON.stringify(state.events));
}

function loadEvents() {
  try {
    const data = localStorage.getItem(EVENTS_KEY);
    state.events = data ? JSON.parse(data) : [];
  } catch {
    state.events = [];
  }
}

function saveUsers() {
  localStorage.setItem(USERS_KEY, JSON.stringify(state.users));
}

function loadUsers() {
  try {
    const data = localStorage.getItem(USERS_KEY);
    state.users = data ? JSON.parse(data) : [];
  } catch {
    state.users = [];
  }
}

function readEventForm() {
  return {
    title:       titleInput.value.trim(),
    date:        dateInput.value,
    location:    locationInput.value.trim(),
    capacity:    Number(capacityInput.value),
    description: descriptionInput.value.trim(),
  };
}


function readUserForm() {
  return {
    name:  userNameInput.value.trim(),
    email: userEmailInput.value.trim(),
  };
}


function clearEventErrors() {
  [titleError, dateError, locationError, capacityError]
    .forEach(e => (e.textContent = ''));
  [titleInput, dateInput, locationInput, capacityInput]
    .forEach(i => i.classList.remove('invalid'));
}


function clearUserErrors() {
  [userNameError, userEmailError].forEach(e => (e.textContent = ''));
  [userNameInput, userEmailInput].forEach(i => i.classList.remove('invalid'));
}


function validateEvent(data) {
  clearEventErrors();
  let valid = true;

  if (!data.title) {
    titleError.textContent = "Обов'язкове поле";
    titleInput.classList.add('invalid');
    valid = false;
  }
  if (!data.date) {
    dateError.textContent = 'Вкажіть дату';
    dateInput.classList.add('invalid');
    valid = false;
  }
  if (!data.location) {
    locationError.textContent = "Обов'язкове поле";
    locationInput.classList.add('invalid');
    valid = false;
  }
  if (!data.capacity || data.capacity < 1) {
    capacityError.textContent = 'Впишіть число більше 0';
    capacityInput.classList.add('invalid');
    valid = false;
  }
  return valid;
}


function validateUser(data) {
  clearUserErrors();
  let valid = true;

  if (!data.name || data.name.length < 2) {
    userNameError.textContent = "Обов'язкове поле (мінімум 2 символи)";
    userNameInput.classList.add('invalid');
    valid = false;
  }

  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!data.email || !emailRe.test(data.email)) {
    userEmailError.textContent = 'Введіть коректний email';
    userEmailInput.classList.add('invalid');
    valid = false;
  }

  return valid;
}


function sortList(list, sortState) {
  if (!sortState.col) return list;

  return [...list].sort((a, b) => {
    const valA = a[sortState.col];
    const valB = b[sortState.col];

    let result;
    if (typeof valA === 'number' && typeof valB === 'number') {
      result = valA - valB;
    } else {
      result = String(valA).localeCompare(String(valB), 'uk');
    }

    return sortState.dir === 'desc' ? -result : result;
  });
}

function updateSortArrows(headers, sortState) {
  headers.forEach(th => {
    const arrow = th.querySelector('.sort-arrow');
    if (th.dataset.col === sortState.col) {
      // Ця колонка активна — показуємо стрілку
      arrow.textContent = sortState.dir === 'asc' ? '▲' : '▼';
    } else {
      // Інші колонки — стрілки немає
      arrow.textContent = '';
    }
  });
}

function renderEvents() {
  eventTableBody.innerHTML = '';

  let list = [...state.events];

  const searchValue = searchInput.value.toLowerCase();
  if (searchValue) {
    list = list.filter(e => e.title.toLowerCase().includes(searchValue));
  }

  list = sortList(list, state.eventSort);

  updateSortArrows(eventTableHeaders, state.eventSort);

  list.forEach(event => {
    const row = document.createElement('tr');

    if (state.editingEventId === event.id) {
      row.classList.add('editing-row');
    }

    row.innerHTML = `
      <td>${event.title}</td>
      <td>${event.date}</td>
      <td>${event.location}</td>
      <td>${event.capacity}</td>
      <td>
        <button data-action="edit" class="buttonediting" data-id="${event.id}">Редагувати</button>
        <button data-action="delete" class="buttondelete" data-id="${event.id}">Видалити</button>
      </td>
    `;

    eventTableBody.appendChild(row);
  });
}

function renderUsers() {
  userTableBody.innerHTML = '';

  let list = sortList([...state.users], state.userSort);

  updateSortArrows(userTableHeaders, state.userSort);

  list.forEach(user => {
    const row = document.createElement('tr');

    if (state.editingUserId === user.id) {
      row.classList.add('editing-row');
    }

    row.innerHTML = `
      <td>${user.name}</td>
      <td>${user.email}</td>
      <td>
        <button data-action="edit" class="buttonediting" data-id="${user.id}">Редагувати</button>
        <button data-action="delete" class="buttondelete" data-id="${user.id}">Видалити</button>
      </td>
    `;

    userTableBody.appendChild(row);
  });
}


eventForm.addEventListener('submit', function (e) {
  e.preventDefault();
  const data = readEventForm();
  if (!validateEvent(data)) return;

  if (state.editingEventId) {
    const index = state.events.findIndex(ev => ev.id === state.editingEventId);
    state.events[index] = { ...data, id: state.editingEventId };
    state.editingEventId = null;
    formTitle.textContent = 'Додати подію';
  } else {
    state.events.push({ ...data, id: crypto.randomUUID() });
  }

  saveEvents();
  eventForm.reset();
  clearEventErrors();
  renderEvents();
});


cancelEditBtn.addEventListener('click', function () {
  state.editingEventId = null;
  eventForm.reset();
  clearEventErrors();
  formTitle.textContent = 'Додати подію';
  renderEvents();
});

eventTableBody.addEventListener('click', function (e) {
  const id     = e.target.dataset.id;
  const action = e.target.dataset.action;
  if (!id) return;

  if (action === 'delete') {
    state.events = state.events.filter(ev => ev.id !== id);
    if (state.editingEventId === id) {
      state.editingEventId = null;
      eventForm.reset();
      clearEventErrors();
      formTitle.textContent = 'Додати подію';
    }
  }

  if (action === 'edit') {
    const event = state.events.find(ev => ev.id === id);
    titleInput.value       = event.title;
    dateInput.value        = event.date;
    locationInput.value    = event.location;
    capacityInput.value    = event.capacity;
    descriptionInput.value = event.description;
    state.editingEventId   = id;
    formTitle.textContent  = 'Редагування події';
    clearEventErrors();
  }

  saveEvents();
  renderEvents();
});


eventTableHeaders.forEach(th => {
  th.addEventListener('click', function () {
    const col = this.dataset.col;

    if (state.eventSort.col === col) {
      state.eventSort.dir = state.eventSort.dir === 'asc' ? 'desc' : 'asc';
    } else {
      state.eventSort.col = col;
      state.eventSort.dir = 'asc';
    }

    renderEvents();
  });
});


userForm.addEventListener('submit', function (e) {
  e.preventDefault();
  const data = readUserForm();
  if (!validateUser(data)) return;

  const duplicate = state.users.find(
    u => u.email.toLowerCase() === data.email.toLowerCase() && u.id !== state.editingUserId
  );
  if (duplicate) {
    userEmailError.textContent = 'Користувач з таким email вже існує';
    userEmailInput.classList.add('invalid');
    return;
  }

  if (state.editingUserId) {
    const index = state.users.findIndex(u => u.id === state.editingUserId);
    state.users[index] = { ...data, id: state.editingUserId };
    state.editingUserId = null;
    userFormTitle.textContent = 'Додати користувача';
  } else {
    state.users.push({ ...data, id: crypto.randomUUID() });
  }

  saveUsers();
  userForm.reset();
  clearUserErrors();
  renderUsers();
});


cancelUserEditBtn.addEventListener('click', function () {
  state.editingUserId = null;
  userForm.reset();
  clearUserErrors();
  userFormTitle.textContent = 'Додати користувача';
  renderUsers();
});

userTableBody.addEventListener('click', function (e) {
  const id     = e.target.dataset.id;
  const action = e.target.dataset.action;
  if (!id) return;

  if (action === 'delete') {
    state.users = state.users.filter(u => u.id !== id);
    if (state.editingUserId === id) {
      state.editingUserId = null;
      userForm.reset();
      clearUserErrors();
      userFormTitle.textContent = 'Додати користувача';
    }
  }

  if (action === 'edit') {
    const user = state.users.find(u => u.id === id);
    userNameInput.value       = user.name;
    userEmailInput.value      = user.email;
    state.editingUserId       = id;
    userFormTitle.textContent = 'Редагування користувача';
    clearUserErrors();
  }

  saveUsers();
  renderUsers();
});

userTableHeaders.forEach(th => {
  th.addEventListener('click', function () {
    const col = this.dataset.col;

    if (state.userSort.col === col) {
      state.userSort.dir = state.userSort.dir === 'asc' ? 'desc' : 'asc';
    } else {
      state.userSort.col = col;
      state.userSort.dir = 'asc';
    }

    renderUsers();
  });
});

searchInput.addEventListener('input', renderEvents);

loadEvents();
loadUsers();
renderEvents();
renderUsers();
