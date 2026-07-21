'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight } from 'lucide-react';

export interface HeroSlide {
  id: string;
  image: string;
  heading: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  enabled: boolean;
}

const DEFAULT_SLIDES: HeroSlide[] = [
  { id: 'hs-1', image: '/assets/trench_coat.jpg', heading: 'BE YOU.', subtitle: 'BE BOLD. BE FREERT.', ctaText: 'Shop Now', ctaLink: '/shop', enabled: true },
  { id: 'hs-2', image: '/assets/slip_dress.jpg', heading: 'New Season Collection', subtitle: 'Autumn / Winter Edit 2026', ctaText: 'Explore Collection', ctaLink: '/shop/new-arrivals', enabled: true },
  { id: 'hs-3', image: '/assets/kimono_shirt.jpg', heading: 'Luxury Everyday Wear', subtitle: 'Comfort Tailored in Small Batches', ctaText: 'Discover More', ctaLink: '/shop', enabled: true },
  { id: 'hs-4', image: '/assets/silk_trouser.jpg', heading: 'Timeless Streetwear', subtitle: 'Structure for Identity and Expression', ctaText: 'Shop Bottoms', ctaLink: '/shop/men/cargo-pants', enabled: true },
  { id: 'hs-5', image: '/assets/knit_hoodie.jpg', heading: 'Minimal Luxury', subtitle: 'Organic Weaves and Soft Textures', ctaText: 'Shop Knitwear', ctaLink: '/shop/men/hoodies', enabled: true },
  { id: 'hs-6', image: '/assets/cap_1784646670746.png', heading: 'Modern Identity', subtitle: 'Finishing Details for the Modern Wardrobe', ctaText: 'Shop Accessories', ctaLink: '/shop/accessories', enabled: true },
  { id: 'hs-7', image: '/assets/sneakers_1784646656235.png', heading: 'Premium Essentials', subtitle: 'Sandalwood Santal & Intense Scents', ctaText: 'Shop Perfumes', ctaLink: '/shop/perfumes', enabled: true }
];

export const HeroSlideshow: React.FC = () => {
  const router = useRouter();
  const [slides, setSlides] = useState<HeroSlide[]>(DEFAULT_SLIDES);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  
  // Touch coordinates for mobile swipe
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    // Load custom slides from localStorage if edited via Admin CMS
    const saved = localStorage.getItem('freert_hero_slides');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const enabledOnly = parsed.filter((s: HeroSlide) => s.enabled);
        if (enabledOnly.length > 0) {
          setSlides(enabledOnly);
        }
      } catch (e) {
        setSlides(DEFAULT_SLIDES);
      }
    }
  }, []);

  // Autoplay intervals setup
  useEffect(() => {
    if (isPaused || slides.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 6000);

    return () => clearInterval(timer);
  }, [isPaused, slides]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  // Mobile Touch Gestures Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    
    const diffX = touchStartX.current - e.changedTouches[0].clientX;
    const threshold = 50; // swipe detection limit

    if (diffX > threshold) {
      handleNext(); // swipe left
    } else if (diffX < -threshold) {
      handlePrev(); // swipe right
    }

    touchStartX.current = null;
  };

  if (slides.length === 0) return null;

  const currentSlide = slides[currentIndex];

  return (
    <section 
      className="relative w-full h-[90vh] overflow-hidden bg-neutral-900 text-left select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Slides images transitions grid stack */}
      {slides.map((slide, index) => {
        const isActive = index === currentIndex;
        return (
          <div 
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${isActive ? 'opacity-80 z-0' : 'opacity-0 -z-10'}`}
          >
            <img 
              src={slide.image} 
              alt={slide.heading}
              className="w-full h-full object-cover object-[center_15%]"
              // Preload the first campaign image for Core Web Vitals
              {...(index === 0 ? { fetchpriority: 'high' } : { loading: 'lazy' })}
            />
          </div>
        );
      })}

      {/* Subtle overlay */}
      <div className="absolute inset-0 bg-black/15 z-10" />

      {/* Campaign Copy Content Box */}
      <div className="absolute inset-0 z-20 container-editorial flex flex-col justify-center items-start text-white">
        <div className="max-w-2xl flex flex-col gap-6 animate-[fadeIn_0.8s_ease-out]">
          <p className="text-[9px] uppercase tracking-[0.4em] text-neutral-300 font-light">
            {currentSlide.subtitle}
          </p>
          <h1 className="text-5xl md:text-7xl font-light tracking-[0.15em] uppercase leading-tight text-white drop-shadow-sm">
            {currentSlide.heading}
          </h1>
          <button 
            onClick={() => router.push(currentSlide.ctaLink)}
            className="bg-white text-fg-luxury hover:bg-accent-gold hover:text-bg-luxury transition-all duration-500 text-[10px] uppercase tracking-[0.25em] font-medium py-4 px-12 cursor-pointer border border-white w-fit mt-4"
          >
            {currentSlide.ctaText}
          </button>
        </div>
      </div>

      {/* Manual slide indicators controls (Desktop) */}
      {slides.length > 1 && (
        <>
          {/* Arrow Left */}
          <button 
            onClick={handlePrev}
            className="absolute left-6 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full border border-white/20 hover:border-white text-white transition-all cursor-pointer hidden md:flex"
            aria-label="Previous slide"
          >
            <ArrowLeft size={16} />
          </button>

          {/* Arrow Right */}
          <button 
            onClick={handleNext}
            className="absolute right-6 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full border border-white/20 hover:border-white text-white transition-all cursor-pointer hidden md:flex"
            aria-label="Next slide"
          >
            <ArrowRight size={16} />
          </button>

          {/* Bottom Dot indicators */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 flex gap-3.5">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${idx === currentIndex ? 'bg-white scale-110' : 'bg-white/30 hover:bg-white/60'}`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
};
