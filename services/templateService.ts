import { BrandTemplate, TemplateConfig } from '../types';
import { supabase } from '../supabase-client';
import { getDefaultTemplate } from '../utils/defaultTemplates';

const LOCAL_STORAGE_KEY = 'gw_find_corp_templates_library';

// Función auxiliar para obtener datos de localStorage
const getLocalTemplates = (): BrandTemplate[] => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
};

// Función auxiliar para guardar en localStorage
const saveLocalTemplates = (templates: BrandTemplate[]) => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(templates));
};

export const templateService = {
    async getTemplates(): Promise<BrandTemplate[]> {
        try {
            if (localStorage.getItem('subvenia_mock_user')) {
                const localTemplates = getLocalTemplates();
                if (localTemplates.length === 0) {
                    // Inject demo templates
                    const demo1: BrandTemplate = {
                        id: 'demo-template-1',
                        user_id: 'mock-demo-user-id',
                        name: 'Identidad Corporativa Standard',
                        config: getDefaultTemplate('demo@subvenia.es', 'es'),
                        last_modified: new Date().toISOString()
                    };

                    const demo2Config = getDefaultTemplate('demo@subvenia.es', 'es');
                    demo2Config.primaryColor = '#1e293b';
                    demo2Config.coverLayout = 'classic-centered';
                    demo2Config.coverTitle = 'INFORME DE ALTO IMPACTO';
                    
                    const demo2: BrandTemplate = {
                        id: 'demo-template-2',
                        user_id: 'mock-demo-user-id',
                        name: 'Identidad Ejecutiva Premium',
                        config: demo2Config,
                        last_modified: new Date().toISOString()
                    };

                    saveLocalTemplates([demo1, demo2]);
                    return [demo1, demo2];
                }
                return localTemplates;
            }

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return getLocalTemplates();

            // Apuntamos a la nueva tabla find_corp_templates
            const { data, error } = await supabase
                .from('find_corp_templates')
                .select('*')
                .eq('user_id', user.id)
                .order('last_modified', { ascending: false });

            if (error) {
                console.warn("Supabase table 'find_corp_templates' not found, using local storage fallback.");
                return getLocalTemplates();
            }

            return (data || []).map((item: any) => ({
                id: item.id,
                user_id: user.id,
                name: item.name,
                config: item.config as TemplateConfig,
                last_modified: item.last_modified
            }));
        } catch (error) {
            return getLocalTemplates();
        }
    },

    async saveTemplate(name: string, config: TemplateConfig): Promise<string> {
        const { data: { user } } = await supabase.auth.getUser();
        const newId = crypto.randomUUID();
        const now = new Date().toISOString();

        const newTemplate: BrandTemplate = {
            id: newId,
            user_id: user?.id || 'local-user',
            name: name,
            config: config,
            last_modified: now
        };

        const locals = getLocalTemplates();
        saveLocalTemplates([newTemplate, ...locals]);

        if (user) {
            try {
                await supabase
                    .from('find_corp_templates')
                    .insert({
                        id: newId,
                        user_id: user.id,
                        name: name,
                        config: config,
                        last_modified: now
                    });
            } catch (e) {
                console.error("Could not sync to Supabase:", e);
            }
        }

        return newId;
    },

    async updateTemplate(id: string, config: TemplateConfig): Promise<void> {
        const now = new Date().toISOString();
        
        const locals = getLocalTemplates();
        const updatedLocals = locals.map(t => t.id === id ? { ...t, config, last_modified: now } : t);
        saveLocalTemplates(updatedLocals);

        try {
            await supabase
                .from('find_corp_templates')
                .update({
                    config: config,
                    last_modified: now
                })
                .eq('id', id);
        } catch (e) {
            console.error("Could not sync update to Supabase:", e);
        }
    },

    async deleteTemplate(id: string): Promise<void> {
        const locals = getLocalTemplates();
        const filteredLocals = locals.filter(t => t.id !== id);
        saveLocalTemplates(filteredLocals);

        try {
            await supabase
                .from('find_corp_templates')
                .delete()
                .eq('id', id);
        } catch (e) {
            console.error("Could not sync deletion to Supabase:", e);
        }
    }
};
