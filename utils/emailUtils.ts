export const getSenderEmail = (userEmail: string | undefined | null): string => {
    const DEFAULT_SENDER = "info@acceleralia.com";
    if (!userEmail) return DEFAULT_SENDER;
    
    const cleanEmail = userEmail.trim().toLowerCase();
    const domain = cleanEmail.split('@')[1];

    if (!domain) return DEFAULT_SENDER;

    switch (domain) {
        case 'acceleralia.com':
        case 'gmail.com':
            return "info@acceleralia.com";
        case 'fundswin.ai':
        case 'grantswin.ai':
            return "clientes@fundswin.ai";
        case 'clusterdigital.cat':
            return "oportunitats@clusterdigital.cat";
        default:
            return DEFAULT_SENDER;
    }
};