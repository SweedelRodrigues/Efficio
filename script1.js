
const themeSwitch = document.getElementById('themeSwitch');
const themePicker = document.getElementById('themePicker');
const container = document.querySelector('.container');
const body = document.body;

themeSwitch.addEventListener('change', () => {
  const isDark = themeSwitch.checked;
  setDarkMode(isDark);
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
});

themePicker.addEventListener('change', () => {
  const theme = themePicker.value;
  applyTheme(theme);
  localStorage.setItem('themeStyle', theme);
});

function setDarkMode(isDark) {
  body.classList.toggle('dark-mode', isDark);
  container.classList.toggle('dark-mode', isDark);
  document.querySelectorAll('.task').forEach(task => {
    task.classList.toggle('dark-mode', isDark);
  });
}

function applyTheme(theme) {
  body.classList.remove('modern', 'nature', 'neon');
  container.classList.remove('theme-modern', 'theme-nature', 'theme-neon');
  body.classList.add(theme);
  container.classList.add(`theme-${theme}`);
}

window.onload = () => {
  const savedTheme = localStorage.getItem('theme') === 'dark';
  const savedStyle = localStorage.getItem('themeStyle') || 'modern';
  themeSwitch.checked = savedTheme;
  themePicker.value = savedStyle;
  setDarkMode(savedTheme);
  applyTheme(savedStyle);

  loadTasksFromLocalStorage();
  updateProgress();
};


function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2000);
}


