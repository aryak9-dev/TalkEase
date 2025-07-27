document.addEventListener("DOMContentLoaded", () => {
  // Chat elements
  const typingIndicator = document.getElementById("typing-indicator")
  const voiceInputBtn = document.getElementById("voice-input-btn")
  const textToSpeechBtn = document.getElementById("text-to-speech-btn")
  const chatInput = document.getElementById("chat-input")
  const sendBtn = document.getElementById("send-btn")
  const chatBox = document.getElementById("chat-box")

  // API URL
  const API_BASE_URL = "http://127.0.0.1:8000"

  // Mock data for chat responses
  // const mockBotResponses = {
  //   hello: "Hello! How can I help you with your language learning today?",
  //   hi: "Hi there! Ready to practice some language skills?",
  //   "how are you": "I'm doing great! More importantly, how is your language learning going?",
  //   help: "I can help you practice conversations, answer language questions, or suggest learning resources. What would you like to do?",
  //   goodbye: "Goodbye! Don't forget to practice a little each day. See you next time!",
  //   "thank you": "You're welcome! Is there anything else you'd like to practice?",
  //   default: "That's interesting! Would you like to know how to say that in another language?",
  // }

  async function sendMessage() {
    const message = chatInput.value.trim();
    if (message === "") return;

    addMessageToChat("user", message);
    chatInput.value = "";

    try {
        const response = await fetch(`${API_BASE_URL}/chat/?prompt=${encodeURIComponent(message)}`);
        const data = await response.json();
        addMessageToChat("bot", data.response);
    } catch (error) {
        addMessageToChat("bot", "Error: Unable to reach the chatbot.");
    }
}

  // Initialize the chat page
  function init() {
    setupEventListeners()
    checkUserLoginStatus()
    showWelcomeMessage()
  }

  // Set up event listeners
  function setupEventListeners() {
    // Chat functionality
    if (sendBtn) {
      sendBtn.addEventListener("click", sendMessage)
    }

    if (chatInput) {
      chatInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          sendMessage()
        }
      })
    }

    // Voice input
    if (voiceInputBtn) {
      setupSpeechRecognition()
    }

    // Text to speech
    if (textToSpeechBtn) {
      setupTextToSpeech()
    }
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

      // Get user data
      const userData = JSON.parse(isLoggedIn)

      // Personalize welcome message
      showWelcomeMessage(userData.name)
    } else {
      showWelcomeMessage()
    }
  }

  // Show welcome message
  function showWelcomeMessage(username = null) {
    let welcomeMessage = "Hello! I'm your language tutor. How can I help you today?"

    // if (username) {
    //   welcomeMessage = `Hello ${username}! I'm your language tutor. How can I help you today?`
    // }

    // Add bot welcome message
    const messageElement = document.createElement("div")
    messageElement.className = "message bot-message"

    const timestamp = getCurrentTimestamp()

    messageElement.innerHTML = `
      <div class="avatar">
        <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/bot-avatar.jpg-ZJd6kTjzi2T9wNduoG1Mc6Gl6ykmhU.jpeg" alt="Bot Avatar">
      </div>
      <div class="message-content">
        <p>${welcomeMessage}</p>
        <span class="timestamp">${timestamp}</span>
      </div>
    `

    chatBox.appendChild(messageElement)
  }


      // Send Message to Chatbot API
      async function sendMessage() {
        const message = chatInput.value.trim();
        if (message === "") return;

        addMessageToChat("user", message);
        chatInput.value = "";

        try {
            const response = await fetch(`${API_BASE_URL}/chat/?prompt=${encodeURIComponent(message)}`);
            const data = await response.json();
            addMessageToChat("bot", data.response);
        } catch (error) {
            addMessageToChat("bot", "Error: Unable to reach the chatbot.");
        }
    }
    

  // Add message to chat
  function addMessageToChat(sender, message) {
    const messageElement = document.createElement("div")
    messageElement.className = `message ${sender}-message`

    const timestamp = getCurrentTimestamp()

    // Create a new paragraph element (Prevents formatting issues)
    const messageText = document.createElement("p")
    messageText.textContent = sanitizeText(message) // Force plain text

    if (sender === "bot") {
      messageElement.innerHTML = `
        <div class="avatar">
          <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/bot-avatar.jpg-ZJd6kTjzi2T9wNduoG1Mc6Gl6ykmhU.jpeg" alt="Bot Avatar">
        </div>
        <div class="message-content">
          <span class="timestamp">${timestamp}</span>
        </div>
      `
      messageElement.querySelector(".message-content").prepend(messageText)
    } else {
      messageElement.innerHTML = `
        <div class="message-content">
          <span class="timestamp">${timestamp}</span>
        </div>
        <div class="avatar">
          <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/user-avatar.jpg-ZLgxbA78cQsPQYH1AACzexODM64bHY.jpeg" alt="User Avatar">
        </div>
      `
      messageElement.querySelector(".message-content").prepend(messageText)
    }

    chatBox.appendChild(messageElement)

    // Add ripple effect to new message
    messageElement.classList.add("new-message")
    setTimeout(() => {
      messageElement.classList.remove("new-message")
    }, 500)

    // Scroll to bottom of chat
    chatBox.scrollTop = chatBox.scrollHeight

    // Play sound
    if (sender === "bot") {
      playSound("notification-sound")
    } else {
      playSound("message-sound")
    }
  }

  // Show typing indicator
  function showTypingIndicator() {
    typingIndicator.classList.remove("hidden")
    chatBox.scrollTop = chatBox.scrollHeight
  }

  // Hide typing indicator
  function hideTypingIndicator() {
    typingIndicator.classList.add("hidden")
  }

  // Get bot response (mock)
  function getBotResponse(message) {
    message = message.toLowerCase()

    // Check for exact matches
    for (const key in mockBotResponses) {
      if (message.includes(key)) {
        return mockBotResponses[key]
      }
    }

    // Default response
    return mockBotResponses.default
  }

  // Sanitize text
  function sanitizeText(text) {
    if (!text) return ""

    // Remove Markdown-style strikethrough (~~text~~)
    text = text.replace(/~~(.*?)~~/g, "$1")

    // Remove bold (**bold**) and italics (*italic*)
    text = text.replace(/\*\*(.*?)\*\*/g, "$1")
    text = text.replace(/\*(.*?)\*/g, "$1")
    text = text.replace(/__(.*?)__/g, "$1")
    text = text.replace(/_(.*?)_/g, "$1")

    // Remove HTML tags (if chatbot sends HTML-formatted text)
    text = text.replace(/<\/?[^>]+(>|$)/g, "")

    // Remove unwanted special characters
    text = text.replace(/[<>]/g, "")

    return text.trim()
  }

  // Get current timestamp
  function getCurrentTimestamp() {
    const now = new Date()
    let hours = now.getHours()
    const minutes = now.getMinutes().toString().padStart(2, "0")
    const ampm = hours >= 12 ? "PM" : "AM"
    hours = hours % 12
    hours = hours ? hours : 12 // Convert 0 to 12
    return `Today, ${hours}:${minutes} ${ampm}`
  }

  // Speech recognition for voice input
  function setupSpeechRecognition() {
    if ("SpeechRecognition" in window || "webkitSpeechRecognition" in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      const recognition = new SpeechRecognition()

      recognition.lang = "en-US"
      recognition.continuous = false
      recognition.interimResults = false

      recognition.onstart = () => {
        voiceInputBtn.classList.add("active")
        if (window.showToast) {
          window.showToast("Listening...", "info")
        }
      }

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript
        chatInput.value = transcript
        if (window.showToast) {
          window.showToast("Voice captured!", "success")
        }
      }

      recognition.onend = () => {
        voiceInputBtn.classList.remove("active")
      }

      recognition.onerror = (event) => {
        if (window.showToast) {
          window.showToast("Voice recognition error: " + event.error, "error")
        }
        voiceInputBtn.classList.remove("active")
      }

      voiceInputBtn.addEventListener("click", () => {
        recognition.start()
        playSound("message-sound")
      })
    } else {
      voiceInputBtn.style.display = "none"
      if (window.showToast) {
        window.showToast("Voice recognition not supported in this browser", "warning")
      }
    }
  }

  // Text to speech functionality
  function setupTextToSpeech() {
    if ("speechSynthesis" in window) {
      textToSpeechBtn.addEventListener("click", () => {
        // Get the last bot message
        const botMessages = document.querySelectorAll(".bot-message .message-content p")
        if (botMessages.length > 0) {
          const lastMessage = botMessages[botMessages.length - 1].textContent
          speakText(lastMessage)
          playSound("message-sound")
          if (window.showToast) {
            window.showToast("Speaking text...", "info")
          }
        } else {
          if (window.showToast) {
            window.showToast("No message to speak", "warning")
          }
        }
      })
    } else {
      textToSpeechBtn.style.display = "none"
      if (window.showToast) {
        window.showToast("Text-to-speech not supported in this browser", "warning")
      }
    }
  }

  // Speak text function
  function speakText(text) {
    if ("speechSynthesis" in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel()

      const utterance = new SpeechSynthesisUtterance(text)

      // Get available voices
      const voices = window.speechSynthesis.getVoices()

      // Try to find a female English voice
      const englishVoice =
        voices.find((voice) => voice.lang.includes("en") && voice.name.includes("Female")) ||
        voices.find((voice) => voice.lang.includes("en")) ||
        voices[0]

      if (englishVoice) {
        utterance.voice = englishVoice
      }

      utterance.rate = 1.0
      utterance.pitch = 1.0

      window.speechSynthesis.speak(utterance)
    }
  }

  // Play UI sounds
  function playSound(soundId) {
    const sound = document.getElementById(soundId)
    if (sound) {
      sound.currentTime = 0
      sound.play().catch((err) => console.log("Audio playback error:", err))
    }
  }

  // Initialize the chat page
  init()
})
