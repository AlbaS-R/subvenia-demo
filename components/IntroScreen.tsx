
import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from './common/Button';

interface IntroScreenProps {
  onStart: () => void;
}

const FeatureCard: React.FC<{ icon: string; title: string; description: string }> = ({ icon, title, description }) => (
  <div className="glass-panel p-6 rounded-3xl transition-all shadow-md hover:shadow-2xl hover:-translate-y-1 group border border-white/10 relative overflow-hidden">
    <div aria-hidden className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-[radial-gradient(ellipse_at_top,rgba(68,237,204,0.12),transparent_60%)]" />
    <div className="relative z-10 w-12 h-12 bg-primary/15 rounded-2xl flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
      <span className="material-symbols-outlined text-2xl">{icon}</span>
    </div>
    <h3 className="relative z-10 text-lg font-black uppercase tracking-tight text-neutral-100 mb-2 leading-tight font-poppins">{title}</h3>
    <p className="relative z-10 text-base text-muted-foreground leading-relaxed font-medium font-roboto">{description}</p>
  </div>
);

const IntroScreen: React.FC<IntroScreenProps> = ({ onStart }) => {
  const { t } = useLanguage();

  return (
    <>
      <div className="w-full max-w-5xl mx-auto py-6 md:py-8 animate-toast-in relative">
        
        {/* Hero Section */}
        <div className="text-center mb-12 space-y-5 pt-6 md:pt-0">
          <div className="inline-flex flex-wrap items-center justify-center gap-2">
            <span className="rounded-full border border-primary/35 bg-primary/10 px-4 py-1.5 text-xs font-black uppercase tracking-[0.2em] text-primary font-poppins">No es un buscador</span>
            <span className="rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-muted-foreground">Es un motor de euros para vuestros socios</span>
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tighter text-neutral-100 leading-[1.05] font-poppins">
            <span className="method-gradient-headline">Más dinero para vuestros socios.</span>
            <br />
            <span className="text-white">Cero postureo tecnológico.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto font-medium leading-relaxed font-roboto">
            {t('introScreen.subtitle')}
          </p>

          <div className="pt-4">
              <Button onClick={onStart} size="lg" className="h-14 px-10 rounded-full shadow-2xl shadow-primary/30 hover:scale-105">
                  <span className="material-symbols-outlined mr-2">arrow_forward</span>
                  {t('introScreen.cta')}
              </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <FeatureCard 
            icon="group_add" 
            title={t('introScreen.step1_title')} 
            description={t('introScreen.step1_desc')} 
          />
          <FeatureCard 
            icon="psychology" 
            title={t('introScreen.step2_title')} 
            description={t('introScreen.step2_desc')} 
          />
          <FeatureCard 
            icon="auto_awesome_motion" 
            title={t('introScreen.step3_title')} 
            description={t('introScreen.step3_desc')} 
          />
        </div>

        {/* Social Proof / Cases */}
        <div className="glass-panel rounded-3xl p-8 md:p-10 text-neutral-50 overflow-hidden relative group shadow-xl border border-white/10 motion-shimmer">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-[8rem]">rocket_launch</span>
          </div>
          <div className="relative z-10">
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-primary mb-6 opacity-80 font-poppins">{t('introScreen.example_title')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  <div>
                      <h4 className="text-2xl font-black uppercase tracking-tighter mb-4 font-poppins text-neutral-50">{t('introScreen.example1_title')}</h4>
                      <ul className="space-y-3">
                          {[t('introScreen.example1_item1'), t('introScreen.example1_item2')].map((item, i) => (
                              <li key={i} className="flex items-center gap-3 text-neutral-200">
                                  <span className="w-4 h-px bg-primary"></span>
                                  <span className="text-sm font-bold uppercase tracking-tight font-poppins">{item}</span>
                              </li>
                          ))}
                      </ul>
                  </div>
                  <div className="hidden md:block border-l border-white/10 pl-10">
                      <p className="text-base text-muted-foreground italic leading-relaxed font-roboto">
                          "No vendemos IA: vendemos una forma automática de que vuestra cámara, clúster o asociación genere oportunidades económicas medibles."
                      </p>
                      <p className="mt-3 font-black uppercase text-xs tracking-widest text-primary font-poppins">— Subvenia</p>
                  </div>
              </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default IntroScreen;
