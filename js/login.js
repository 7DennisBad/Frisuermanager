// Passwort anzeigen/ausblenden
const passwordInput = document.getElementById('password');
const toggleButton = document.getElementById('togglePassword');
const icon = document.getElementById('icon');

toggleButton.addEventListener('click', () => {
  if (passwordInput.type === 'password') {
    passwordInput.type = 'text';
    icon.className = 'bx bxs-lock-open-alt';
  } else {
    passwordInput.type = 'password';
    icon.className = 'bx bxs-lock-alt';
  }
});

// Login-Funktion für normalen Benutzer
function proceedLogin(){
  console.log("Login successful!");
  window.location.href = "../html/minigame.html";
}

// Login-Funktion für 'bob'
function proceedOwnerLogin(){
  console.log("Owner login successful!");
  window.location.href = "../html/owner.html";
}

function showError(){
  alert("Incorrect username or password!");
  // window.open("https://www.youtube.com/watch?v=dQw4w9WgXcQ", "_blank");
  // window.location.href = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
}

function checkLoginData(userNameIn, userPassIn, users) {
  // Spezialfall für bob
  if (userNameIn === "bob" && userPassIn === "bob1234") {
    proceedOwnerLogin();
    return;
  }

  const user = users.find(user => user.userName === userNameIn);
  if (user) {
    if (user.userPass === userPassIn) {
      proceedLogin();
    } else {
      showError();
    }
  } else {
    showError();
  }
}
document.addEventListener("DOMContentLoaded", function () {
  const passwordInput = document.getElementById("userPass");
  const toggleButton = document.getElementById("togglePassword");
  const icon = document.getElementById("icon");

  toggleButton.addEventListener("click", () => {
    const isHidden = passwordInput.type === "password";
    passwordInput.type = isHidden ? "text" : "password";
    icon.className = isHidden ? "bx bxs-lock-open-alt" : "bx bxs-lock-alt";
  });
});
function loadJson(userNameIn, userPassIn) {
  fetch("../json/Logins.json")
    .then(response => response.json())
    .then(users => checkLoginData(userNameIn, userPassIn, users))
    .catch(error => console.error("Error loading JSON:", error));
}

function attemptLogin() {
  let userNameIn = document.getElementById("userName").value;
  let userPassIn = document.getElementById("userPass").value;
  loadJson(userNameIn, userPassIn);
}
