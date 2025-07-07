import { supabase } from '../config/db';

export class TenantTemplateDAO {
  // static async getAllTemplates() {
  //   const { data, error } = await supabase
  //     .from('tenanttemplate')
  //     .select('*');

  //   if (error) {
  //     console.error('[DAO:getAllTemplates] Supabase error:', error.message);
  //     throw new Error(`Supabase error: ${error.message}`);
  //   }

  //   return data;
  // }
  static async getAllTemplates() {
    const { data, error } = await supabase
      .from('tenanttemplate')
      .select('id, created_at, data');

    if (error) {
      console.error('[DAO:getAllTemplates] Supabase error:', error.message);
      throw new Error(`Supabase error: ${error.message}`);
    }

    if (!data || data.length === 0) {
      throw new Error('[DAO:getAllTemplates] No templates found.');
    }

    console.log('[DAO:getAllTemplates] Raw Supabase data:', data);

    const parsedTemplates = data.map((row) => {
      try {
        const rawTemplate = row.data?.template;

        if (!rawTemplate) {
          throw new Error('Missing data.template in tenanttemplate row');
        }

        const parsed =
          typeof rawTemplate === 'string' ? JSON.parse(rawTemplate) : rawTemplate;

        return {
          ...row,
          template: parsed, // exposed at top-level for service access
        };
      } catch (e) {
        console.error('[DAO:getAllTemplates] JSON parse error:', e);
        throw new Error('Invalid JSON in data.template');
      }
    });

    return parsedTemplates;
  }
}
