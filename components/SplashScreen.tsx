'use client';

import { useEffect, useRef, useState } from 'react';

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

interface Props {
  onPlay: () => void;
}

export default function SplashScreen({ onPlay }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [debug, setDebug] = useState<string>('measuring…');

  useEffect(() => {
    const html = document.documentElement;
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = document.body.style.overflow;
    html.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    return () => {
      html.style.overflow = prevHtmlOverflow;
      document.body.style.overflow = prevBodyOverflow;
    };
  }, []);

  // TEMPORARY diagnostic readout — measures the actual on-device numbers
  // instead of guessing at CSS fixes blindly. Remove once the bottom-gap
  // bug is root-caused.
  useEffect(() => {
    function measure() {
      const probe = document.createElement('div');
      probe.style.cssText = 'position:fixed;bottom:0;left:0;width:0;height:env(safe-area-inset-bottom);visibility:hidden;';
      document.body.appendChild(probe);
      const safeAreaBottom = probe.getBoundingClientRect().height;
      document.body.removeChild(probe);

      const rootRect = rootRef.current?.getBoundingClientRect();
      const bodyRect = document.body.getBoundingClientRect();
      const htmlRect = document.documentElement.getBoundingClientRect();

      setDebug(
        [
          `innerHeight: ${window.innerHeight}`,
          `visualViewport: ${window.visualViewport?.height ?? 'n/a'}`,
          `docEl.clientHeight: ${document.documentElement.clientHeight}`,
          `html rect: ${htmlRect.top.toFixed(1)}–${htmlRect.bottom.toFixed(1)} (h=${htmlRect.height.toFixed(1)})`,
          `body rect: ${bodyRect.top.toFixed(1)}–${bodyRect.bottom.toFixed(1)} (h=${bodyRect.height.toFixed(1)})`,
          `root rect: ${rootRect?.top.toFixed(1)}–${rootRect?.bottom.toFixed(1)} (h=${rootRect?.height.toFixed(1)})`,
          `safe-area-bottom: ${safeAreaBottom}`,
          `devicePixelRatio: ${window.devicePixelRatio}`,
        ].join('\n')
      );
    }
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  return (
    <div ref={rootRef} className="relative flex-1 flex flex-col w-full bg-hot-deep overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`${BASE_PATH}/splash.png`} alt="" className="absolute inset-0 w-full h-full object-cover" />
      <div
        className="relative mt-auto w-full px-6 pt-16 bg-gradient-to-t from-black/70 to-transparent"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 2.5rem)' }}
      >
        <button
          onClick={onPlay}
          className="w-full flex items-center justify-center gap-2 rounded-2xl bg-hot text-white font-extrabold text-2xl py-5 shadow-lg active:scale-95 transition-transform"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 shrink-0">
            <path d="M8 5v14l11-7z" />
          </svg>
          Play
        </button>
      </div>
      <pre className="fixed top-16 left-2 z-50 text-[10px] leading-tight text-lime-300 bg-black/80 p-2 rounded whitespace-pre-wrap">
        {debug}
      </pre>
    </div>
  );
}
