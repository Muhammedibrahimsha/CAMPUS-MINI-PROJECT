const $ = id => document.getElementById(id);
const ADMIN = { email: "admin@campus.com", password: "admin123", name: "Administrator" };
let role = "student", mode = "login";

const getUsers = () => JSON.parse(localStorage.getItem("campusUsers")) || [];

function updateView() {
  const registering = role === "student" && mode === "register";
  $("regForm").hidden = !registering;
  $("loginForm").hidden = registering;
  $("swap").hidden = role === "admin";
  $("hint").hidden = role !== "admin";
  $("toggle").textContent = registering ? "Back to log in" : "Create an account";
  $("title").textContent = role === "admin" ? "Admin log in"
    : registering ? "Create your account" : "Log in to report issues";
  $("msg").textContent = "";
}

function startSession(user, userRole) {
  sessionStorage.setItem("campusSession", JSON.stringify({ role: userRole, name: user.name, email: user.email }));
  location.href = userRole === "admin" ? "admin.html" : "index.html";
}

document.querySelectorAll(".tab").forEach(tab => {
  tab.onclick = () => {
    role = tab.dataset.role; mode = "login";
    document.querySelectorAll(".tab").forEach(t => t.classList.toggle("active", t === tab));
    updateView();
  };
});

$("toggle").onclick = e => {
  e.preventDefault();
  mode = mode === "login" ? "register" : "login";
  updateView();
};

$("loginForm").onsubmit = e => {
  e.preventDefault();
  const email = $("lEmail").value.trim().toLowerCase();
  const pass = $("lPass").value;

  if (role === "admin") {
    if (email === ADMIN.email && pass === ADMIN.password) return startSession(ADMIN, "admin");
    $("msg").textContent = "Wrong admin email or password.";
    return;
  }
  const user = getUsers().find(u => u.email === email && u.password === pass);
  if (user) startSession(user, "student");
  else $("msg").textContent = "Wrong email or password. New here? Create an account.";
};

$("regForm").onsubmit = e => {
  e.preventDefault();
  const email = $("rEmail").value.trim().toLowerCase();
  const users = getUsers();
  if (users.some(u => u.email === email)) {
    $("msg").textContent = "This email is already registered. Please log in.";
    return;
  }
  const user = { name: $("rName").value.trim(), email, password: $("rPass").value };
  users.push(user);
  localStorage.setItem("campusUsers", JSON.stringify(users));
  startSession(user, "student");
};

updateView();