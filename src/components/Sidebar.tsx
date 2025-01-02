'use client';

interface SidebarProps {
  activeItem: string;
  onItemClick: (item: string) => void;
}

export default function Sidebar({ activeItem, onItemClick }: SidebarProps) {
  const items = [
    { id: 'datasets', label: 'Datasets', icon: '📊' },
    { id: 'chunks', label: 'Chunks', icon: '🧩' },
    { id: 'vectors', label: 'Vectors', icon: '🔢' },
  ];

  return (
    <div className="w-64 bg-white h-screen border-r">
      <div className="p-4 border-b">
        <h1 className="text-xl font-semibold">Simpleton AI</h1>
      </div>
      <nav className="p-4">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onItemClick(item.id)}
            className={`w-full text-left p-3 rounded-lg mb-2 flex items-center ${
              activeItem === item.id
                ? 'bg-blue-50 text-blue-600'
                : 'hover:bg-gray-50'
            }`}
          >
            <span className="mr-3">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
