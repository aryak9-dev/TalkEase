document.addEventListener("DOMContentLoaded", () => {
  // Lesson elements
  const lessonLanguage = document.getElementById("lesson-language")
  const lessonTopic = document.getElementById("lesson-topic")
  const generateLessonBtn = document.getElementById("generate-lesson-btn")
  const lessonResult = document.getElementById("lesson-result")
  const lessonTitle = document.getElementById("lesson-title")
  const lessonContent = document.getElementById("lesson-content")
  const saveLessonBtn = document.getElementById("save-lesson-btn")
  const shareLessonBtn = document.getElementById("share-lesson-btn")
  const speakLessonBtn = document.getElementById("speak-lesson-btn")

  // API URL
  const API_BASE_URL = "http://127.0.0.1:8000"

  // Initialize the lesson page
  function init() {
    setupEventListeners()
    checkUserLoginStatus()
  }

  // Set up event listeners
  function setupEventListeners() {
    // Lesson generator
    if (generateLessonBtn) {
      generateLessonBtn.addEventListener("click", generateLesson)
    }

    // Lesson actions
    if (saveLessonBtn) {
      saveLessonBtn.addEventListener("click", saveLesson)
    }

    if (shareLessonBtn) {
      shareLessonBtn.addEventListener("click", shareLesson)
    }

    if (speakLessonBtn) {
      speakLessonBtn.addEventListener("click", speakLesson)
    }
  }

  // Check if user is logged in
  function checkUserLoginStatus() {
    const isLoggedIn = sessionStorageStorage.getItem("user")

    if (isLoggedIn) {
      // Update login button to show user profile
      const loginNavLink = document.getElementById("login-nav")
      if (loginNavLink) {
        loginNavLink.innerHTML = `<i class="fas fa-user-circle"></i> Profile`
        loginNavLink.href = "profile.html"
      }
    }
  }

  async function generateLesson() {
    const language = lessonLanguage.value;
    const topic = lessonTopic.value;

    if (!language || !topic) {
        showToast("Please select a language and a topic!", "warning");
        return;
    }

    // Show loading animation
    const spinner = document.querySelector(".spinner");
    const btnText = document.querySelector(".btn-text");

    spinner.classList.remove("hidden");
    btnText.textContent = "Generating...";

    playSound("message-sound");

    try {
        const response = await fetch(`${API_BASE_URL}/generate_lesson/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ language, topic }),
        });

        const data = await response.json();

        if (response.ok) {
            // Hide loading animation
            spinner.classList.add("hidden");
            btnText.textContent = "Generate Lesson";
            
            // Update lesson title and content
            document.getElementById("lesson-title").textContent = `Lesson: ${topic} in ${language}`;
            
            // Parse lesson content with marked.js to convert markdown to HTML
            document.getElementById("lesson-content").innerHTML = marked.parse(data.lesson);

            // Display the lesson result
            document.getElementById("lesson-result").classList.remove("hidden");

            // Scroll to the lesson result smoothly
            const lessonResult = document.getElementById("lesson-result");
            if (lessonResult) {
                lessonResult.scrollIntoView({ behavior: "smooth" });
            }

            playSound("notification-sound");
            showToast("Lesson generated successfully!", "success");
        } else {
            // Handle error case if the response is not OK
            throw new Error("Failed to generate lesson.");
        }
    } catch (error) {
        // Handle any errors that occur during the fetch
        document.getElementById("lesson-title").textContent = "Error";
        document.getElementById("lesson-content").textContent = "Could not generate lesson. Try again later.";
        document.getElementById("lesson-result").classList.remove("hidden");

        playSound("notification-sound");
        showToast("Error fetching lesson!", "error");

        // Log the error for debugging
        console.error("Error fetching lesson:", error);
    }
}

  // Speak Lesson Function
  function speakLesson() {
    const lessonContentText = lessonContent.textContent
    if (!lessonContentText) {
      if (window.showToast) {
        window.showToast("No lesson content to speak!", "warning")
      }
      return
    }

    speakText(lessonContentText)
    playSound("message-sound")
    if (window.showToast) {
      window.showToast("Speaking lesson content...", "info")
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

  // Save Lesson Function (Mock)
  function saveLesson() {
    if (window.showToast) {
      window.showToast("Lesson saved to your account!", "success")
    }
    playSound("notification-sound")
    localStorage.setItem("savedLessons", JSON.stringify(savedLessons))
  }

  // Share Lesson Function
  function shareLesson() {
    const shareOptions = document.createElement("div")
    shareOptions.className = "share-options"
    shareOptions.innerHTML = `
      <div class="share-overlay">
        <div class="share-modal">
          <h4>Share Lesson</h4>
          <div class="share-buttons">
            <button class="share-btn facebook"><i class="fab fa-facebook-f"></i> Facebook</button>
            <button class="share-btn twitter"><i class="fab fa-twitter"></i> Twitter</button>
            <button class="share-btn whatsapp"><i class="fab fa-whatsapp"></i> WhatsApp</button>
            <button class="share-btn email"><i class="fas fa-envelope"></i> Email</button>
          </div>
          <button class="close-share">Close</button>
        </div>
      </div>
    `

    document.body.appendChild(shareOptions)

    // Add event listeners to share buttons
    shareOptions.querySelectorAll(".share-btn").forEach((btn) => {
      btn.addEventListener("click", function () {
        const platform = this.classList[1]
        if (window.showToast) {
          window.showToast(`Sharing to ${platform}...`, "success")
        }
        setTimeout(() => {
          document.body.removeChild(shareOptions)
        }, 1000)
      })
    })

    // Close share modal
    shareOptions.querySelector(".close-share").addEventListener("click", () => {
      document.body.removeChild(shareOptions)
    })

    playSound("notification-sound")
  }

  // Helper: Capitalize first letter
  function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1)
  }

  // Play UI sounds
  function playSound(soundId) {
    const sound = document.getElementById(soundId)
    if (sound) {
      sound.currentTime = 0
      sound.play().catch((err) => console.log("Audio playback error:", err))
    }
  }

  // Initialize the lesson page
  init()
})
