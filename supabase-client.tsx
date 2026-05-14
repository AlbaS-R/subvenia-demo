import { createClient } from '@supabase/supabase-js';

// PROYECTO 1: Autenticación y Datos de Usuario (NUEVAS CREDENCIALES)
const supabaseUrlAuth = 'https://beqmydjizaxbjxkdxzuv.supabase.co';
const supabaseKeyAuth = 'sb_publishable_k_Enpx4uiv_3ICZdSHTtqg_EiRM7YAd';

// PROYECTO 2: Base de Datos de Subvenciones y Licitaciones (SE MANTIENE)
const supabaseUrlData = 'https://mpesfjpddozkjwsfekyf.supabase.co';
const supabaseKeyData = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1wZXNmanBkZG96a2p3c2Zla3lmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwMDgyNjgsImV4cCI6MjA3ODU4NDI2OH0.XreKNBzLHDr_qGCcS-TCYeWIRUm3x6tOQguD6KE7KiI';

// Cliente Principal (Auth + User Data)
export const supabase = createClient(supabaseUrlAuth, supabaseKeyAuth);

// Cliente de Datos Públicos (Búsqueda de Subvenciones)
export const supabasePublicData = createClient(supabaseUrlData, supabaseKeyData);