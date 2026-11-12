"use client";

import { useEffect, useState } from "react";
import { mediaUrl } from "@/lib/admin/media";

export type HeroBannerSlide = {
  title: string;
  description: string;
  button_text: string;
  button_url: string;
  right_image: string; // filename in hero/ folder, or full URL
  background_image: string; // filename in hero/ folder, or full URL
};

type Props = {
  slides: HeroBannerSlide[];
  autoMs?: number;
};

const AUTO_MS = 6000;

export function HeroBanner({ slides, autoMs = AUTO_MS }: Props) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  const count = slides.length;

  // Reset index if slides shrink below active
  useEffect(() => {
    if (active >= count) setActive(0);
  }, [active, count]);

  useEffect(() => {
    if (count <= 1 || paused) return;
    const id = window.setInterval(() => {
      setActive((i) => (i + 1) % count);
    }, autoMs);
    return () => window.clearInterval(id);
  }, [count, paused, autoMs]);

  if (count === 0) return null;

  return (
    <div
      className="hero-banner"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
    >
      <div className="hero-banner__stage">
        <div className="hero-banner__viewport">
          {/* Sliding track: each slide is 100% wide, the track translates
             by -active * 100% to show the active slide. */}
          <div
            className="hero-banner__track"
            style={{ transform: `translateX(-${active * 100}%)` }}
          >
            {slides.map((slide, i) => {
              const bg = slide.background_image
                ? mediaUrl("hero", slide.background_image)
                : "";
              const right = slide.right_image
                ? mediaUrl("hero", slide.right_image)
                : "";
              return (
                <div
                  key={i}
                  className="hero-banner__slide"
                >
                  <div
                    className="hero-banner__bg"
                    style={
                      bg
                        ? { backgroundImage: `url("${bg}")` }
                        : { background: "#1A124E" }
                    }
                  />
                  <div className="hero-banner__overlay" />

                  <div className="hero-banner__content">
                    <div className="hero-banner__text">
                      <h2 className="hero-banner__title">{slide.title}</h2>
                      {slide.description ? (
                        <p className="hero-banner__desc">{slide.description}</p>
                      ) : null}
                      {slide.button_text && slide.button_url ? (
                        <a
                          href={slide.button_url}
                          className="hero-banner__cta"
                        >
                          {slide.button_text}
                        </a>
                      ) : null}
                    </div>

                    {right ? (
                      <div className="hero-banner__image">
                        <img
                          src={right}
                          alt={slide.title}
                          width={520}
                          height={520}
                        />
                      </div>
                    ) : null}
                  </div>

                  {count > 1 && (
                    <div
                      className="hero-banner__dots"
                      role="tablist"
                      aria-label="Hero slides"
                    >
                      {slides.map((_, j) => (
                        <button
                          key={j}
                          type="button"
                          role="tab"
                          aria-selected={j === active}
                          className={`hero-banner__dot${j === active ? " is-active" : ""}`}
                          onClick={() => setActive(j)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}