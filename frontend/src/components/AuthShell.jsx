import { Link } from 'react-router-dom';
import { Zap } from 'lucide-react';

export default function AuthShell({
  title,
  description,
  descriptionLink,
  descriptionLinkText,
  asideTitle,
  asideSubtitle,
  asideHighlights = [],
  children,
}) {
  return (
    <div className="flex min-h-screen bg-elevated">
      {/* Left panel */}
      <aside className="hidden lg:flex flex-1 flex-col justify-between p-12 relative overflow-hidden bg-gradient-to-br from-primary via-primary-hover to-[#111112]">
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute -bottom-15 -left-15 w-60 h-60 rounded-full bg-white/5 pointer-events-none" />

        <div className="flex items-center gap-3 mb-8 relative z-10">
          <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center">
            <Zap size={16} color="#fff" fill="#fff" />
          </div>
          <span className="font-bold text-white text-[15px]">PlanDaya</span>
        </div>

        <div className="relative text-white z-10">
          <h2 className="font-display font-bold text-3xl leading-tight max-w-[14rem]">
            {asideTitle}
          </h2>
          <p className="mt-4 text-white/75 leading-relaxed max-w-sm">
            {asideSubtitle}
          </p>

          <div className="grid gap-3 mt-7">
            {asideHighlights.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/10">
                <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                  <Icon size={16} color="#fff" />
                </div>
                <span className="text-[15px] text-white">{text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-white/30 text-xs relative z-10 text-center">© 2026 PlanDaya</p>
      </aside>

      {/* Right panel */}
      <main className="flex-1 lg:flex-none lg:w-[500px] bg-base flex flex-col justify-center px-6 py-10 lg:p-12">
        <div className="w-full max-w-[380px] mx-auto">
          {/* Mobile Logo */}
          <div className="flex items-center gap-2.5 mb-10 lg:hidden">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-[0_4px_10px_rgba(0,0,0,0.22)]">
              <Zap size={17} color="#fff" fill="#fff" />
            </div>
            <span className="font-bold text-text-primary">PlanDaya</span>
          </div>

          <div className="mb-10">
            <h1 className="font-display font-bold text-2xl mb-1 text-text-primary">
              {title}
            </h1>
            <p className="text-sm text-text-placeholder">
              {description}{' '}
              {descriptionLink && (
                <Link to={descriptionLink} className="text-primary font-semibold underline">
                  {descriptionLinkText}
                </Link>
              )}
            </p>
          </div>

          {children}
        </div>
      </main>
    </div>
  );
}
