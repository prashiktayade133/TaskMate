/* TaskMate - Interactive To-Do List
   Concepts: variables, functions, arrays, objects, conditionals, loops,
   array methods, DOM manipulation, events and localStorage.
*/
const STORAGE_KEY = "taskmate_tasks_v1";
let tasks = loadTasks();
let activeCategory = "All";

const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const categoryInput = document.getElementById("categoryInput");
const priorityInput = document.getElementById("priorityInput");
const taskList = document.getElementById("taskList");
const searchInput = document.getElementById("searchInput");
const filterSelect = document.getElementById("filterSelect");
const emptyState = document.getElementById("emptyState");
const formMessage = document.getElementById("formMessage");

function loadTasks() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(saved) ? saved : [];
  } catch (error) {
    return [];
  }
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function createTask(name, category, priority) {
  return {
    id: Date.now().toString() + Math.random().toString(16).slice(2, 7),
    name: name.trim(),
    category,
    priority,
    completed: false,
    createdAt: new Date().toISOString()
  };
}

function addTask(event) {
  event.preventDefault();
  const name = taskInput.value.trim();
  if (!name) {
    formMessage.textContent = "Please enter a task name first.";
    formMessage.style.color = "#df6666";
    taskInput.focus();
    return;
  }
  const duplicate = tasks.some(task => task.name.toLowerCase() === name.toLowerCase() && !task.completed);
  if (duplicate) {
    formMessage.textContent = "That active task is already on your list.";
    formMessage.style.color = "#d28a35";
    return;
  }
  tasks.unshift(createTask(name, categoryInput.value, priorityInput.value));
  saveTasks();
  renderTasks();
  taskForm.reset();
  priorityInput.value = "Medium";
  formMessage.textContent = "Task added successfully!";
  formMessage.style.color = "#24a879";
  taskInput.focus();
}

function getVisibleTasks() {
  const searchTerm = searchInput.value.trim().toLowerCase();
  const status = filterSelect.value;
  return tasks.filter(task => {
    const matchesSearch = task.name.toLowerCase().includes(searchTerm);
    const matchesStatus = status === "All" || (status === "Active" && !task.completed) ||
      (status === "Completed" && task.completed);
    const matchesCategory = activeCategory === "All" || task.category === activeCategory;
    return matchesSearch && matchesStatus && matchesCategory;
  });
}

function renderTasks() {
  const visibleTasks = getVisibleTasks();
  taskList.innerHTML = "";

  visibleTasks.forEach(task => {
    const item = document.createElement("li");
    item.className = `task-item${task.completed ? " done" : ""}`;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "task-check";
    checkbox.checked = task.completed;
    checkbox.setAttribute("aria-label", `Mark ${task.name} completed`);
    checkbox.addEventListener("change", () => toggleTask(task.id));

    const main = document.createElement("div");
    main.className = "task-main";
    const name = document.createElement("div");
    name.className = "task-name";
    name.textContent = task.name;
    const meta = document.createElement("div");
    meta.className = "task-meta";
    const category = document.createElement("span");
    category.className = "tag";
    category.textContent = task.category;
    const priority = document.createElement("span");
    priority.className = `priority ${task.priority}`;
    priority.textContent = `${task.priority} priority`;
    meta.append(category, priority);
    main.append(name, meta);

    const actions = document.createElement("div");
    actions.className = "task-actions";
    const editButton = document.createElement("button");
    editButton.className = "icon-btn";
    editButton.type = "button";
    editButton.textContent = "✎";
    editButton.title = "Edit task";
    editButton.setAttribute("aria-label", `Edit ${task.name}`);
    editButton.addEventListener("click", () => editTask(task.id));

    const deleteButton = document.createElement("button");
    deleteButton.className = "icon-btn";
    deleteButton.type = "button";
    deleteButton.textContent = "×";
    deleteButton.title = "Delete task";
    deleteButton.setAttribute("aria-label", `Delete ${task.name}`);
    deleteButton.addEventListener("click", () => deleteTask(task.id));

    actions.append(editButton, deleteButton);
    item.append(checkbox, main, actions);
    taskList.appendChild(item);
  });

  const completed = tasks.filter(task => task.completed).length;
  const remaining = tasks.length - completed;
  document.getElementById("totalCount").textContent = tasks.length;
  document.getElementById("completedCount").textContent = completed;
  document.getElementById("remainingCount").textContent = remaining;
  document.getElementById("listCount").textContent = visibleTasks.length;
  emptyState.classList.toggle("show", visibleTasks.length === 0);
  document.getElementById("footerSummary").textContent =
    tasks.length === 0 ? "You’re all caught up." : `${remaining} task${remaining === 1 ? "" : "s"} remaining`;
}

function toggleTask(id) {
  tasks = tasks.map(task => task.id === id ? { ...task, completed: !task.completed } : task);
  saveTasks();
  renderTasks();
}

function editTask(id) {
  const task = tasks.find(item => item.id === id);
  if (!task) return;
  const updatedName = prompt("Edit task name:", task.name);
  if (updatedName === null) return;
  if (!updatedName.trim()) {
    alert("Task name cannot be empty.");
    return;
  }
  task.name = updatedName.trim();
  saveTasks();
  renderTasks();
}

function deleteTask(id) {
  const task = tasks.find(item => item.id === id);
  if (!task) return;
  if (!confirm(`Delete "${task.name}"?`)) return;
  tasks = tasks.filter(item => item.id !== id);
  saveTasks();
  renderTasks();
}

function clearCompleted() {
  const completedCount = tasks.filter(task => task.completed).length;
  if (completedCount === 0) {
    formMessage.textContent = "There are no completed tasks to clear.";
    formMessage.style.color = "#85869b";
    return;
  }
  if (!confirm(`Clear ${completedCount} completed task(s)?`)) return;
  tasks = tasks.filter(task => !task.completed);
  saveTasks();
  renderTasks();
}

taskForm.addEventListener("submit", addTask);
searchInput.addEventListener("input", renderTasks);
filterSelect.addEventListener("change", renderTasks);
document.getElementById("clearCompletedBtn").addEventListener("click", clearCompleted);

document.getElementById("categoryFilters").addEventListener("click", event => {
  const button = event.target.closest("button[data-category]");
  if (!button) return;
  activeCategory = button.dataset.category;
  document.querySelectorAll(".filter-chip").forEach(chip => chip.classList.toggle("active", chip === button));
  renderTasks();
});

document.getElementById("todayDate").textContent = new Date().toLocaleDateString("en-IN", {
  weekday: "short", day: "2-digit", month: "short", year: "numeric"
}).toUpperCase();

renderTasks();
