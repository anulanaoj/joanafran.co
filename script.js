document.addEventListener('DOMContentLoaded', function() {
  const video = document.querySelector('.video-fullwidth');
  const firstPage = document.querySelector('.page');
  if (video && firstPage) {
    function updateVideoSticky() {
      const rect = firstPage.getBoundingClientRect();
      // Only show video if the first page is still visible in the viewport
      if (rect.bottom > 0 && rect.top < window.innerHeight) {
        video.classList.add('sticky');
      } else {
        video.classList.remove('sticky');
      }
    }
    updateVideoSticky();
    window.addEventListener('scroll', updateVideoSticky);
    window.addEventListener('resize', updateVideoSticky);
  }

  // Helper function for initializing a carousel
  function initCarousel(carouselSelector, trackSelector, slideSelector, prevBtnSelector, nextBtnSelector) {
    document.querySelectorAll(carouselSelector).forEach(function(carousel) {
      const track = carousel.querySelector(trackSelector);
      const slides = Array.from(carousel.querySelectorAll(slideSelector));
      const prevNumButton = carousel.querySelector(prevBtnSelector);
      const nextNumButton = carousel.querySelector(nextBtnSelector);
      let currentIndex = 0;

      function updateSlide(position) {
        if (carousel.classList.contains('vertical')) {
          track.style.transform = `translateY(-${position * 100}%)`;
        } else {
          track.style.transform = `translateX(-${position * 100}%)`;
        }
        if (prevNumButton && nextNumButton) {
          const leftIndex = (currentIndex - 1 + slides.length) % slides.length;
          const rightIndex = (currentIndex + 1) % slides.length;
          prevNumButton.textContent = (leftIndex + 1).toString();
          nextNumButton.textContent = (rightIndex + 1).toString();
        }
      }

      if (nextNumButton) {
        nextNumButton.addEventListener('click', () => {
          currentIndex = (currentIndex + 1) % slides.length;
          updateSlide(currentIndex);
        });
      }

      if (prevNumButton) {
        prevNumButton.addEventListener('click', () => {
          currentIndex = (currentIndex - 1 + slides.length) % slides.length;
          updateSlide(currentIndex);
        });
      }

      updateSlide(currentIndex);
    });
  }
  
  // Initialize all carousels (except video)
  initCarousel('.carousel:not(.carousel-video)', '.carousel-track', '.carousel-slide', '.carousel-controls .prev-num', '.carousel-controls .next-num');
  
  // Initialize video carousel
  initCarousel('.carousel-video', '.carousel-track-video', '.carousel-slide-video', '.carousel-controls-video .prev-num', '.carousel-controls-video .next-num');

  // --- Move this code out of a nested DOMContentLoaded ---
  // Add video controls to all .tile-video containers, below the video
  document.querySelectorAll('.tile-video').forEach(container => {
    const video = container.querySelector('video');
    if (!video) return;
    // Prevent duplicate controls
    if (container.querySelector('.custom-video-controls')) return;
    
    // Remove old controls attribute
    video.removeAttribute('controls');
    
    // Create custom controls
    const controls = document.createElement('div');
    controls.className = 'custom-video-controls';
    controls.innerHTML = `
      <button class="play-pause-btn">▶</button>
      <div class="video-timeline">
        <div class="video-progress"></div>
      </div>
    `;
    
    // Insert controls after the video element
    video.insertAdjacentElement('afterend', controls);
    
    const playBtn = controls.querySelector('.play-pause-btn');
    const timeline = controls.querySelector('.video-timeline');
    const progress = controls.querySelector('.video-progress');
    
    // Play/Pause toggle
    playBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (video.paused) {
        video.play();
        playBtn.textContent = '❚❚';
      } else {
        video.pause();
        playBtn.textContent = '▶';
      }
    });
    
    // Update progress bar
    video.addEventListener('timeupdate', () => {
      const percent = (video.currentTime / video.duration) * 100;
      progress.style.width = percent + '%';
    });
    
    // Click timeline to seek
    timeline.addEventListener('click', (e) => {
      const rect = timeline.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      video.currentTime = pos * video.duration;
    });
    
    // Reset play button when video ends
    video.addEventListener('ended', () => {
      playBtn.textContent = '▶';
    });
  });

});