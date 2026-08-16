'use client';

interface Props {
  code: string;
  connectedCount: number;
  totalCount: number;
  onLeave: () => void;
}

export default function RoomHeader({ code, connectedCount, totalCount, onLeave }: Props) {
  return (
    <div className="w-full flex items-center justify-between gap-2 px-1 pb-1 max-w-md mx-auto">
      <div className="flex items-center gap-2 text-sm font-bold">
        <span className="rounded-full bg-hot/10 text-hot px-3 py-1 tracking-widest">{code}</span>
        <span className="opacity-50">
          {connectedCount}/{totalCount} connected
        </span>
      </div>
      <button onClick={onLeave} className="text-xs opacity-50 underline shrink-0">
        Leave game
      </button>
    </div>
  );
}
