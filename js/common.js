// Common functionality shared across all pages
document.addEventListener("DOMContentLoaded", () => {
  // UI Elements
  const themeToggleBtn = document.getElementById("theme-toggle-btn")
  const mobileMenuBtn = document.querySelector(".mobile-menu-btn")
  const header = document.querySelector(".header")
  const toastContainer = document.getElementById("toast-container")
  const messageSound = document.getElementById("message-sound")
  const notificationSound = document.getElementById("notification-sound")
  const loginNavLink = document.getElementById("login-nav")

  // Initialize the app
  function init() {
    // Set up event listeners
    setupEventListeners()

    // Check for saved theme preference
    checkThemePreference()

    // Check if user is logged in
    checkUserLoginStatus()
  }

  // Set up event listeners
  function setupEventListeners() {
    // Mobile menu toggle
    if (mobileMenuBtn) {
      mobileMenuBtn.addEventListener("click", toggleMobileMenu)
    }

    // Theme toggle
    if (themeToggleBtn) {
      themeToggleBtn.addEventListener("click", toggleTheme)
    }
  }

  // Toggle mobile menu
  function toggleMobileMenu() {
    header.classList.toggle("menu-open")
    playSound("message-sound")
  }

  // Toggle theme
  function toggleTheme() {
    document.documentElement.classList.toggle("dark-mode")

    // Update icon
    const themeIcon = themeToggleBtn.querySelector("i")
    if (document.documentElement.classList.contains("dark-mode")) {
      themeIcon.className = "fas fa-sun"
      localStorage.setItem("theme", "dark")
      showToast("Dark mode enabled", "info")
    } else {
      themeIcon.className = "fas fa-moon"
      localStorage.setItem("theme", "light")
      showToast("Light mode enabled", "info")
    }

    // Play sound
    playSound("message-sound")
  }

  // Check for saved theme preference
  function checkThemePreference() {
    const savedTheme = localStorage.getItem("theme")
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark-mode")
      themeToggleBtn.querySelector("i").className = "fas fa-sun"
    }
  }

// Check user login status
function checkUserLoginStatus() {
  const user = JSON.parse(sessionStorage.getItem("user"))

  if (user && loginNavLink) {
    // Replace Login link with Profile and Logout
    loginNavLink.innerHTML = `
      <div class="dropdown">
        <a href="profile.html"><i class="fas fa-user-circle"></i> Profile</a>
        <button id="logout-btn" class="logout-btn"><i class="fas fa-sign-out-alt"></i> Logout</button>
      </div>
    `

    // Logout functionality
    setTimeout(() => {
      const logoutBtn = document.getElementById("logout-btn")
      if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
          sessionStorage.removeItem("user")
          showToast("Logged out successfully!", "success")
          setTimeout(() => {
            window.location.href = "login.html"
          }, 1000)
        })
      }
    }, 100)
  }
}

  
  
  
  // function checkUserLoginStatus() {
  //   const isLoggedIn = localStorage.getItem("user")

  //   if (isLoggedIn) {
  //     // Update login button to show user profile
  //     if (loginNavLink) {
  //       loginNavLink.innerHTML = `<i class="fas fa-user-circle"></i> Profile`
  //       loginNavLink.href = "profile.html"
  //     }
  //   }
  // }

  // Play UI sounds
  function playSound(soundId) {
    const sound = document.getElementById(soundId)
    if (sound) {
      sound.currentTime = 0
      sound.play().catch((err) => console.log("Audio playback error:", err))
    }
  }

  // Show toast notification
  function showToast(message, type = "info") {
    const toast = document.createElement("div")
    toast.className = `toast ${type}`

    let icon = "fa-info-circle"
    if (type === "success") icon = "fa-check-circle"
    if (type === "warning") icon = "fa-exclamation-triangle"
    if (type === "error") icon = "fa-times-circle"

    toast.innerHTML = `<i class="fas ${icon}"></i><span>${message}</span>`
    toastContainer.appendChild(toast)

    setTimeout(() => {
      if (toast.parentNode === toastContainer) {
        toastContainer.removeChild(toast)
      }
    }, 3000)
  }

  // Make these functions globally available
  window.showToast = showToast
  window.playSound = playSound

  // Initialize the app
  init()
})
