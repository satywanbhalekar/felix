import { Request, Response } from 'express';
import { TenantTemplateService } from '../services/tenantTemplate.service';

export const getAllTenantTemplates = async (req: Request, res: Response) => {
  try {
    const templates = await TenantTemplateService.getAllTemplates();
    console.log("templatestemplates",templates);
    
    res.status(200).json(templates);
  } catch (err: any) {
    console.error('[Controller:getAllTenantTemplates] Error:', err.message);
    res.status(500).json({ error: err.message });
  }
};
