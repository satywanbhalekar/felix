import axios from 'axios';
import config from '../config/env';

export const getAdminToken = async (): Promise<string> => {
  const params = new URLSearchParams();
  params.append('grant_type', 'password');
  params.append('client_id', config.keycloak.clientId);
  params.append('username', config.keycloak.username);
  params.append('password', config.keycloak.password);

  const response = await axios.post(
    `${config.keycloak.baseUrl}/realms/master/protocol/openid-connect/token`,
    params,
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  );

  return response.data.access_token;
};
