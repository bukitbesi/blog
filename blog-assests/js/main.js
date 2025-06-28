document.addEventListener("DOMContentLoaded", function () {
  const menuToggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector("nav");
  if (menuToggle && nav) {
    menuToggle.addEventListener("click", () => {
      nav.classList.toggle("open");
    });
  }

  document.querySelectorAll("img[loading='lazy']").forEach(img => {
    img.onerror = () => {
      img.src = "/blog-assests/images/fallback.jpg";
    };
  });
});
