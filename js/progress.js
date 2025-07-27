document.addEventListener("DOMContentLoaded", () => {
  // Progress elements
  const statsCards = document.querySelectorAll(".stats-card")
  const badges = document.querySelectorAll(".badge")
  const leaderboardItems = document.querySelectorAll(".leaderboard-item")

  // Initialize the progress page
  function init() {
    setupEventListeners()
    checkUserLoginStatus()
    loadUserProgress()
  }

  // Set up event listeners
  function setupEventListeners() {
    // Make badge icons interactive
    document.querySelectorAll(".badge-icon:not(.active)").forEach((badge) => {
      badge.addEventListener("click", () => {
        if (window.showToast) {
          window.showToast("Keep learning to unlock this badge!", "warning")
        }
      })
    })

    // Make leaderboard items interactive
    document.querySelectorAll(".leaderboard-item").forEach((item) => {
      item.addEventListener("click", function () {
        const userName = this.querySelector(".user-name").textContent
        const points = this.querySelector(".points").textContent
        if (window.showToast) {
          window.showToast(`${userName} has earned ${points}`, "info")
        }
      })
    })
  }

  // Check if user is logged in
  function checkUserLoginStatus() {
    const isLoggedIn = localStorage.getItem("user")

    if (isLoggedIn) {
      // Update login button to show user profile
      const loginNavLink = document.getElementById("login-nav")
      if (loginNavLink) {
        loginNavLink.innerHTML = `<i class="fas fa-user-circle"></i> Profile`
        loginNavLink.href = "profile.html"
      }
    }
  }

  // Load user progress
  function loadUserProgress() {
    // In a real app, this would load from a database or localStorage
    // For demo purposes, we'll use mock data

    // Check if user is logged in
    const isLoggedIn = localStorage.getItem("user")

    if (isLoggedIn) {
      // Get saved lessons count
      const savedLessons = JSON.parse(localStorage.getItem("savedLessons") || "[]")

      // Update stats
      updateStats({
        chatSessions: 12,
        lessonsCompleted: savedLessons.length || 8,
        learningStreak: 5,
      })
    } else {
      // Show demo data for guest users
      updateStats({
        chatSessions: 12,
        lessonsCompleted: 8,
        learningStreak: 5,
      })
    }
  }

  // Update stats cards
  function updateStats(stats) {
    // Update chat sessions
    const chatSessionsValue = document.querySelector(".stats-card:nth-child(1) .stats-value")
    if (chatSessionsValue) {
      chatSessionsValue.textContent = stats.chatSessions
    }

    // Update lessons completed
    const lessonsCompletedValue = document.querySelector(".stats-card:nth-child(2) .stats-value")
    if (lessonsCompletedValue) {
      lessonsCompletedValue.textContent = stats.lessonsCompleted
    }

    // Update learning streak
    const learningStreakValue = document.querySelector(".stats-card:nth-child(3) .stats-value")
    if (learningStreakValue) {
      learningStreakValue.textContent = `${stats.learningStreak} days`
    }

    // Animate stats cards
    statsCards.forEach((card) => {
      card.classList.add("animate")
      setTimeout(() => {
        card.classList.remove("animate")
      }, 1000)
    })
  }

  // Initialize the progress page
  init()
})
