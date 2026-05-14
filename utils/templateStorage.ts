
import { TemplateConfig } from '../types';
import { getDefaultTemplate } from './defaultTemplates';

const STORAGE_KEY = 'find_corp_template_config';

export const saveTemplateConfig = (config: TemplateConfig) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
};

export const getTemplateConfig = (email?: string): TemplateConfig => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        try {
            return JSON.parse(saved);
        } catch (e) {
            return getDefaultTemplate(email);
        }
    }
    return getDefaultTemplate(email);
};
