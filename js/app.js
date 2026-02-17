/* =========================================
   UNIVERSITY ADMIN PORTAL - FINAL VERSION
========================================= */

/* =========================================
   PASSWORD HASHING (SHA-256)
========================================= */
const hashPassword = async (password) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const buffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
};

/* =========================================
   USER DATA (Encrypted Password)
========================================= */
const users = [
  {
    id: 1,
    username: "admin",
    password: "",
    role: "admin",
    failedAttempts: 0,   // ADD THIS
    isLocked: false      // ADD THIS
  },
  {
    id: 2,
    username: "student",
    password: "",
    role: "student",
    failedAttempts: 0,
    isLocked: false
  }
];
(async () => {
  users[0].password = await hashPassword("admin123");
  users[1].password = await hashPassword("student123");
})();


// ================== LOGIN FUNCTION ==================
function login() {

  const userId = Number(document.getElementById("userId").value);
  const role = document.getElementById("role").value;
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  if (!userId || !role || !username || !password) {
    alert("Please fill all fields!");
    return;
  }

  const user = users.find(u =>
    u.id === userId &&
    u.username === username &&
    u.password === password &&
    u.role === role
  );}

/* =========================================
   SESSION MANAGEMENT
========================================= */
const saveSession = (user) =>
  localStorage.setItem("session", JSON.stringify(user));

const getSession = () =>
  JSON.parse(localStorage.getItem("session"));

const clearSession = () =>
  localStorage.removeItem("session");

/* =========================================
   DOM ELEMENTS
========================================= */
const content = document.getElementById("content");
const welcome = document.getElementById("welcome");

/* =========================================
   LOGIN HANDLER
========================================= */

const loginForm = document.getElementById("loginForm");

if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const userId = Number(document.getElementById("userId").value);
    const role = document.getElementById("role").value;
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!userId || !role || !username || !password) {
      alert("Please fill all fields!");
      return;
    }

    const user = users.find(u =>
      u.id === userId &&
      u.username === username &&
      u.role === role
    );

    if (!user) {
      alert("Invalid User Details");
      return;
    }

    if (user.isLocked) {
      alert("Account Locked");
      return;
    }

    const hashedInput = await hashPassword(password);

    if (hashedInput === user.password) {

      user.failedAttempts = 0;
      saveSession(user);
      alert("Login Successful!");
      location.reload();

    } else {

      user.failedAttempts = (user.failedAttempts || 0) + 1;

      if (user.failedAttempts >= 3) {
        user.isLocked = true;
        alert("Account Locked after 3 attempts");
      } else {
        alert(`Wrong Password. Attempts left: ${3 - user.failedAttempts}`);
      }
    }
  });
}

/* =========================================
   DASHBOARD HOME
========================================= */
const renderDashboardHome = () => {
  content.innerHTML = `
    <div class="card">
      <h2>University Admin Portal</h2>
      <p>Features Implemented:</p>
      <ul>
        <li>✔ SHA-256 Authentication</li>
        <li>✔ Student Performance Analytics</li>
        <li>✔ Task Manager with Persistence</li>
        <li>✔ Product Filtering System</li>
        <li>✔ Countdown Timer</li>
        <li>✔ ES6 OOP Role Management</li>
      </ul>
    </div>
  `;
};

/* =========================================
   DASHBOARD LOAD
========================================= */

const loginPage = document.getElementById("loginPage");
const dashboardPage = document.getElementById("dashboardPage");

const loadDashboard = () => {
  const user = getSession();
  if (!user) return;

  document.getElementById("welcome").textContent =
    `Welcome ${user.username} (${user.role})`;

  renderDashboardHome(); // now it works
};

const showDashboard = () => {
  loginPage.style.display = "none";
  dashboardPage.style.display = "flex";
};

const showLogin = () => {
  loginPage.style.display = "flex";
  dashboardPage.style.display = "none";
};

if (getSession()) {
  showDashboard();
  loadDashboard();
}
document.querySelectorAll(".sidebar ul li").forEach(item => {
  item.addEventListener("click", function() {
    document.querySelectorAll(".sidebar ul li")
      .forEach(i => i.classList.remove("active"));
    this.classList.add("active");
  });
});


/* =========================================
   LOGOUT
========================================= */
document.getElementById("logoutBtn")?.addEventListener("click", () => {
  clearSession();
  location.reload();
});

/* =========================================
   SIDEBAR NAVIGATION
========================================= */
document.querySelector(".sidebar")?.addEventListener("click", (e) => {
  const section = e.target.dataset.section;
  if (!section) return;

  switch (section) {
    case "dashboard": renderDashboardHome(); break;
    case "student": renderStudentAnalyzer(); break;
    case "todo": renderTodo(); break;
    case "products": renderProducts(); break;
    case "timer": renderTimer(); break;
    case "oop": renderOOP(); break;
  }
});

document.querySelectorAll(".sidebar button").forEach(btn => {
  btn.addEventListener("click", function() {
    document.querySelectorAll(".sidebar button")
      .forEach(b => b.classList.remove("active"));
    this.classList.add("active");
  });
});

/* =========================================
   STUDENT ANALYZER + CHART
========================================= */
let students = [];

