
import { supabase } from '../supabase-client';
import type { FindData, Project } from '../types';

export const projectService = {
  async getProjects(): Promise<Project[]> {
    if (localStorage.getItem('subvenia_mock_user')) {
        const localData = localStorage.getItem('subvenia_mock_projects');
        const projects = localData ? JSON.parse(localData) : [];
        
        if (projects.length === 0) {
            const demoProject: Project = {
                id: 'demo-project-id',
                name: 'Proyecto Demo - Empresa de Tecnología',
                lastModified: new Date().toISOString(),
                websiteUrl: 'https://subvenia.es',
                result: null,
                currentStage: 2,
                maxReachedStage: 2,
                findData: {
                    jobId: null,
                    stage1: {
                        companyName: 'Tecnología Demo S.L.',
                        websiteUrl: 'https://subvenia.es',
                        pastedText: '',
                        reportLanguage: 'es',
                        keywords: { core: ['IA', 'Software'], horizontal: [], action: [] },
                        business_summary: 'Desarrollo de software de inteligencia artificial.',
                        description: 'Empresa tecnológica especializada en soluciones de automatización.',
                        sectorPrincipal: 'Tecnología',
                        sectoresSecundarios: [],
                        targetSectors: [],
                        keyServices: [],
                        main_location: 'Madrid',
                        fundingTypes: {},
                        projectDetails: {},
                        searchStartDate: '',
                        searchEndDate: ''
                    },
                    stage2: {
                        result: []
                    },
                    stage4_searchResults: []
                }
            };
            localStorage.setItem('subvenia_mock_projects', JSON.stringify([demoProject]));
            return [demoProject];
        }
        return projects;
    }

    const { data, error } = await supabase
      .from('find_corp_projects')
      .select('*')
      .order('last_modified', { ascending: false });

    if (error) throw error;

    return data.map((row: any) => {
      const fData = row.find_data as FindData;
      if (row.plantilla) {
          fData.templateConfig = row.plantilla;
      }
      
      const displayName = row.name || 'Proyecto sin nombre';

      // Asegurarse de que batchResults tenga reportUrl si existe en el nivel superior
      if (row.report_url && fData && fData.isBatch && fData.batchResults && fData.batchResults.length > 0) {
        if (!fData.batchResults[0].reportUrl) {
            fData.batchResults[0].reportUrl = row.report_url;
        }
      }

      return {
        id: row.id,
        name: displayName,
        lastModified: row.last_modified,
        websiteUrl: fData?.stage1?.websiteUrl || '',
        result: fData?.stage2?.result || null,
        currentStage: row.current_stage,
        maxReachedStage: row.max_reached_stage,
        findData: fData,
      };
    });
  },

  async createProject(initialData: FindData, userId: string): Promise<string> {
    const today = new Date().toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

    if (userId === 'mock-demo-user-id') {
        const id = crypto.randomUUID();
        const projects = await this.getProjects();
        const projectNumber = projects.length + 1;
        const initialName = `Proyecto ${projectNumber} - ${today}`;

        const newProject: Project = {
            id,
            name: initialName,
            lastModified: new Date().toISOString(),
            websiteUrl: initialData.stage1?.websiteUrl || '',
            result: null,
            currentStage: 1,
            maxReachedStage: 1,
            findData: initialData
        };
        localStorage.setItem('subvenia_mock_projects', JSON.stringify([newProject, ...projects]));
        return id;
    }

    // Obtener el conteo actual para generar el número de proyecto
    const { count, error: countError } = await supabase
      .from('find_corp_projects')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (countError) throw countError;

    const projectNumber = (count || 0) + 1;
    const initialName = `Proyecto ${projectNumber} - ${today}`;

    const { data, error } = await supabase
      .from('find_corp_projects')
      .insert({
        user_id: userId,
        name: initialName,
        current_stage: 1,
        max_reached_stage: 1,
        find_data: initialData,
        plantilla: initialData.templateConfig || null
      })
      .select('id')
      .single();

    if (error) throw error;
    return data.id;
  },

  async updateProject(id: string, findData: FindData, currentStage: number, maxReachedStage: number): Promise<void> {
    if (localStorage.getItem('subvenia_mock_user')) {
        const projects = await this.getProjects();
        const index = projects.findIndex(p => p.id === id);
        if (index !== -1) {
            projects[index] = {
                ...projects[index],
                findData,
                currentStage,
                maxReachedStage,
                lastModified: new Date().toISOString()
            };
            localStorage.setItem('subvenia_mock_projects', JSON.stringify(projects));
        }
        return;
    }

    const { error } = await supabase
      .from('find_corp_projects')
      .update({
        current_stage: currentStage,
        max_reached_stage: maxReachedStage,
        find_data: findData,
        plantilla: findData.templateConfig || null,
        last_modified: new Date().toISOString()
      })
      .eq('id', id);

    if (error) throw error;
  },

  async deleteProject(id: string): Promise<void> {
    const { error } = await supabase
      .from('find_corp_projects')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};
