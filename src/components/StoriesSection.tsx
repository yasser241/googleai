/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { X, ChevronRight, ChevronLeft, ExternalLink } from "lucide-react";
import { Story } from "../types";

interface StoriesSectionProps {
  stories: Story[];
  onNavigate: (view: string, params?: any) => void;
}

export default function StoriesSection({ stories, onNavigate }: StoriesSectionProps) {
  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);

  // Auto increment progress bar when story is active
  useEffect(() => {
    if (activeStoryIndex === null) {
      setProgress(0);
      return;
    }

    const duration = 5000; // 5 seconds per story
    const intervalTime = 50;
    const increment = (intervalTime / duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          // Go to next story
          handleNextStory();
          return 0;
        }
        return prev + increment;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [activeStoryIndex]);

  const handleNextStory = () => {
    if (activeStoryIndex === null) return;
    if (activeStoryIndex < stories.length - 1) {
      setActiveStoryIndex(activeStoryIndex + 1);
      setProgress(0);
    } else {
      // Last story reached, close story loop
      setActiveStoryIndex(null);
    }
  };

  const handlePrevStory = () => {
    if (activeStoryIndex === null) return;
    if (activeStoryIndex > 0) {
      setActiveStoryIndex(activeStoryIndex - 1);
      setProgress(0);
    } else {
      setActiveStoryIndex(null);
    }
  };

  if (stories.length === 0) return null;

  return (
    <div className="w-full bg-white border-b border-gray-100 py-5" id="stories-wrapper">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Circle Scrolling Container */}
        <div className="flex items-center gap-5 overflow-x-auto no-scrollbar py-1">
          {stories.map((story, idx) => (
            <button
              key={story.id}
              onClick={() => {
                setActiveStoryIndex(idx);
                setProgress(0);
              }}
              className="flex flex-col items-center gap-1.5 min-w-[76px] text-center focus:outline-none group cursor-pointer"
            >
              {/* Outer Pulsing Ring */}
              <div className="w-[68px] h-[68px] rounded-full p-[3px] bg-gradient-to-tr from-amber-500 via-rose-500 to-emerald-600 transition-transform duration-300 group-hover:scale-105">
                <div className="w-full h-full rounded-full bg-white p-[2px]">
                  <img
                    src={story.media}
                    alt={story.title}
                    className="w-full h-full object-cover rounded-full filter brightness-95"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>
              <span className="text-[10px] font-bold text-gray-700 truncate max-w-[70px] leading-tight">
                {story.title}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Immersive Instagram-style Fullscreen modal */}
      {activeStoryIndex !== null && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-4 select-none">
          <div className="relative w-full max-w-sm aspect-[9/16] bg-slate-900 rounded-2xl overflow-hidden shadow-2xl flex flex-col justify-between">
            
            {/* Top Progressive Bar & Author Title */}
            <div className="absolute top-0 inset-x-0 p-4 bg-gradient-to-b from-black/60 to-transparent z-10">
              
              {/* Progress bars indicator block */}
              <div className="flex gap-1.5 mb-3.5">
                {stories.map((s, index) => {
                  let barWidth = "0%";
                  if (index < activeStoryIndex) barWidth = "100%";
                  if (index === activeStoryIndex) barWidth = `${progress}%`;
                  return (
                    <div key={s.id} className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-white transition-all duration-75 ease-linear"
                        style={{ width: barWidth }}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Title, Icon & close trigger */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full border border-white/20 overflow-hidden">
                    <img src={stories[activeStoryIndex].media} alt="" className="w-full h-full object-cover" />
                  </div>
                  <span className="text-white text-xs font-bold shadow-sm">
                    {stories[activeStoryIndex].title}
                  </span>
                </div>
                <button
                  onClick={() => setActiveStoryIndex(null)}
                  className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Main view container - click left or right elements */}
            <div className="relative flex-1 flex items-center justify-center">
              
              {/* Previous trigger screen slice */}
              <button
                onClick={handlePrevStory}
                className="absolute right-0 top-0 bottom-0 w-1/4 z-10 focus:outline-none cursor-pointer"
                title="استوری قبلی"
              />
              
              {/* Next trigger screen slice */}
              <button
                onClick={handleNextStory}
                className="absolute left-0 top-0 bottom-0 w-1/4 z-10 focus:outline-none cursor-pointer"
                title="استوری بعدی"
              />

              {/* Active Image content */}
              <img
                src={stories[activeStoryIndex].media}
                alt={stories[activeStoryIndex].title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />

              {/* Visual navigation hover buttons (Desktop assistance) */}
              <div className="hidden sm:flex items-center justify-between absolute inset-x-2 z-20 pointer-events-none">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNextStory();
                  }}
                  className="p-1.5 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors pointer-events-auto"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrevStory();
                  }}
                  className="p-1.5 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors pointer-events-auto"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Bottom CTA Destination Clickable bar */}
            <div className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-black/80 to-transparent flex flex-col items-center">
              <button
                onClick={() => {
                  const targetLink = stories[activeStoryIndex].link;
                  setActiveStoryIndex(null);
                  if (targetLink.startsWith("/product/")) {
                    const slug = targetLink.replace("/product/", "");
                    onNavigate("product", { id: slug });
                  } else if (targetLink.startsWith("/category/")) {
                    const slug = targetLink.replace("/category/", "");
                    onNavigate("shop", { category: slug });
                  } else if (targetLink.includes("discount=true")) {
                    onNavigate("shop", { hasDiscount: true });
                  } else {
                    onNavigate("shop");
                  }
                }}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all hover:scale-105 shadow-lg shadow-emerald-900/30 cursor-pointer"
              >
                <span>مشاهده و خرید محصول</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
