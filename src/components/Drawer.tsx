'use client';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function Drawer({ isOpen, onClose, title, children }: DrawerProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            ✕
          </button>
        </div>
        <div className="p-4">
          {children}
        </div>
      </div>
    </>
  );
}
