import Keycloak from "keycloak-connect";
import session from "express-session";
import env from "../config/env";

import { getparametersFromAWS } from "../services/parameterStore.service";

/**
 * Dynamically create Keycloak instance with the fetched client secret.
 */
export async function createKeycloakInstance(realm: string, clientId: string) {
    const clientSecretKey = `${env.ENV}-` + realm + "-"+clientId;
    const envVariables = [
        clientSecretKey,
        `${env.ENV}-kc-url`
      ];
    console.log("keycloak-config ==>", envVariables)
    const environmentData = await getparametersFromAWS(envVariables);
    console.log("environmentData =>",environmentData);
    if (!environmentData[`${clientSecretKey}`]) {
        throw new Error("Client secret not found for given realm and clientId");
    }
    const clientSecret = environmentData[`${clientSecretKey}`];
    const kc_url = environmentData[`${env.ENV}-kc-url`];


    const keycloakConfig = {
        realm: realm,
        "auth-server-url": kc_url,
        "ssl-required": "external",
        resource: clientId,
        credentials: {
            secret: clientSecret
        },
        "confidential-port": 0
    };

    const memoryStore = new session.MemoryStore();
    return new Keycloak({ store: memoryStore }, keycloakConfig);
}
