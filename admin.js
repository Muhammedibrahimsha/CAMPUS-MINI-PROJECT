// Only the admin can open this page
const admin = JSON.parse(sessionStorage.getItem("campusSession"));
if (!admin || admin.role !== "admin") location.href = "login.html";

const list = document.getElementById("issueList");
const search = document.getElementById("search");
let filter = "All";

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
  const issues = load();
  document.getElementById("sTotal").textContent = issues.length;
  document.getElementById("sPending").textContent = issues.filter(i => !i.resolved).length;
  document.getElementById("sDone").textContent = issues.filter(i => i.resolved).length;

  const q = search.value.toLowerCase();
  const rank = { High: 0, Medium: 1, Low: 2 };
  const shown = issues
    .filter(i =>
      (filter === "All" || (filter === "Resolved") === i.resolved) &&
      ((i.location + i.name + i.description + i.category).toLowerCase().includes(q)))
    // Pending first, then High priority first
    .sort((a, b) => a.resolved - b.resolved || rank[a.priority] - rank[b.priority]);

  list.innerHTML = "";
  if (!shown.length) {
    list.innerHTML = '<div class="empty">No issues found.</div>';
    return;
  }
  shown.forEach(i => {
    const el = document.createElement("article");
    el.className = "ticket" + (i.resolved ? " done" : "");
    el.innerHTML = `
      <div class="top"><h3></h3><span class="tag ${i.priority}">${i.priority} priority</span></div>
      <p class="desc"></p>
      <p class="meta"></p>
      <div class="actions">
        <button class="ok">${i.resolved ? "Reopen" : "Mark resolved"}</button>
        <button class="del">Delete</button>
      </div>`;
    el.querySelector("h3").textContent = i.category + " · " + i.location;
    el.querySelector(".desc").textContent = i.description;
    el.querySelector(".meta").textContent = `Reported by ${i.name}${i.email ? " (" + i.email + ")" : ""} on ${i.date}`;
    el.querySelector(".ok").onclick = () => {
      i.resolved = !i.resolved; save(issues); render();
      toast(i.resolved ? "Marked resolved" : "Issue reopened");
    };
    el.querySelector(".del").onclick = () => {
      save(issues.filter(x => x.id !== i.id)); render(); toast("Issue deleted");
    };
    list.appendChild(el);
  });
}

search.addEventListener("input", render);
document.getElementById("chips").addEventListener("click", e => {
  if (!e.target.dataset.f) return;
  filter = e.target.dataset.f;
  document.querySelectorAll(".chip").forEach(c => c.classList.toggle("active", c === e.target));
  render();
});

render();