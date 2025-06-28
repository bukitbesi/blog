// main.js
document.addEventListener("DOMContentLoaded", function () {
  const menuToggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector("nav");

  if (menuToggle && nav) {
    menuToggle.addEventListener("click", () => {
      nav.classList.toggle("open");
    });
  }

  // Lazy load fallback
  document.querySelectorAll("img[loading='lazy']").forEach(img => {
    img.onerror = () => {
      img.src = "/images/fallback.jpg";
    };
  });
});

