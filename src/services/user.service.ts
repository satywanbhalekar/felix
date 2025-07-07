import { CreateUserRequest, KeycloakCreateUserPayload, User } from '../interface/index.interface';
import { KeycloakDAO } from '../dao/keycloak.dao';

export class UserService {
  // static createUser(realm: string, user: User) {
  //   return KeycloakDAO.createUser(realm, user);
  // }
  static createUser(realm: string, requestBody: CreateUserRequest) {
    if (!requestBody.role) {
      throw new Error("User role is required to assign the user to a group.");
    }
  
    const password = this.generateRandomPassword(12);
  
    const groupName = `${requestBody.role}_${realm}`;
    console.log(`[Service:createUser] groupName: ${groupName}`);
  
    const postUserRequestBody: KeycloakCreateUserPayload = {
      username: requestBody.email,
      enabled: true,
      firstName: requestBody.firstName,
      lastName: requestBody.lastName,
      email: requestBody.email,
      emailVerified: true,
      requiredActions: ["UPDATE_PASSWORD"],
      credentials: [
        {
          type: "password",
          value: password,
          temporary: true,
        },
      ],
      groups: [groupName],
    };
  
    return KeycloakDAO.createUser(realm, postUserRequestBody);
  }
  
  
  static generateRandomPassword(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$!';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }
  

  static getUsers(realm: string) {
    return KeycloakDAO.getUsers(realm);
  }

  static updateUser(realm: string, userId: string, user: User) {
    return KeycloakDAO.updateUser(realm, userId, user);
  }

  static deleteUser(realm: string, userId: string) {
    return KeycloakDAO.deleteUser(realm, userId);
  }
}
