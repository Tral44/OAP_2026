'use strict'

const STORAGE_KEY = 'EventsStorage';
const state = {
    events: [],
    editingId: null
};

const eventForm         = document.getElementById('eventForm');
const formTitle         = document.getElementById('formTitle');
const cancelEditBtn     = document.getElementById('cancelEdit');

const titleInput        = document.getElementById('title');
const dateInput         = document.getElementById('date');
const locationInput     = document.getElementById('location');
const capacityInput     = document.getElementById('capacity');
const descriptionInput  = document.getElementById('description');

const titleError        = document.getElementById('titleError');
const dateError         = document.getElementById('dateError');
const locationError     = document.getElementById('locationError');
const capacityError     = document.getElementById('capacityError');

const searchInput       = document.getElementById('search');
const sortSelect        = document.getElementById('sortSelect');
const eventTableBody    = document.getElementById('eventTableBody');

function saveToStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.events));
}

function loadFromStorage() {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return;

    try {
        state.events = JSON.parse(data);
    }
    catch {
        state.events = [];
    }
}

function readForm() {
    return {
      title:        titleInput.value.trim(),
      date:         dateInput.value,
      location:     locationInput.value.trim(),
      capacity:     Number(capacityInput.value),
      description:  descriptionInput.value.trim()
    };
}

function clearErrors() {
    [titleError, dateError, locationError, capacityError].forEach(e => e.textContent = '');
    [titleInput, dateInput, locationInput, capacityInput].forEach(i => i.classList.remove('invalid'));
}

function validate(data) {
    clearErrors();
    let valid = true;

    if (!data.title) {
      titleError.textContent = "Обов'язкове поле";
      titleInput.classList.add('invalid');
      valid = false;
    }

    if (!data.date) {
      dateError.textContent = "Вкажіть дату";
      dateInput.classList.add('invalid');
      valid = false;
    }

    if (!data.location) {
      locationError.textContent = "Обов'язкове поле";
      locationInput.classList.add('invalid');
      valid = false;
    }

    if (!data.capacity || data.capacity < 1) {
      capacityError.textContent = "Впишіть число більше 0";
      capacityInput.classList.add('invalid');
      valid = false;
    }

    return valid;
}

function render() {
    eventTableBody.innerHTML = '';

    let list = [...state.events];

    const searchValue = searchInput.value.toLowerCase();
    if (searchValue) {
      list = list.filter(e => e.title.toLowerCase().includes(searchValue));
    }

    if (sortSelect.value === 'date') {
      list.sort((a,b) => new Date(a.date) - new Date(b.date));
    }

    if (sortSelect.value === 'capacity') {
      list.sort((a,b) => a.capacity - b.capacity);
    }

    list.forEach(event => {
      const row = document.createElement('tr');

      row.innerHTML = `
        <td>${event.title}</td>
        <td>${event.date}</td>
        <td>${event.location}</td>
        <td>${event.capacity}</td>
        <td>
          <button data-action="edit" data-id="${event.id}">Редагувати</button>
          <button data-action="delete" data-id="${event.id}">Видалити</button>
        </td>
      `;

      eventTableBody.appendChild(row);
    });
}

eventForm.addEventListener('submit', function(e) {
    e.preventDefault();

    const data = readForm();
    if (!validate(data)) return;

    if (state.editingId) {
      const index = state.events.findIndex(e => e.id === state.editingId);
      state.events[index] = { ...data, id: state.editingId };
      state.editingId = null;
      formTitle.textContent = "Додати подію";
    } 
    else {
      state.events.push({...data, id: crypto.randomUUID()});
    }

    saveToStorage();
    eventForm.reset();
    render();
  });

  cancelEditBtn.addEventListener('click', function() {
    state.editingId = null;
    eventForm.reset();
    formTitle.textContent = "Додати подію";
  });

eventTableBody.addEventListener('click', function(e) {
    const id = e.target.dataset.id;
    const action = e.target.dataset.action;
    if (!id) return;

    if (action === 'delete') {
      state.events = state.events.filter(e => e.id !== id);
    }

    if (action === 'edit') {
      const event = state.events.find(e => e.id === id);

      titleInput.value = event.title;
      dateInput.value = event.date;
      locationInput.value = event.location;
      capacityInput.value = event.capacity;
      descriptionInput.value = event.description;

      state.editingId = id;
      formTitle.textContent = "Редагування події";
    }

    saveToStorage();
    render();
});

searchInput.addEventListener('input', render);
sortSelect.addEventListener('change', render);

loadFromStorage();

render();
