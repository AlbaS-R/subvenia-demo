import React from 'react';

export type LandingPage = 'intro' | 'pricing';

interface LandingNavbarProps {
  active: LandingPage;
  onSelectIntro: () => void;
  onSelectPricing: () => void;
}

const LandingNavbar: React.FC<LandingNavbarProps> = ({
  active,
  onSelectIntro,
  onSelectPricing: _onSelectPricing,
}) => {
  return (
    <header className="sticky top-0 z-30 mb-6 -mx-4 sm:-mx-8 px-4 sm:px-8 py-3 glass-panel rounded-b-2xl border-b border-white/10 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={onSelectIntro}
          className="flex items-center gap-2 group text-left"
          aria-current={active === 'intro' ? 'page' : undefined}
        >
          <span className="material-symbols-outlined text-primary text-2xl sm:text-3xl">
            find_in_page
          </span>
          <span className="text-xl sm:text-2xl font-bold text-neutral-100 font-poppins tracking-tight">
            Subvenia
          </span>
        </button>

        
      </div>
    </header>
  );
};

export default LandingNavbar;
