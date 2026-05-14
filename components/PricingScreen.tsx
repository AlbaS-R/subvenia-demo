import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from './common/Button';

interface PricingScreenProps {
  onStart: () => void;
}

const CheckRow: React.FC<{ text: string }> = ({ text }) => (
  <li className="flex items-start gap-3 text-neutral-100 font-roboto text-sm sm:text-base">
    <span className="material-symbols-outlined text-primary text-xl shrink-0 mt-0.5">check_circle</span>
    <span>{text}</span>
  </li>
);

const PricingScreen: React.FC<PricingScreenProps> = ({ onStart }) => {
  const { t } = useLanguage();

  const tiers = [
    { key: 'starter' as const, highlight: false },
    { key: 'pro' as const, highlight: true },
    { key: 'enterprise' as const, highlight: false },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto py-2 md:py-4 animate-toast-in pb-16">
      <div className="text-center mb-10 space-y-3">
        <p className="text-xs font-black uppercase tracking-[0.25em] text-primary font-poppins">
          {t('pricing.kicker')}
        </p>
        <h1 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tighter text-neutral-50 leading-tight font-poppins">
          <span className="method-gradient-headline">{t('pricing.title')}</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto font-medium leading-relaxed font-roboto">
          {t('pricing.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
        {tiers.map((tier) => (
          <div
            key={tier.key}
            className={`relative flex flex-col rounded-3xl p-6 sm:p-8 border transition-all shadow-md hover:shadow-xl overflow-hidden ${
              tier.highlight
                ? 'border-primary/50 bg-[#0d1828] ring-2 ring-primary/25 scale-[1.02] md:scale-105 z-10 shadow-[0_0_0_1px_rgba(68,237,204,0.2),0_24px_60px_-20px_rgba(68,237,204,0.25)]'
                : 'glass-panel border-white/10'
            }`}
          >
            <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(68,237,204,0.1),transparent_62%)] pointer-events-none" />
            {tier.highlight && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest font-poppins shadow-md z-10">
                {t('pricing.badgePopular')}
              </div>
            )}
            <h2 className="relative z-10 text-lg font-black uppercase tracking-tight text-neutral-50 font-poppins mb-1">
              {t(`pricing.${tier.key}.name`)}
            </h2>
            <p className="relative z-10 text-sm text-muted-foreground font-roboto mb-6 min-h-[2.5rem]">
              {t(`pricing.${tier.key}.blurb`)}
            </p>
            <div className="relative z-10 mb-6">
              <span className="text-3xl sm:text-4xl font-black text-white font-poppins">
                {t(`pricing.${tier.key}.price`)}
              </span>
              <span className="text-muted-foreground text-sm font-medium ml-1 font-roboto">
                {t(`pricing.${tier.key}.period`)}
              </span>
            </div>
            <ul className="relative z-10 space-y-3 flex-grow mb-8">
              {(t(`pricing.${tier.key}.features`) as string[]).map((line, i) => (
                <CheckRow key={i} text={line} />
              ))}
            </ul>
            <Button
              variant={tier.highlight ? 'primary' : 'outline'}
              size="lg"
              className="relative z-10 w-full rounded-2xl"
              onClick={onStart}
            >
              {t(`pricing.${tier.key}.cta`)}
            </Button>
          </div>
        ))}
      </div>

      <p className="mt-10 text-center text-sm text-neutral-500 dark:text-neutral-400 font-roboto max-w-xl mx-auto">
        {t('pricing.footnote')}
      </p>
    </div>
  );
};

export default PricingScreen;
