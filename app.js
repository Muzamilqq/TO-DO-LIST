// ── State ──────────────────────────────────────────────────────────────────
let tasks = JSON.parse(localStorage.getItem("doit_tasks") || "[]");
let filter = "all";

function save() {
  localStorage.setItem("doit_tasks", JSON.stringify(tasks));
}

// ── Render ─────────────────────────────────────────────────────────────────
function render() {
  const list = document.getElementById("task-list");
  const visible = tasks.filter((t) =>
    filter === "all" ? true : filter === "done" ? t.done : !t.done,
  );

  // Stats
  const total = tasks.length;
  const done = tasks.filter((t) => t.done).length;
  document.getElementById("stat-total").textContent = total;
  document.getElementById("stat-done").textContent = done;
  document.getElementById("stat-left").textContent = total - done;

  // Clear completed btn
  document.getElementById("clear-btn").disabled = done === 0;

  // List
  if (visible.length === 0) {
    list.innerHTML = `
      <div class="empty">
        <div class="empty-icon">◻</div>
        <p>${filter === "done" ? "Nothing completed yet" : "No tasks here"}</p>
      </div>`;
    return;
  }

  list.innerHTML = "";
  visible.forEach((task, i) => {
    const item = document.createElement("div");
    item.className = "task-item" + (task.done ? " done" : "");
    item.dataset.id = task.id;
    item.innerHTML = `
      <span class="task-num">${String(i + 1).padStart(2, "0")}</span>
      <label class="check-wrap">
        <input type="checkbox" ${task.done ? "checked" : ""} />
        <span class="check-box"></span>
      </label>
      <span class="task-text">${escHtml(task.text)}</span>
      <button class="del-btn" title="Remove">×</button>
    `;

    item
      .querySelector("input[type=checkbox]")
      .addEventListener("change", () => toggle(task.id));
    item
      .querySelector(".del-btn")
      .addEventListener("click", () => remove(task.id, item));
    list.appendChild(item);
  });
}

function escHtml(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ── Actions ────────────────────────────────────────────────────────────────
function addTask(text) {
  text = text.trim();
  if (!text) return;
  tasks.unshift({ id: Date.now(), text, done: false });
  save();
  render();
}

function toggle(id) {
  const t = tasks.find((t) => t.id === id);
  if (t) {
    t.done = !t.done;
    save();
    render();
  }
}

function remove(id, el) {
  el.classList.add("removing");
  el.addEventListener(
    "animationend",
    () => {
      tasks = tasks.filter((t) => t.id !== id);
      save();
      render();
    },
    { once: true },
  );
}

function clearDone() {
  tasks = tasks.filter((t) => !t.done);
  save();
  render();
}

// ── Events ─────────────────────────────────────────────────────────────────
document.getElementById("add-btn").addEventListener("click", () => {
  const inp = document.getElementById("task-input");
  addTask(inp.value);
  inp.value = "";
  inp.focus();
});

document.getElementById("task-input").addEventListener("keydown", (e) => {
  if (e.key === "Enter") document.getElementById("add-btn").click();
});

document.querySelectorAll(".filter-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelector(".filter-btn.active").classList.remove("active");
    btn.classList.add("active");
    filter = btn.dataset.filter;
    render();
  });
});

document.getElementById("clear-btn").addEventListener("click", clearDone);

// ── Init ───────────────────────────────────────────────────────────────────
render();
