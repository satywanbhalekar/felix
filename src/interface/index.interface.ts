// export interface RealmConfig {
//   id: string;
//   realm: string;
//   enabled: boolean;
//   [key: string]: any;
// }
// export interface User {
//   id?: string;
//   username: string;
//   email?: string;
//   firstName?: string;
//   lastName?: string;
//   enabled: boolean;
//   emailVerified?: boolean;
//   realmRoles?: string[];
//   access?: Record<string, boolean>;
//   createdTimestamp?: number;
// }

// interface

export interface RealmConfig {
  id: string;
  realm: string;
  enabled: boolean;
  [key: string]: any;
}

export interface User {
  id?: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  enabled: boolean;
  emailVerified?: boolean;
  realmRoles?: string[];
  access?: Record<string, boolean>;
  createdTimestamp?: number;
}

export interface CreateUserRequest {
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

export interface KeycloakCreateUserPayload {
  username: string;
  enabled: boolean;
  firstName: string;
  lastName: string;
  email: string;
  emailVerified?: boolean;
  requiredActions?: string[];
  credentials?: Array<{
    type: string;
    value: string;
    temporary: boolean;
  }>;
  groups?: string[];
}
export interface CreateRealmInput {
  tenantName: string;
  email: string;
  firstName: string;
  lastName: string;
  role?: string;
}