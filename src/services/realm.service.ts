// // eslint-disable-next-line @typescript-eslint/no-unused-vars
// import { RealmConfig } from '../interface/index.interface';
// import { KeycloakDAO } from '../dao/keycloak.dao';

// import { TenantTemplateDAO } from '../dao/tenantTemplate.dao';
// // eslint-disable-next-line @typescript-eslint/no-unused-vars
// import { v4 as uuidv4 } from 'uuid';



// export class RealmService {
//   // static async createRealm(realm: RealmConfig) {
//   //   return KeycloakDAO.createRealm(realm);
//   // }


//     static generateRandomPassword(length: number): string {
//       const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
//       return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
//     }
  
//     static async createRealm({
//       tenantName,
//       email,
//       lastName,
//       firstName,
//       role
//     }: {
//       tenantName: string;
//       email: string;
//       lastName: string;
//       firstName: string;
//       role: string;
//     }) {
//       const templates = await TenantTemplateDAO.getAllTemplates();
    
//       const template = templates[0].template; // fixed this line
//       console.log('[debug] raw template JSON:', JSON.stringify(template, null, 2));
    
//       const randomPassword = this.generateRandomPassword(12);
//       const timestamp = new Date().toISOString();
    
//       // Convert template object to string
//       let modifiedTemplate = JSON.stringify(template);
    
//       // Replace placeholders
//       modifiedTemplate = modifiedTemplate
//         .replace(/unique_tenant_name/g, tenantName)
//         .replace(/unique_user_email/g, email)
//         .replace(/unique_user_lastname/g, lastName)
//         .replace(/unique_user_firstname/g, firstName)
//         .replace(/unique_user_password/g, randomPassword)
//         .replace(/unique_user_role/g, role)
//         .replace(/timestamp/g, timestamp);
    
//       // Parse back to JSON
//       const parsedRealmPayload = JSON.parse(modifiedTemplate);
    
//       // Call Keycloak to create realm
//       await KeycloakDAO.createRealm(parsedRealmPayload);
    
//       return {
//         tenantName,
//         email,
//         firstName,
//         lastName,
//         role,
//         password: randomPassword
//       };
//     }
    
  
  

//   static async getAllRealms() {
//     return KeycloakDAO.getAllRealms();
//   }
  
//   static async deleteRealm(realmName: string) {
//     return KeycloakDAO.deleteRealm(realmName);
//   }
  
// }

import { RealmConfig } from '../interface/index.interface';
import { KeycloakDAO } from '../dao/keycloak.dao';
import { supabase } from '../config/db';
import fs from 'fs';

function generateRandomPassword(length = 12): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export class RealmService {
  static async createRealm(realm: RealmConfig) {
    console.log('realm>>>', realm);

    // Step 1 → fetch tenanttemplate from Supabase
    const { data, error } = await supabase
      .from('tenanttemplate')
      .select('*');

    if (error) {
      console.error('Supabase fetch error:', error);
      throw new Error(`Failed to fetch from Supabase: ${error.message}`);
    }

    if (!data || data.length === 0) {
      throw new Error('No tenanttemplate data found in Supabase.');
    }

    const templateRow = data[0];
    const templateJson = templateRow.data;

    console.log('✅ Template fetched from Supabase.');

    // Step 2 → prepare replacement values
    const randomPassword = generateRandomPassword();

    if (!realm.tenantName) {
      throw new Error('tenantName is required in request body');
    }
    if (!realm.admin?.email) {
      throw new Error('admin.email is required in request body');
    }
    if (!realm.admin?.lastName) {
      throw new Error('admin.lastName is required in request body');
    }

    const replacements: Record<string, string> = {
      unique_tenant_name: realm.tenantName,
      unique_user_email: realm.admin.email,
      unique_user_firstname: realm.admin.firstName,
      unique_user_lastname: realm.admin.lastName,
      unique_user_password: randomPassword,
      timestamp: String(Date.now()),    // ← updated here
    };

    console.log("Replacements:", replacements);

    // Step 3 → replace placeholders using stringified JSON
    const replacedTemplate = JSON.parse(
      JSON.stringify(templateJson)
        .replace(/unique_tenant_name/g, replacements.unique_tenant_name)
        .replace(/unique_user_email/g, replacements.unique_user_email)
        .replace(/unique_user_firstname/g, replacements.unique_user_firstname)
        .replace(/unique_user_lastname/g, replacements.unique_user_lastname)
        .replace(/unique_user_password/g, replacements.unique_user_password)
        .replace(/timestamp/g, replacements.timestamp)
    );
    // Step 4 → write replaced template to file (optional)
    const fileName = './template-output.json';
    fs.writeFileSync(fileName, JSON.stringify(replacedTemplate, null, 2), 'utf-8');

    console.log(`✅ Replaced template written to file: ${fileName}`);

    // Step 5 → create realm in Keycloak using modified template
    const keycloakResult = await KeycloakDAO.createRealm(replacedTemplate);

    return {
      keycloakResult,
      replacedTemplate,
    };
  }

  static async getAllTenantTemplates() {
    const { data, error } = await supabase
      .from('tenanttemplate')
      .select('*');

    if (error) {
      console.error('Supabase fetch error:', error);
      throw new Error(`Failed to fetch from Supabase: ${error.message}`);
    }

    return data;
  }

  static async getAllRealms() {
    return KeycloakDAO.getAllRealms();
  }

  static async deleteRealm(realmName: string) {
    return KeycloakDAO.deleteRealm(realmName);
  }
}
