// import axios from 'axios';
// import { getAdminToken } from '../utils/keycloak';
// import { RealmConfig, User } from '../interface/index.interface';
// import  config  from '../config/env';

// export class KeycloakDAO {
//   static async createRealm(realmData: RealmConfig) {
//     const token = await getAdminToken();

//     const response = await axios.post(
//       `${config.keycloak.baseUrl}/admin/realms`,
//       realmData,
//       {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           'Content-Type': 'application/json',
//         },
//       }
//     );

//     return response.data;
//   }
//   static async getAllRealms() {
//     const token = await getAdminToken();
  
//     const response = await axios.get(
//       `${config.keycloak.baseUrl}/admin/realms`,
//       {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           'Content-Type': 'application/json',
//         },
//       }
//     );
  
//     return response.data;
//   }
  
//   static async deleteRealm(realmName: string) {
//     const token = await getAdminToken();
  
//     const response = await axios.delete(
//       `${config.keycloak.baseUrl}/admin/realms/${realmName}`,
//       {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       }
//     );
  
//     return response.data;
//   }
// // CREATE
// static async createUser(realm: string, user: User) {
//     const token = await getAdminToken();
//     const response = await axios.post(
//       `${config.keycloak.baseUrl}/admin/realms/${realm}/users`,
//       user,
//       { headers: { Authorization: `Bearer ${token}` } }
//     );
//     return response.data;
//   }
  
//   // READ (list all users)
//   static async getUsers(realm: string) {
//     const token = await getAdminToken();
//     const response = await axios.get(
//       `${config.keycloak.baseUrl}/admin/realms/${realm}/users`,
//       { headers: { Authorization: `Bearer ${token}` } }
//     );
//     return response.data;
//   }
  
//   // UPDATE
//   static async updateUser(realm: string, userId: string, user: User) {
//     const token = await getAdminToken();
//     const response = await axios.put(
//       `${config.keycloak.baseUrl}/admin/realms/${realm}/users/${userId}`,
//       user,
//       { headers: { Authorization: `Bearer ${token}` } }
//     );
//     return response.data;
//   }
  
//   // DELETE
//   static async deleteUser(realm: string, userId: string) {
//     const token = await getAdminToken();
//     const response = await axios.delete(
//       `${config.keycloak.baseUrl}/admin/realms/${realm}/users/${userId}`,
//       { headers: { Authorization: `Bearer ${token}` } }
//     );
//     return response.data;
//   }
  
// }


import axios from 'axios';
import { getAdminToken } from '../utils/keycloak';
import { User, KeycloakCreateUserPayload, CreateRealmInput } from '../interface/index.interface';
import config from '../config/env';

export class KeycloakDAO {
  // CREATE REALM
  static async createRealm(realmData: CreateRealmInput) {
    console.log("realmDatarealmData",realmData);
    
    const token = await getAdminToken();
    console.log("token???", token)
    const response = await axios.post(
      `${config.keycloak.baseUrl}/admin/realms`,
      realmData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data;
  }

  // GET ALL REALMS
  static async getAllRealms() {
    const token = await getAdminToken();

    const response = await axios.get(
      `${config.keycloak.baseUrl}/admin/realms`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data;
  }

  // DELETE REALM
  static async deleteRealm(realmName: string) {
    const token = await getAdminToken();

    const response = await axios.delete(
      `${config.keycloak.baseUrl}/admin/realms/${realmName}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  }

//   // CREATE USER
//   static async createUser(
//     realm: string,
//     requestBody: KeycloakCreateUserPayload
//   ) {
//     const token = await getAdminToken();
// console.log("dao ",token);

//     const response = await axios.post(
//       `${config.keycloak.baseUrl}/admin/realms/${realm}/users`,
//       requestBody,
//       {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           'Content-Type': 'application/json',
//         },
//       }
//     );
// console.log("dao " ,response.data);

//     return response.data;
//   }

// CREATE USER
static async createUser(
  realm: string,
  requestBody: KeycloakCreateUserPayload
) {
  try {
    console.log(`[DAO:createUser] Start - Realm: ${realm}`);
    console.log(`[DAO:createUser] Request Body:`, requestBody);

    const token = await getAdminToken();
    console.log(`[DAO:createUser] Admin Token Retrieved: ${token.substring(0, 20)}...`);

    const url = `${config.keycloak.baseUrl}/admin/realms/${realm}/users`;
    console.log(`[DAO:createUser] POST URL: ${url}`);

    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
    console.log(`[DAO:createUser] Request Headers:`, headers);

    const response = await axios.post(url, requestBody, { headers });

    console.log(`[DAO:createUser] Response Status: ${response.status}`);
    console.log(`[DAO:createUser] Response Data:`, response.data);

    return response.data;
  } catch (error: any) {
    console.error(`[DAO:createUser] Error occurred:`, error?.response?.data || error.message);
    throw error;
  }
}

  // READ USERS
  static async getUsers(realm: string) {
    const token = await getAdminToken();

    const response = await axios.get(
      `${config.keycloak.baseUrl}/admin/realms/${realm}/users`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data;
  }

  // UPDATE USER
  static async updateUser(realm: string, userId: string, user: User) {
    const token = await getAdminToken();

    const response = await axios.put(
      `${config.keycloak.baseUrl}/admin/realms/${realm}/users/${userId}`,
      user,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data;
  }

  // DELETE USER
  static async deleteUser(realm: string, userId: string) {
    const token = await getAdminToken();

    const response = await axios.delete(
      `${config.keycloak.baseUrl}/admin/realms/${realm}/users/${userId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  }
}
