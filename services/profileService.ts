
import { supabase } from '../supabase-client';
import type { UserProfile, FindData, UserProject } from '../types';

export const profileService = {
    // Obtener perfiles del usuario actual (Array)
    async getUserProfiles(): Promise<UserProfile[]> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];

        const { data, error } = await supabase
            .from('user_profile')
            .select('*')
            .eq('user_id', user.id)
            .order('last_modified', { ascending: false });

        if (error) {
            console.error("Error fetching user profiles:", error);
            return [];
        }

        return data as UserProfile[];
    },

    // Obtener perfil único
    async getUserProfile(): Promise<UserProfile | null> {
        const profiles = await this.getUserProfiles();
        return profiles.length > 0 ? profiles[0] : null;
    },

    // Obtener proyectos del usuario
    async getUserProjects(): Promise<UserProject[]> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];

        const { data, error } = await supabase
            .from('users_projects')
            .select('*')
            .eq('user_id', user.id)
            .order('last_modified', { ascending: false });

        if (error) {
            console.error("Error fetching user projects:", error);
            return [];
        }

        return data as UserProject[];
    },

    // Mapear el perfil de DB al estado local de Stage1
    mapProfileToStage1(profile: UserProfile): Partial<FindData['stage1']> {
        let previousExperienceText = "";
        if (profile && Array.isArray(profile.experience)) {
            previousExperienceText = profile.experience
                .map((exp: any) => typeof exp === 'string' ? exp : `${exp.type || 'Experiencia'}: ${exp.description || ''}`)
                .join('\n\n');
        } else if (typeof profile.experience === 'string') {
            previousExperienceText = profile.experience;
        }

        return {
            companyName: profile.company_name || '',
            websiteUrl: profile.website || '',
            nifVat: profile.nif_vat || '',
            tipoEntidad: profile.tipo_entidad || '',
            pais: profile.pais || '',
            ciudad: profile.ciudad || '',
            description: profile.description || '',
            main_location: profile.location || '',
            sectorPrincipal: profile.sector_principal || '',
            sectoresSecundarios: profile.sectores_secundarios || [],
            keyServices: profile.products || [],
            targetSectors: profile.interest_sectors || [],
            projectDetails: {
                hasProject: null,
                title: '',
                description: '',
                category: '',
                scope: '',
                previousExperience: previousExperienceText,
                tipoIniciativa: '',
                notasInternas: '',
                trlActual: '',
                trlObjetivo: '',
                areasTematicas: []
            } as any
        };
    },

    // Mapear proyecto guardado a projectDetails de Stage1
    mapUserProjectToDetails(project: UserProject): Partial<FindData['stage1']['projectDetails']> {
        return {
            hasProject: true,
            title: project.project_title || '',
            description: project.project_description || '',
            category: project.category || '',
            scope: project.territorial_scope || '', 
            budget: project.estimated_budget || undefined,
            tipoIniciativa: project.tipo_iniciativa || '',
            areasTematicas: project.areas_tematicas || [],
            trlActual: project.trl_actual || '',
            trlObjetivo: project.trl_objetivo || '',
            notasInternas: project.notas_internas || '',
            previousExperience: project.previous_experience || '',
            technicalCapabilities: project.technical_capabilities || '',
        };
    }
};
