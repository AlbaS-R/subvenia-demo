
import { supabase } from '../supabase-client';
import type { UserProfile, FindData, UserProject } from '../types';

export const profileService = {
    // Obtener perfiles del usuario actual (Array)
    async getUserProfiles(): Promise<UserProfile[]> {
        if (localStorage.getItem('subvenia_mock_user')) {
            const localData = localStorage.getItem('subvenia_mock_profiles');
            const profiles = localData ? JSON.parse(localData) : [];

            if (profiles.length === 0) {
                const demoProfiles: UserProfile[] = [
                    {
                        id: 'demo-profile-1',
                        user_id: 'mock-demo-user-id',
                        company_name: 'EcoEnergy Solutions S.L.',
                        website: 'https://ecoenergy.example.com',
                        nif_vat: 'B12345678',
                        tipo_entidad: 'Pyme',
                        sector_principal: 'Energía',
                        description: 'Desarrollo de paneles solares de alta eficiencia y sistemas de almacenamiento energético.',
                        palabras_clave_es: 'Energía solar, Fotovoltaica, Baterías, Renovables',
                        palabras_clave_en: 'Solar energy, Photovoltaics, Batteries, Renewables',
                        last_modified: new Date().toISOString()
                    },
                    {
                        id: 'demo-profile-2',
                        user_id: 'mock-demo-user-id',
                        company_name: 'BioTech Innovate',
                        website: 'https://biotech.example.com',
                        nif_vat: 'A87654321',
                        tipo_entidad: 'Startup',
                        sector_principal: 'Salud',
                        description: 'Investigación en biotecnología aplicada a la regeneración celular y medicina de precisión.',
                        palabras_clave_es: 'Biotecnología, Salud, Medicina, Genética',
                        palabras_clave_en: 'Biotechnology, Health, Medicine, Genetics',
                        last_modified: new Date().toISOString()
                    },
                    {
                        id: 'demo-profile-3',
                        user_id: 'mock-demo-user-id',
                        company_name: 'AgroSmart Digital',
                        website: 'https://agrosmart.example.com',
                        nif_vat: 'B45678912',
                        tipo_entidad: 'Pyme',
                        sector_principal: 'Agricultura',
                        description: 'Digitalización del sector agrícola mediante sensores IoT y análisis de datos para optimización de riego.',
                        palabras_clave_es: 'Agricultura, IoT, Sensores, Digitalización',
                        palabras_clave_en: 'Agriculture, IoT, Sensors, Digitalization',
                        last_modified: new Date().toISOString()
                    }
                ];
                localStorage.setItem('subvenia_mock_profiles', JSON.stringify(demoProfiles));
                return demoProfiles;
            }
            return profiles;
        }

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
