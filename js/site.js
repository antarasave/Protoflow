document.getElementById("y").textContent = new Date().getFullYear();
(function () {
  var header = document.querySelector("header.site");
  if (header) {
    function onScroll() {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }
})();
