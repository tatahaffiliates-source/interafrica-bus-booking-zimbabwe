import React, { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import mainBanner from '../public/images/657718617_1574457724687257_8671544356909220408_n.jpg';
import journeyImage from '../public/images/WhatsApp Image 2026-10-16 at 13.42.18.jpeg';
import journeyVideo from '../public/images/AQOfQCyGtr7LzcgJpNAJyNpKu-pwuX5mOg5fbuXJcO6X50x5Xz77uHQse1s-r2mwrrJ2DAYPEatZJMkFmkZ00r2zsXNQQbdT_tekhOD9ma8zfQ.mp4';

const slides = [
  {
    type: 'image',
    src: mainBanner,
    headline: 'Book your next journey',
    subtext: 'Travel across Zimbabwe with InterAfrica.',
  },
  {
    type: 'video',
    src: journeyVideo,
    poster: mainBanner,
    headline: 'Make every journey count',
    subtext: 'Find a trip that fits your plans.',
  },
  {
    type: 'image',
    src: journeyImage,
    headline: 'Explore Zimbabwe at your pace',
    subtext: 'Book your next journey with InterAfrica.',
  },
] as const;

const trackSlides = [
  { slide: slides[2], clone: true, key: 'last-clone' },
  ...slides.map((slide, index) => ({ slide, clone: false, key: `slide-${index}` })),
  { slide: slides[0], clone: true, key: 'first-clone' },
];

export const HeroCarousel: React.FC = () => {
  const [position, setPosition] = useState(1);
  const [transitionEnabled, setTransitionEnabled] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [isTouching, setIsTouching] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
  const videoRef = useRef<HTMLVideoElement>(null);
  const touchStartX = useRef<number | null>(null);
  const videoEndedWhilePaused = useRef(false);
  const activeIndex = (position + slides.length - 1) % slides.length;
  const activeSlide = slides[activeIndex];
  const paused = isHovered || isTouching || reducedMotion;

  useEffect(() => {
    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotionPreference = () => setReducedMotion(motionPreference.matches);
    motionPreference.addEventListener('change', updateMotionPreference);
    return () => motionPreference.removeEventListener('change', updateMotionPreference);
  }, []);

  useEffect(() => {
    if (paused) return;

    const delay = activeSlide.type === 'video' ? 15000 : 5000;
    const timer = window.setTimeout(() => {
      setPosition((current) => (current === 4 ? current : current + 1));
    }, delay);
    return () => window.clearTimeout(timer);
  }, [activeIndex, activeSlide.type, paused]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    let isCurrentSlide = true;

    if (activeSlide.type === 'video') {
      if (video.readyState > 0) video.currentTime = 0;
      video.play().catch(() => {
        if (isCurrentSlide) setPosition((current) => (current === 4 ? current : current + 1));
      });
    } else {
      video.pause();
    }

    return () => {
      isCurrentSlide = false;
      video.pause();
    };
  }, [activeIndex, activeSlide.type]);

  useEffect(() => {
    if (!paused && videoEndedWhilePaused.current) {
      videoEndedWhilePaused.current = false;
      move(1);
    }
  }, [paused]);

  const move = (direction: -1 | 1) => {
    setPosition((current) => {
      if (reducedMotion) {
        const currentIndex = (current + slides.length - 1) % slides.length;
        return ((currentIndex + direction + slides.length) % slides.length) + 1;
      }
      if (direction === 1) return current === 4 ? current : current + 1;
      return current === 0 ? current : current - 1;
    });
  };

  const handleTransitionEnd = () => {
    if (position !== 0 && position !== 4) return;
    setTransitionEnabled(false);
    setPosition(position === 0 ? 3 : 1);
    window.requestAnimationFrame(() => setTransitionEnabled(true));
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      move(-1);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      move(1);
    }
  };

  const handleVideoFailure = () => {
    if (activeSlide.type === 'video') move(1);
  };

  return (
    <section
      aria-label="InterAfrica travel highlights"
      aria-roledescription="carousel"
      className="relative isolate h-[38svh] min-h-[270px] max-h-[360px] overflow-hidden bg-slate-950 text-white md:h-[48vh] md:min-h-[360px] md:max-h-[480px]"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={(event) => {
        setIsTouching(true);
        touchStartX.current = event.touches[0]?.clientX ?? null;
      }}
      onTouchEnd={(event) => {
        setIsTouching(false);
        const startX = touchStartX.current;
        const endX = event.changedTouches[0]?.clientX;
        touchStartX.current = null;
        if (startX === null || endX === undefined) return;
        if (startX - endX > 50) move(1);
        else if (endX - startX > 50) move(-1);
      }}
    >
      <div
        className={`flex h-full w-[500%] ${
          transitionEnabled && !reducedMotion ? 'transition-transform duration-700 ease-in-out' : 'transition-none'
        }`}
        style={{ transform: `translateX(-${position * 20}%)` }}
        onTransitionEnd={handleTransitionEnd}
      >
        {trackSlides.map(({ slide, clone, key }, trackPosition) => {
          const isActive = trackPosition === position;

          return (
            <div
              key={key}
              aria-hidden={!isActive || clone}
              aria-label={clone ? undefined : `Slide ${((trackPosition + slides.length - 1) % slides.length) + 1} of ${slides.length}`}
              aria-roledescription={clone ? undefined : 'slide'}
              className="relative h-full w-1/5 flex-none overflow-hidden"
            >
              {slide.type === 'video' ? (
                <>
                  <img
                    src={slide.poster}
                    alt=""
                    aria-hidden="true"
                    className="absolute inset-0 h-full w-full object-cover"
                    loading="lazy"
                  />
                  {!clone && (
                    <video
                      ref={videoRef}
                      src={slide.src}
                      poster={slide.poster}
                      autoPlay={isActive}
                      muted
                      playsInline
                      preload="metadata"
                      aria-hidden="true"
                      className="absolute inset-0 h-full w-full object-cover"
                      onEnded={() => {
                        if (!isActive) return;
                        if (paused) videoEndedWhilePaused.current = true;
                        else move(1);
                      }}
                      onError={handleVideoFailure}
                    />
                  )}
                </>
              ) : (
                <img
                  src={slide.src}
                  alt=""
                  aria-hidden="true"
                  loading={isActive ? 'eager' : 'lazy'}
                  fetchPriority={isActive ? 'high' : 'auto'}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              )}

              <div className="absolute inset-0 z-10 bg-gradient-to-r from-slate-950/75 via-slate-950/40 to-slate-950/25" />
              <div className="absolute inset-0 z-20 flex items-center justify-center px-6 pb-20 text-center sm:px-12 sm:pb-10">
                <div className={isActive ? 'hero-slide-copy max-w-3xl' : 'max-w-3xl'}>
                  <h1 className="text-2xl font-bold leading-tight tracking-tight drop-shadow sm:text-4xl md:text-5xl">
                    {slide.headline}
                  </h1>
                  <p className="mx-auto mt-3 max-w-xl text-sm text-white/90 drop-shadow sm:mt-4 sm:text-base">
                    {slide.subtext}
                  </p>
                  <button
                    type="button"
                    onClick={() =>
                      document.getElementById('booking-search')?.scrollIntoView({
                        behavior: reducedMotion ? 'auto' : 'smooth',
                        block: 'center',
                      })
                    }
                    className="mt-5 min-h-11 rounded-lg bg-amber-500 px-6 py-2.5 text-sm font-bold text-blue-950 shadow-md transition-colors hover:bg-amber-400 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white sm:mt-6 sm:px-7 sm:text-sm"
                    tabIndex={isActive ? 0 : -1}
                  >
                    Book your seat
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <button
        type="button"
        aria-label="Previous slide"
        onClick={() => move(-1)}
        className="absolute bottom-12 left-4 top-auto z-30 flex h-11 w-11 translate-y-0 items-center justify-center rounded-full border border-white/30 bg-slate-950/40 text-white backdrop-blur-sm transition-colors hover:bg-slate-950/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:top-1/2 sm:bottom-auto sm:-translate-y-1/2 sm:left-6"
      >
        <ChevronLeft className="h-6 w-6" aria-hidden="true" />
      </button>
      <button
        type="button"
        aria-label="Next slide"
        onClick={() => move(1)}
        className="absolute bottom-12 right-4 top-auto z-30 flex h-11 w-11 translate-y-0 items-center justify-center rounded-full border border-white/30 bg-slate-950/40 text-white backdrop-blur-sm transition-colors hover:bg-slate-950/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:top-1/2 sm:bottom-auto sm:-translate-y-1/2 sm:right-6"
      >
        <ChevronRight className="h-6 w-6" aria-hidden="true" />
      </button>

      <div className="absolute inset-x-0 bottom-14 z-30 flex justify-center gap-2">
        {slides.map((slide, index) => (
          <button
            key={slide.headline}
            type="button"
            aria-label={`Go to slide ${index + 1}`}
            aria-current={activeIndex === index ? 'true' : undefined}
            onClick={() => setPosition(index + 1)}
            className={`h-2.5 rounded-full transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
              activeIndex === index ? 'w-8 bg-amber-400' : 'w-2.5 bg-white/70 hover:bg-white'
            }`}
          />
        ))}
      </div>
    </section>
  );
};
