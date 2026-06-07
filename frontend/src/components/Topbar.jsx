import { useState } from 'react';
import { Menu, Bell, Search, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Topbar({ onMenuClick, title }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const { user } = useAuth();

  return (
    <header
      className="h-16 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-20 bg-elevated/94 backdrop-blur-md border-b border-border-default shadow-sm"
    >
      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl transition-all hover:bg-neutral-100 text-text-muted"
          aria-label="Menu"
        >
          <Menu size={20} />
        </button>

        {searchOpen ? (
          <div className="flex items-center gap-2 animate-slide-down">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-base border-[1.5px] border-border-default">
              <Search size={15} className="text-text-placeholder" />
              <input
                autoFocus
                placeholder="Cari..."
                className="bg-transparent outline-none text-sm w-44 text-text-primary"
              />
            </div>
            <button
              onClick={() => setSearchOpen(false)}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-neutral-100 transition-colors text-text-placeholder"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <div>
            <h1 className="font-display font-semibold text-base text-text-primary">
              {title}
            </h1>
            <p className="text-xs hidden sm:block text-text-placeholder">
              {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
        )}
      </div>
    </header>
  );
}
