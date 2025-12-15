import { useEffect } from 'react';

type ToastProps = {
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
  duration?: number;
};

export default function Toast({ message, type = 'info', onClose, duration = 4000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const color = {
    success: 'bg-green-100 text-green-800 border-green-300',
    error: 'bg-red-100 text-red-800 border-red-300',
    info: 'bg-blue-100 text-blue-800 border-blue-300',
  }[type];

  return (
    <div
      className={`flex items-start gap-2 border shadow-sm rounded px-4 py-3 ${color}`}
      role="status"
    >
      <div className="font-semibold capitalize">{type}</div>
      <div className="flex-1 text-sm">{message}</div>
      <button
        className="text-sm font-semibold underline underline-offset-2"
        onClick={onClose}
        aria-label="Fermer la notification"
      >
        Fermer
      </button>
    </div>
  );
}







