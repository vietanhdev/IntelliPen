// IntelliPen Custom JavaScript
console.log('IntelliPen Documentation Loaded');

// Screenshot Slider
document.addEventListener('DOMContentLoaded', function() {
  const slider = document.querySelector('.screenshot-slider');
  if (!slider) return;

  const track = slider.querySelector('.slider-track');
  const slides = slider.querySelectorAll('.slide');
  const dots = slider.querySelectorAll('.dot');
  const prevBtn = slider.querySelector('.prev');
  const nextBtn = slider.querySelector('.next');
  
  let currentSlide = 0;
  const totalSlides = slides.length;
  let autoplayInterval;

  function goToSlide(index) {
    // Wrap around
    if (index < 0) index = totalSlides - 1;
    if (index >= totalSlides) index = 0;
    
    currentSlide = index;
    
    // Update slides
    slides.forEach((slide, i) => {
      slide.classList.toggle('active', i === currentSlide);
    });
    
    // Update dots
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === currentSlide);
    });
    
    // Reset autoplay
    resetAutoplay();
  }

  function nextSlide() {
    goToSlide(currentSlide + 1);
  }

  function prevSlide() {
    goToSlide(currentSlide - 1);
  }

  function startAutoplay() {
    autoplayInterval = setInterval(nextSlide, 5000);
  }

  function stopAutoplay() {
    clearInterval(autoplayInterval);
  }

  function resetAutoplay() {
    stopAutoplay();
    startAutoplay();
  }

  // Event listeners
  prevBtn.addEventListener('click', prevSlide);
  nextBtn.addEventListener('click', nextSlide);
  
  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      goToSlide(parseInt(dot.dataset.slide));
    });
  });

  // Pause on hover
  slider.addEventListener('mouseenter', stopAutoplay);
  slider.addEventListener('mouseleave', startAutoplay);

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (!slider.matches(':hover')) return;
    if (e.key === 'ArrowLeft') prevSlide();
    if (e.key === 'ArrowRight') nextSlide();
  });

  // Touch/swipe support
  let touchStartX = 0;
  let touchEndX = 0;

  slider.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  });

  slider.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  });

  function handleSwipe() {
    if (touchEndX < touchStartX - 50) nextSlide();
    if (touchEndX > touchStartX + 50) prevSlide();
  }

  // Start autoplay
  startAutoplay();
});
