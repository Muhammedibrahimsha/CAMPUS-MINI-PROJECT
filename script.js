// Only a logged-in student can open this page
const user = JSON.parse(sessionStorage.getItem("campusSession"));
if (!user || user.role !== "student") location.href = "login.html";

const form = document.getElementById("issueForm");
const list = document.getElementById("issueList");
const search = document.getElementById("search");
let filter = "All";

document.getElementById("hello").textContent = "Hi, " + user.name;
document.getElementById("logout").onclick = () => {
  sessionStorage.removeItem("campusSession");
  location.href = "login.html";
};

const load = () => JSON.parse(localStorage.getItem("campusIssues")) || [];
const save = data => localStorage.setItem("campusIssues", JSON.stringify(data));

function toast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg; t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 2200);
}

function render() {
  // A student sees only their own issues
  const mine = load().filter(i => i.email === user.email);
  document.getElementById("sTotal").textContent = mine.length;
  document.getElementById("sPending").textContent = mine.filter(i => !i.resolved).length;
  document.getElementById("sDone").textContent = mine.filter(i => i.resolved).length;

  const q = search.value.toLowerCase();
  const shown = mine.filter(i =>
    (filter === "All" || (filter === "Resolved") === i.resolved) &&
    (i.location + i.description + i.category).toLowerCase().includes(q)
  );

  list.innerHTML = "";
  if (!shown.length) {
    list.innerHTML = '<div class="empty">No issues yet. Report one using the form.</div>';
    return;
  }
  shown.forEach(i => {
    const el = document.createElement("article");
    el.className = "ticket" + (i.resolved ? " done" : "");
    el.innerHTML = `
      <div class="top"><h3></h3><span class="tag ${i.priority}">${i.priority} priority</span></div>
      <p class="desc"></p>
      <p class="meta"></p>
      <div class="actions"></div>`;
    el.querySelector("h3").textContent = i.category + " · " + i.location;
    el.querySelector(".desc").textContent = i.description;
    el.querySelector(".meta").textContent = `Reported on ${i.date} | Status: ${i.resolved ? "Resolved" : "Pending"}`;

    // Students can withdraw an issue only while it is pending
    if (!i.resolved) {
      const del = document.createElement("button");
      del.className = "del"; del.textContent = "Withdraw issue";
      del.onclick = () => { save(load().filter(x => x.id !== i.id)); render(); toast("Issue withdrawn"); };
      el.querySelector(".actions").appendChild(del);
    }
    list.appendChild(el);
  });
}

form.addEventListener("submit", e => {
  e.preventDefault();
  const all = load();
  all.unshift({
    id: Date.now(),
    name: user.name,
    email: user.email,
    location: document.getElementById("location").value.trim(),
    category: document.getElementById("category").value,
    priority: document.getElementById("priority").value,
    description: document.getElementById("description").value.trim(),
    date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
    resolved: false
  });
  save(all); render(); form.reset(); toast("Issue reported");
});

search.addEventListener("input", render);
document.getElementById("chips").addEventListener("click", e => {
  if (!e.target.dataset.f) return;
  filter = e.target.dataset.f;
  document.querySelectorAll(".chip").forEach(c => c.classList.toggle("active", c === e.target));
  render();
});

render();