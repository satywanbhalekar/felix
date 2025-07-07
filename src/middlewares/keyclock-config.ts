import Keycloak from "keycloak-connect";
import session from "express-session";
import env from "../config/env";
import { getparametersFromAWS } from "../services/parameterStore.service";

/**
 * Dynamically create Keycloak instance with the fetched client secret.
 */
export async function createKeycloakInstance(realm: string, clientId: string) {
    const clientSecretKey = `${env.ENV}-${realm}-${clientId}`;
    const kcUrlKey = `${env.ENV}-kc-url`;

    const envVariables = [clientSecretKey, kcUrlKey];
    console.log("Keycloak env variables:", envVariables);

    const environmentData = await getparametersFromAWS(envVariables);
    console.log("Fetched environment data:", environmentData);

    const clientSecret = environmentData[clientSecretKey];
    const kc_url = environmentData[kcUrlKey];

    if (!clientSecret || !kc_url) {
        throw new Error("Keycloak client secret or URL not found.");
    }

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
