
import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from './common/Button';
import { Input } from './common/Input';
import { useToast } from '../contexts/ToastContext';

interface HomeScreenProps {
    onShowDashboard: () => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ onShowDashboard }) => {
    const { t } = useLanguage();
    const [companyName, setCompanyName] = useState('');
    const [websiteUrl, setWebsiteUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { showToast } = useToast();

    const handleSearch = async () => {
        if (!companyName.trim() || !websiteUrl.trim()) {
            showToast(t('homeScreen.toastEnterData'), 'warning');
            return;
        }
        
        // Robust URL validation using the URL constructor
        let urlString = websiteUrl.trim();

        // Handle protocol-relative URLs by prepending 'https:'
        if (urlString.startsWith('//')) {
            urlString = `https:${urlString}`;
        }

        // If no protocol is specified, prepend 'https://'. This regex is generic for any protocol.
        if (!/^[a-z][a-z0-9+.-]*:/i.test(urlString)) {
            urlString = `https://${urlString}`;
        }

        try {
            new URL(urlString);
        } catch (_) {
            showToast(t('homeScreen.toastInvalidUrl'), 'warning');
            return;
        }


        setIsLoading(true);

        try {
            // This simulates a POST request to a backend endpoint like /api/jobs.
            // In a real application, you would use fetch() here.
            // For this MVP, we simulate a delay and a successful response.
            await new Promise(resolve => setTimeout(resolve, 1500));

            const mockApiResponse = { jobId: `job_${Date.now()}` };
            
            // On success, redirect to the next step (generation page).
            // As there is no router, this will cause a full page refresh to a new URL.
            // This behavior fulfills the requirement to redirect.
            window.location.href = `/generar/${mockApiResponse.jobId}`;

        } catch (error) {
            console.error("Error creating job:", error);
            showToast(t('homeScreen.toastError'), 'error');
            setIsLoading(false); // Only set loading to false on error, as success redirects
        }
    };

    return (
        <div className="w-full max-w-5xl mx-auto p-4 sm:p-0">
            <header className="absolute top-8 right-8">
                <Button onClick={onShowDashboard} className="bg-primary-500 text-primary-foreground hover:bg-primary-600 focus:ring-primary-400 relative shadow-md">
                    <span className="material-symbols-outlined text-xl leading-none mr-2">folder</span>
                    {t('homeScreen.documentsButton')}
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-destructive-500"></span>
                    </span>
                </Button>
            </header>

            <main className="flex flex-col items-start text-left pt-12">
                 <div className="flex items-center gap-4 mb-4">
                    <span className="material-symbols-outlined text-5xl leading-none text-neutral-700 flex-shrink-0">find_in_page</span>
                    <h1 className="text-4xl sm:text-5xl font-bold text-neutral-700 font-poppins">{t('homeScreen.findTitle')}</h1>
                </div>

                <p className="mt-2 max-w-3xl text-lg text-neutral-700 font-roboto">
                    {t('homeScreen.findSubtitle1')}
                </p>
                <p className="mt-6 max-w-3xl text-base text-neutral-500 font-roboto">
                    {t('homeScreen.findSubtitle2')}
                </p>

                <div className="w-full max-w-2xl mt-12 text-left space-y-6">
                    <div>
                        <label htmlFor="companyName" className="block text-base font-medium text-neutral-700 mb-2 font-poppins">{t('homeScreen.companyNameLabel')}</label>
                        <Input 
                            id="companyName"
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            placeholder={t('homeScreen.companyNamePlaceholder')}
                            className="py-3 rounded-xl border-neutral-300 focus:border-primary-500 focus:ring-primary-500"
                        />
                    </div>
                     <div>
                        <label htmlFor="websiteUrl" className="block text-base font-medium text-neutral-700 mb-2 font-poppins">{t('homeScreen.websiteUrlLabel')}</label>
                        <Input 
                            id="websiteUrl"
                            type="url"
                            value={websiteUrl}
                            onChange={(e) => setWebsiteUrl(e.target.value)}
                            placeholder={t('homeScreen.websiteUrlPlaceholder')}
                            className="py-3 rounded-xl border-neutral-300 focus:border-primary-500 focus:ring-primary-500"
                        />
                    </div>
                    <Button 
                        onClick={handleSearch} 
                        isLoading={isLoading}
                        disabled={isLoading}
                        className="w-full bg-primary-500 text-primary-foreground rounded-full hover:bg-primary-600"
                        size="lg"
                    >
                        {isLoading ? t('homeScreen.searchingButton') : t('homeScreen.searchButton')}
                    </Button>
                </div>
            </main>
        </div>
    );
};

export default HomeScreen;
