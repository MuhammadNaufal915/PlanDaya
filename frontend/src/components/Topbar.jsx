import { useState } from 'react';
import { Menu, Bell, Search } from 'lucide-react';

export default function Topbar({ onMenuClick, title }) {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="h-16 flex items-center justify-between px-4 lg:px-6 border-b border-white/5 bg-navy-950/80 backdrop-blur-sm sticky top-0 z-20"
      style={{ background: 'rgba(7,6,26,0.85)' }}>
      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-colors"
        >
          <Menu size={20} />
        </button>
        <h1 className="text-white font-display font-semibold text-lg">{title}</h1>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        <button className="w-9 h-9 flex items-center justify-center rounded-lg text-white/50 hover:text-white hover:bg-white/5 transition-colors">
          <Search size={18} />
        </button>
        <button className="relative w-9 h-9 flex items-center justify-center rounded-lg text-white/50 hover:text-white hover:bg-white/5 transition-colors">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500" />
        </button>
      </div>
    </header>
  );
}
