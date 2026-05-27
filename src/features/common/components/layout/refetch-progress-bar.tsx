import { useIsFetching } from "@tanstack/react-query";

export function RefetchProgressBar() {
  const isFetching = useIsFetching();

  if (isFetching === 0) return null;

  return (
    <div className={`
      fixed top-0 left-0 z-[9999] h-1 w-full overflow-hidden bg-transparent
    `}
    >
      <div className="animate-progress h-full w-full origin-left bg-primary" />
      <style>{`
        @keyframes progress {
          0% { transform: translateX(-100%) scaleX(0.2); }
          50% { transform: translateX(0%) scaleX(0.5); }
          100% { transform: translateX(100%) scaleX(0.2); }
        }
        .animate-progress {
          animation: progress 1.5s infinite linear;
        }
      `}
      </style>
    </div>
  );
}
