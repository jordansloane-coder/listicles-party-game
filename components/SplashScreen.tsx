'use client';

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

interface Props {
  onPlay: () => void;
}

export default function SplashScreen({ onPlay }: Props) {
  return (
    <div className="fixed inset-0 h-dvh w-screen flex flex-col bg-hot-deep">
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
    </div>
  );
}