const renderStudentAnalyzer = () => {
  content.innerHTML = `
    <h2>Student Analyzer</h2>
    <input id="sname" placeholder="Student Name">
    ${[1,2,3,4,5].map(()=>`<input type="number" class="mark" placeholder="Mark">`).join("")}
    <button id="addStudent">Add Student</button>
    <canvas id="chartCanvas"></canvas>
    <table>
      <thead>
        <tr><th>Rank</th><th>Name</th><th>Total</th><th>Avg</th></tr>
      </thead>
      <tbody id="result"></tbody>
    </table>
  `;

  document.getElementById("addStudent").onclick = () => {
    const name = sname.value.trim();
    const marks = [...document.querySelectorAll(".mark")].map(m => +m.value);

    if (!name || marks.some(m => m < 0 || m > 100))
      return alert("Invalid Input");

    const total = marks.reduce((a,b)=>a+b,0);
    const avg = total / 5;

    students.push({ name, total, avg });

    const sorted = [...students].sort((a,b)=>b.total-a.total);

    result.innerHTML = sorted.map((s,i)=>`
      <tr>
        <td>${i+1}</td>
        <td>${s.name}</td>
        <td>${s.total}</td>
        <td>${s.avg.toFixed(2)}</td>
      </tr>
    `).join("");

    renderChart(sorted);
  };
};

const renderChart = (data) => {
  const ctx = document.getElementById("chartCanvas");
  new Chart(ctx, {
    type: "bar",
    data: {
      labels: data.map(s=>s.name),
      datasets: [{
        label: "Total Marks",
        data: data.map(s=>s.total)
      }]
    },
    options: { responsive: true }
  });
};

/* =========================================
   TODO SYSTEM
========================================= */
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

const renderTodo = () => {
  content.innerHTML = `
    <h2>Task Manager</h2>
    <input id="taskInput" placeholder="New Task">
    <button id="addTask">Update</button>
    <ul id="taskList"></ul>
  `;

  const update = () => {
    taskList.innerHTML = tasks.map(t=>`
      <li data-id="${t.id}" class="${t.isCompleted?'done':''}">
        ${t.title}
        <button class="del">Remove</button>
      </li>
    `).join("");
  };

  update();

  addTask.onclick = () => {
    if (!taskInput.value) return;
    tasks.push({
      id: Date.now(),
      title: taskInput.value,
      isCompleted: false,
      createdAt: new Date()
    });
    localStorage.setItem("tasks", JSON.stringify(tasks));
    update();
  };

  taskList.onclick = (e) => {
    const id = +e.target.closest("li").dataset.id;

    if (e.target.classList.contains("del"))
      tasks = tasks.filter(t=>t.id!==id);
    else
      tasks = tasks.map(t=>t.id===id?{...t,isCompleted:!t.isCompleted}:t);

    localStorage.setItem("tasks", JSON.stringify(tasks));
    update();
  };
};

/* =========================================
   PRODUCT FILTER
========================================= */
const products = Array.from({length:20},(_,i)=>({
  id:i+1,
  name:`Product ${i+1}`,
  category:i%2?"Books":"Electronics",
  price:Math.floor(Math.random()*5000),
  rating:(Math.random()*5).toFixed(1)
}));

const renderProducts = () => {
  content.innerHTML = `
    <h2>Product Search</h2>
    <input id="search" placeholder="Search product">
    <div id="plist"></div>
  `;

  const display = items => {
    plist.innerHTML = items.length
      ? items.map(p=>`
        <div class="card">
          <h4>${p.name}</h4>
          <p>${p.category}</p>
          <p>₹${p.price}</p>
          <p>${p.rating}★</p>
        </div>
      `).join("")
      : "<p>No Results Found</p>";
  };

  display(products);

  search.oninput = () => {
    const val = search.value.toLowerCase();
    display(products.filter(p=>p.name.toLowerCase().includes(val)));
  };
};

/* =========================================
   TIMER + DIGITAL CLOCK
========================================= */
const renderTimer = () => {
  content.innerHTML = `
    <h2>Timer</h2>
    <div id="clock"></div>
    <input id="min" placeholder="Minutes">
    <input id="sec" placeholder="Seconds">
    <button id="start">Start</button>
    <div id="display">00:00:00</div>
  `;

  setInterval(()=>{
    clock.textContent = new Date().toLocaleTimeString();
  },1000);

  let interval = null;

  start.onclick = () => {
    let total = (+min.value * 60) + (+sec.value);
    if (interval) return;

    interval = setInterval(()=>{
      if (total <= 0) {
        clearInterval(interval);
        interval = null;
        alert("Time Up!");
      }
      const h=Math.floor(total/3600);
      const m=Math.floor((total%3600)/60);
      const s=total%60;
      display.textContent=`${h}:${m}:${s}`;
      total--;
    },1000);
  };
};

/* =========================================
   OOP ROLE SYSTEM
========================================= */
class User {
  constructor(name){ this.name = name; }
  getRole(){ return "User"; }
}
class Student extends User {
  getRole(){ return "Student"; }
}
class Admin extends User {
  getRole(){ return "Admin"; }
}

const renderOOP = () => {
  const users = [
    new Student("Arun"),
    new Admin("Admin1"),
    new Student("Aruna"),
    new Admin("Admin2")
  ];

  content.innerHTML = `
    <h2>Role Management System</h2>

    <div class="role-container">
      ${users.map(u => `
        <div class="role-card ${u.getRole().toLowerCase()}">
          <h3>${u.name}</h3>
          <p>${u.getRole()}</p>
        </div>
      `).join("")}
    </div>
  `;
};


/* =========================================
   THEME TOGGLE
========================================= */
document.getElementById("themeToggle")?.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  localStorage.setItem("theme", document.body.classList.contains("dark"));
});

if (localStorage.getItem("theme") === "true")
  document.body.classList.add("dark");
// ================== USER DATABASE ==================


  if (user) {
    alert("Login Successful!");
    localStorage.setItem("loggedUser", JSON.stringify(user));
  } else {
    alert("Invalid credentials!");
  }
