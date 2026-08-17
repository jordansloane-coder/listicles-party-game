'use client';

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

interface Props {
  onPlay: () => void;
}

export default function SplashScreen({ onPlay }: Props) {
  return (
    <div className="fixed inset-0 flex flex-col">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`${BASE_PATH}/splash.png`} alt="" className="absolute inset-0 w-full h-full object-cover" />
      <div className="relative mt-auto w-full px-6 pb-10 pt-16 bg-gradient-to-t from-black/70 to-transparent">
        <button
          onClick={onPlay}
          className="w-full rounded-2xl bg-hot text-white font-extrabold text-2xl py-5 shadow-lg active:scale-95 transition-transform"
        >
          ▶ Play
        </button>
      </div>
    </div>
  );
}