function saveTasksToLocalStorage() {
  const tasks = [];
  document.querySelectorAll('.task').forEach(task => {
    const content = task.querySelector('.task-content');
    const [titleEl, descEl, infoEl, categoryEl] = content.children;
    const [priority, date, time] = infoEl.textContent.split(/ \| | /);
    tasks.push({
      text: titleEl.textContent,
      desc: descEl.textContent,
      priority: priority.toLowerCase(),
      date,
      time,
      category: categoryEl.textContent,
      completed: task.classList.contains('completed')
    });
  });
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

function loadTasksFromLocalStorage() {
  const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
  tasks.forEach(task => {
    const li = createTaskElement(task);
    if (task.completed) li.classList.add('completed');
    document.getElementById('taskList').appendChild(li);
  });
}


function addTask() {
  const text = document.getElementById('taskInput').value.trim();
  const date = document.getElementById('dueDateInput').value;
  const time = document.getElementById('dueTimeInput').value;
  const desc = document.getElementById('taskDescInput').value.trim();
  const priority = document.getElementById('prioritySelect').value;
  const category = document.getElementById('categorySelect').value;

  if (!text) {
    showToast("❗ Please enter a task.");
    return;
  }

  const li = createTaskElement({ text, date, time, desc, priority, category });
  document.getElementById('taskList').appendChild(li);

  
  document.getElementById('taskInput').value = '';
  document.getElementById('dueDateInput').value = '';
  document.getElementById('dueTimeInput').value = '';
  document.getElementById('taskDescInput').value = '';
  document.getElementById('categorySelect').value = 'Work';

  showToast("✅ Task inserted!");
  saveTasksToLocalStorage();
  updateProgress();
}

function createTaskElement({ text, date, time, desc, priority, category, completed }) {
  const li = document.createElement('li');
  li.className = `task ${priority}`;
  li.dataset.category = category;
  if (body.classList.contains('dark-mode')) li.classList.add('dark-mode');
  if (completed) li.classList.add('completed');

  const content = document.createElement('div');
  content.className = 'task-content';
  content.innerHTML = `
    <strong>${text}</strong><br/>
    <em>${desc}</em><br/>
    <small>${priority.toUpperCase()} | ${date} ${time}</small><br/>
    <span><b>📁 ${category}</b></span>
  `;

  const actions = document.createElement('div');
  actions.className = 'task-actions';

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.checked = completed || false;
  checkbox.addEventListener('change', () => {
    li.classList.toggle('completed');
    showToast("☑️ Task completed!");
    saveTasksToLocalStorage();
    updateProgress();
  });

  const editBtn = document.createElement('button');
  editBtn.textContent = 'Edit';
  editBtn.className = 'edit-btn';
  editBtn.addEventListener('click', () => editTask(li, content));

  const deleteBtn = document.createElement('button');
  deleteBtn.textContent = 'Delete';
  deleteBtn.className = 'delete-btn';
  deleteBtn.addEventListener('click', () => {
    li.remove();
    showToast("🗑️ Task deleted!");
    saveTasksToLocalStorage();
    updateProgress();
  });

  actions.appendChild(checkbox);
  actions.appendChild(editBtn);
  actions.appendChild(deleteBtn);

  li.appendChild(content);
  li.appendChild(actions);

  return li;
}

function editTask(taskEl, contentEl) {
  const [titleEl, descEl, infoEl, categoryEl] = contentEl.children;
  const oldText = titleEl.textContent;
  const oldDesc = descEl.textContent;
  const [priority, date, time] = infoEl.textContent.split(/ \| | /);
  const oldCategory = categoryEl.textContent.replace('📁 ', '');

  contentEl.innerHTML = `
    <input type="text" value="${oldText}" class="edit-input"/><br/>
    <textarea class="edit-desc">${oldDesc}</textarea><br/>
    <select class="edit-priority">
      <option value="low" ${priority === 'LOW' ? 'selected' : ''}>🌱 Low</option>
      <option value="medium" ${priority === 'MEDIUM' ? 'selected' : ''}>⚡ Medium</option>
      <option value="high" ${priority === 'HIGH' ? 'selected' : ''}>🔥 High</option>
    </select><br/>
    <input type="date" class="edit-date" value="${date}"/>
    <input type="time" class="edit-time" value="${time}"/>
    <select class="edit-category">
      <option value="Work" ${oldCategory === 'Work' ? 'selected' : ''}>💼 Work</option>
      <option value="Personal" ${oldCategory === 'Personal' ? 'selected' : ''}>🏠 Personal</option>
      <option value="Urgent" ${oldCategory === 'Urgent' ? 'selected' : ''}>⚠️ Urgent</option>
    </select>
    <button class="save-btn">Save</button>
  `;

  contentEl.querySelector('.save-btn').addEventListener('click', () => {
    const newText = contentEl.querySelector('.edit-input').value;
    const newDesc = contentEl.querySelector('.edit-desc').value;
    const newPriority = contentEl.querySelector('.edit-priority').value;
    const newDate = contentEl.querySelector('.edit-date').value;
    const newTime = contentEl.querySelector('.edit-time').value;
    const newCategory = contentEl.querySelector('.edit-category').value;

    taskEl.className = `task ${newPriority}`;
    taskEl.dataset.category = newCategory;
    if (body.classList.contains('dark-mode')) taskEl.classList.add('dark-mode');

    contentEl.innerHTML = `
      <strong>${newText}</strong><br/>
      <em>${newDesc}</em><br/>
      <small>${newPriority.toUpperCase()} | ${newDate} ${newTime}</small><br/>
      <span><b>📁 ${newCategory}</b></span>
    `;
    showToast("✏️ Task updated!");
    saveTasksToLocalStorage();
  });
}

function updateProgress() {
  const tasks = document.querySelectorAll('.task');
  const completed = document.querySelectorAll('.task.completed');
  const percent = tasks.length === 0 ? 0 : Math.round((completed.length / tasks.length) * 100);
  const box = document.getElementById('progressBox');

  box.textContent = `Progress: ${percent}%`;
  box.classList.remove('low', 'medium', 'high');

  if (percent < 40) box.classList.add('low');
  else if (percent < 70) box.classList.add('medium');
  else box.classList.add('high');
}

function filterTasksByCategory() {
  const filter = document.getElementById('filterCategory').value;
  document.querySelectorAll('.task').forEach(task => {
    const match = task.dataset.category === filter || filter === 'all';
    task.style.display = match ? 'block' : 'none';
  });
}



