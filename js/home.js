document.addEventListener("DOMContentLoaded", () => {
  // Feature cards functionality
  const featureCards = document.querySelectorAll(".feature-card")

  featureCards.forEach((card) => {
    card.addEventListener("click", function () {
      const target = this.getAttribute("data-target")
      if (target) {
        // Navigate to the target page
        window.location.href = `${target}.html`
      }
    })
  })

  // Show welcome toast
  window.showToast("Welcome to TalkEase!", "success")
})
