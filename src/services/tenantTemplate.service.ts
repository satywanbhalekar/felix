import { TenantTemplateDAO } from '../dao/tenantTemplate.dao';

export class TenantTemplateService {
  static async getAllTemplates() {
    return await TenantTemplateDAO.getAllTemplates();
  }
}
