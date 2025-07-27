document.addEventListener("DOMContentLoaded", () => {
  // Auth elements
  const authTabs = document.querySelectorAll(".auth-tab")
  const authForms = document.querySelectorAll(".auth-form")
  const loginForm = document.getElementById("login-form")
  const signupForm = document.getElementById("signup-form")
  const passwordInputs = document.querySelectorAll(".password-input input")
  const togglePasswordBtns = document.querySelectorAll(".toggle-password")
  const signupPassword = document.getElementById("signup-password")
  const strengthProgress = document.querySelector(".strength-progress")
  const strengthText = document.querySelector(".strength-text")
  const socialBtns = document.querySelectorAll(".social-btn")
  const guestBtn = document.querySelector(".guest-btn")

  // Firebase configuration
  const firebaseConfig = {
    apiKey: "",
    authDomain: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: "",
    measurementId: ""
  }
  // const API_BASE_URL = "http://127.0.0.1:8000

  // Initialize Firebase (commented out until you add your config)
  // firebase.initializeApp(firebaseConfig);
  // const auth = firebase.auth();

  // Initialize the auth page
  function init() {
    setupEventListeners()
  }

  // Set up event listeners
  function setupEventListeners() {
    // Auth tabs
    authTabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        const tabTarget = tab.getAttribute("data-tab")

        // Update active tab
        authTabs.forEach((t) => t.classList.remove("active"))
        tab.classList.add("active")

        // Show corresponding form
        authForms.forEach((form) => {
          form.classList.remove("active")
          if (form.id === `${tabTarget}-form`) {
            form.classList.add("active")
          }
        })

        playSound("message-sound")
      })
    })

    // Toggle password visibility
    togglePasswordBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const input = btn.previousElementSibling
        const icon = btn.querySelector("i")

        if (input.type === "password") {
          input.type = "text"
          icon.className = "fas fa-eye-slash"
        } else {
          input.type = "password"
          icon.className = "fas fa-eye"
        }
      })
    })

    // Password strength meter
    if (signupPassword) {
      signupPassword.addEventListener("input", checkPasswordStrength)
    }

    // Login form submission
    if (loginForm) {
      loginForm.addEventListener("submit", handleLogin)
    }

    // Signup form submission
    if (signupForm) {
      signupForm.addEventListener("submit", handleSignup)
    }

    // Social login buttons
    socialBtns.forEach((btn) => {
      btn.addEventListener("click", handleSocialLogin)
    })

    // Guest access
    if (guestBtn) {
      guestBtn.addEventListener("click", () => {
        showToast("Continuing as guest", "info")
        // Redirect to home page after a short delay
        setTimeout(() => {
          window.location.href = "index.html"
        }, 1000)
      })
    }
  }

  // Check password strength
  function checkPasswordStrength() {
    const password = signupPassword.value
    let strength = 0

    // Length check
    if (password.length >= 8) strength += 25

    // Uppercase check
    if (/[A-Z]/.test(password)) strength += 25

    // Lowercase check
    if (/[a-z]/.test(password)) strength += 25

    // Number/special char check
    if (/[0-9!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 25

    // Update UI
    strengthProgress.style.width = `${strength}%`

    if (strength <= 25) {
      strengthProgress.style.background = "#ef476f" // Weak
      strengthText.textContent = "Weak password"
    } else if (strength <= 50) {
      strengthProgress.style.background = "#ffd166" // Medium
      strengthText.textContent = "Medium password"
    } else if (strength <= 75) {
      strengthProgress.style.background = "#06d6a0" // Strong
      strengthText.textContent = "Strong password"
    } else {
      strengthProgress.style.background = "#118ab2" // Very strong
      strengthText.textContent = "Very strong password"
    }
  }

  async function handleLogin(e) {
    e.preventDefault()
  
    const email = document.getElementById("login-email").value
    const password = document.getElementById("login-password").value
    const rememberMe = document.getElementById("remember-me").checked
  
    const submitBtn = loginForm.querySelector(".auth-btn")
    const btnText = submitBtn.querySelector(".btn-text")
    const spinner = submitBtn.querySelector(".spinner")
  
    btnText.textContent = "Logging in..."
    spinner.classList.remove("hidden")
  
    try {
      const res = await fetch("http://localhost:8000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      })
  
      const data = await res.json()
      
  
      if (!res.ok) throw new Error(data.detail || "Login failed")
  
      // Save token & user
      sessionStorage.setItem("token", data.token)
      sessionStorage.setItem("user", JSON.stringify({ email }))


      // This check is for protected pages only, not the auth page
const token = localStorage.getItem("token")

if (token) {
  // Optionally verify the token with your backend before trusting it
  fetch("http://localhost:8000/verify-token", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  })
    .then(res => {
      if (res.status === 200) {
        window.location.href = "index.html" // already logged in
      }
    })
    .catch(() => {
      // Token invalid, remove it
      localStorage.removeItem("token")
    })
}

  
      showToast("Login successful!", "success")
      playSound("notification-sound")
  
      setTimeout(() => {
        window.location.href = "index.html"
      }, 1000)
    } catch (err) {
      showToast(err.message, "error")
    } finally {
      btnText.textContent = "Login"
      spinner.classList.add("hidden")
    }
  }
  
  async function handleSignup(e) {
    e.preventDefault()
  
    const name = document.getElementById("signup-name").value
    const email = document.getElementById("signup-email").value
    const password = document.getElementById("signup-password").value
    const confirmPassword = document.getElementById("signup-confirm").value
    const termsAccepted = document.getElementById("terms").checked
  
    if (password !== confirmPassword) {
      showToast("Passwords do not match", "error")
      return
    }
  
    if (!termsAccepted) {
      showToast("Please accept the terms and conditions", "warning")
      return
    }
  
    const submitBtn = signupForm.querySelector(".auth-btn")
    const btnText = submitBtn.querySelector(".btn-text")
    const spinner = submitBtn.querySelector(".spinner")
  
    btnText.textContent = "Creating account..."
    spinner.classList.remove("hidden")
  
    try {
      const res = await fetch("http://localhost:8000/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      })
  
      const data = await res.json()
  
      if (!res.ok) throw new Error(data.detail || "Signup failed")
  
      showToast("Account created!", "success")
      playSound("notification-sound")
  
      // ✅ Save token or dummy token
      sessionStorage.setItem("token", data.token)
      sessionStorage.setItem("user", JSON.stringify({ email }))

  
      // ✅ Redirect to home
      setTimeout(() => {
        window.location.href = "index.html"
      }, 1000)
  
    } catch (err) {
      showToast(err.message, "error")
    } finally {
      btnText.textContent = "Create Account"
      spinner.classList.add("hidden")
    }
  }
 
  // Handle social login
  function handleSocialLogin(e) {
    const provider = e.currentTarget.classList.contains("google") ? "Google" : "Facebook"

    showToast(`${provider} login is not implemented in this demo`, "info")

    // In a real app, you would use Firebase authentication here
    // For Google:
    // const provider = new firebase.auth.GoogleAuthProvider();
    // auth.signInWithPopup(provider)
    //   .then((result) => {
    //     // User signed in
    //   }).catch((error) => {
    //     // Handle errors
    //   });

    // For Facebook:
    // const provider = new firebase.auth.FacebookAuthProvider();
    // auth.signInWithPopup(provider)
    //   .then((result) => {
    //     // User signed in
    //   }).catch((error) => {
    //     // Handle errors
    //   });
  }

  // Helper function to play sounds
  function playSound(soundId) {
    const sound = document.getElementById(soundId)
    if (sound) {
      sound.currentTime = 0
      sound.play().catch((err) => console.log("Audio playback error:", err))
    }
  }

  // Helper function to show toast notifications
  function showToast(message, type = "info") {
    if (window.showToast) {
      window.showToast(message, type)
    } else {
      const toastContainer = document.getElementById("toast-container")
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
  }

  // Initialize the auth page
  init()
})
