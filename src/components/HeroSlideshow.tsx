'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getHeroBanners } from '@/services/database';
import { ArrowLeft, ArrowRight } from 'lucide-react';

export interface HeroSlide {
  id: string;
  image: string;
  heading: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  enabled: boolean;
  showTitle?: boolean;
  showSubtitle?: boolean;
  showButton?: boolean;
  mediaType?: string;
  videoUrl?: string;
  posterUrl?: string;
  focalPoint?: string;
  isPrimary?: boolean;
  imageClickRedirect?: boolean;
  videoClickRedirect?: boolean;
  order?: number;
  description?: string;
  showDescription?: boolean;
  desktopFocalPoint?: string;
  mobileFocalPoint?: string;
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

const HeroVideo: React.FC<{
  src: string;
  isActive: boolean;
  poster?: string;
  className?: string;
}> = ({ src, isActive, poster, className = '' }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (isActive) {
      video.currentTime = 0; // reset playback to avoid stuck frames
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Ignore autoplay blocks
        });
      }
    } else {
      video.pause();
    }
  }, [isActive, src]);

  return (
    <video
      ref={videoRef}
      src={src}
      poster={poster}
      muted
      playsInline
      loop
      className={`w-full h-full object-cover animate-[fadeIn_0.5s_ease-out] ${className}`}
    />
  );
};

export const HeroSlideshow: React.FC = () => {
  const router = useRouter();
  const [slides, setSlides] = useState<HeroSlide[]>(DEFAULT_SLIDES);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  
  // Touch coordinates for mobile swipe
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    const loadBanners = async () => {
      try {
        const data = await getHeroBanners();
        if (data && data.length > 0) {
          const mapped = data.map((b: any) => ({
            id: b.id,
            image: b.image_url || b.imageUrl || '/assets/trench_coat.jpg',
            heading: b.heading,
            subtitle: b.subtitle || '',
            ctaText: b.cta_text || b.ctaText || 'Shop Now',
            ctaLink: b.cta_link || b.ctaLink || '/shop',
            enabled: b.enabled ?? true,
            showTitle: b.show_title ?? b.showTitle ?? true,
            showSubtitle: b.show_subtitle ?? b.showSubtitle ?? true,
            showButton: b.show_button ?? b.showButton ?? true,
            mediaType: b.media_type || b.mediaType || 'image',
            videoUrl: b.video_url || b.videoUrl || '',
            posterUrl: b.poster_url || b.posterUrl || '',
            focalPoint: b.focal_point || b.focalPoint || 'center',
            isPrimary: b.is_primary ?? b.isPrimary ?? false,
            imageClickRedirect: b.image_click_redirect ?? b.imageClickRedirect ?? true,
            videoClickRedirect: b.video_click_redirect ?? b.videoClickRedirect ?? false,
            order: b.order ?? 0,
            description: b.description ?? '',
            showDescription: b.show_description ?? b.showDescription ?? true,
            desktopFocalPoint: b.desktop_focal_point ?? b.desktopFocalPoint ?? 'center',
            mobileFocalPoint: b.mobile_focal_point ?? b.mobileFocalPoint ?? 'center',
          }));
          // Sort by enabled, order, and isPrimary
          const activeSlides = mapped
            .filter((s: any) => s.enabled !== false)
            .sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0));
          
          if (activeSlides.length > 0) {
            setSlides(activeSlides);
          }
        }
      } catch (e) {
        // Fallback to DEFAULT_SLIDES
      }
    };
    loadBanners();
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
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Slides images transitions grid stack */}
      {slides.map((slide, index) => {
        const isActive = index === currentIndex;
        const isVideo = slide.mediaType === 'video' || 
                        slide.image.toLowerCase().endsWith('.mp4') || 
                        slide.image.toLowerCase().endsWith('.webm') ||
                        slide.image.toLowerCase().endsWith('.mov') ||
                        slide.image.includes('video');
        const canRedirect = isVideo ? (slide.videoClickRedirect ?? false) : (slide.imageClickRedirect ?? true);
        
        return (
          <div 
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${isActive ? 'opacity-80 z-0' : 'opacity-0 -z-10'} ${canRedirect && isActive ? 'cursor-pointer' : ''}`}
            onClick={canRedirect && isActive ? () => router.push(slide.ctaLink) : undefined}
          >
            {isVideo ? (
              <>
                <style dangerouslySetInnerHTML={{__html: `
                  .hero-media-${slide.id} {
                    object-position: ${slide.mobileFocalPoint || slide.focalPoint || 'center'} !important;
                  }
                  @media (min-width: 768px) {
                    .hero-media-${slide.id} {
                      object-position: ${slide.desktopFocalPoint || slide.focalPoint || 'center'} !important;
                    }
                  }
                `}} />
                <HeroVideo 
                  src={slide.videoUrl || slide.image} 
                  isActive={isActive} 
                  poster={slide.posterUrl} 
                  className={`hero-media-${slide.id}`}
                />
              </>
            ) : (
              <>
                <style dangerouslySetInnerHTML={{__html: `
                  .hero-media-${slide.id} {
                    object-position: ${slide.mobileFocalPoint || slide.focalPoint || 'center'} !important;
                  }
                  @media (min-width: 768px) {
                    .hero-media-${slide.id} {
                      object-position: ${slide.desktopFocalPoint || slide.focalPoint || 'center'} !important;
                    }
                  }
                `}} />
                <img 
                  src={slide.image} 
                  alt={slide.heading}
                  className={`w-full h-full object-cover animate-[fadeIn_0.5s_ease-out] hero-media-${slide.id}`}
                  {...(index === 0 ? { fetchpriority: 'high' } : { loading: 'lazy' })}
                />
              </>
            )}
          </div>
        );
      })}

      {/* Subtle overlay */}
      <div className="absolute inset-0 bg-black/15 z-10" />

      {/* Campaign Copy Content Box */}
      <div className="absolute inset-0 z-20 container-editorial flex flex-col justify-center items-start text-white">
        <div className="max-w-2xl flex flex-col gap-6 animate-[fadeIn_0.8s_ease-out]">
          {(currentSlide.showSubtitle ?? true) && currentSlide.subtitle && (
            <p className="text-[9px] uppercase tracking-[0.4em] text-neutral-300 font-light">
              {currentSlide.subtitle}
            </p>
          )}
          {(currentSlide.showTitle ?? true) && currentSlide.heading && (
            <h1 className="text-5xl md:text-7xl font-light tracking-[0.15em] uppercase leading-tight text-white drop-shadow-sm">
              {currentSlide.heading}
            </h1>
          )}
          {(currentSlide.showDescription ?? true) && currentSlide.description && (
            <p className="text-xs text-neutral-300 font-light max-w-lg mt-1 tracking-wide leading-relaxed">
              {currentSlide.description}
            </p>
          )}
          {(currentSlide.showButton ?? true) && currentSlide.ctaText && (
            <button 
              onClick={() => router.push(currentSlide.ctaLink)}
              className="bg-white text-fg-luxury hover:bg-accent-gold hover:text-bg-luxury transition-all duration-500 text-[10px] uppercase tracking-[0.25em] font-medium py-4 px-12 cursor-pointer border border-white w-fit mt-4"
            >
              {currentSlide.ctaText}
            </button>
          )}
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
