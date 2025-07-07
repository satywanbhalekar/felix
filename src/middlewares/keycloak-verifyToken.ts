import jwt from "jsonwebtoken";
import axios from "axios";
import { Request, Response, NextFunction } from "express";
import env from "../config/env";
import { getparametersFromAWS } from "../services/parameterStore.service";


/**
 * Get the Keycloak public key dynamically.
 */
async function getKeycloakPublicKey(realm: string): Promise<string> {

  try {

    console.log("inside verify token getKeycloakPublicKey function!")
    const envVariables = [
      `${env.ENV}-kc-url`
    ];
    const environmentData = await getparametersFromAWS(envVariables);
    console.log("environmentData =>", environmentData);
    if (!environmentData) {
      throw new Error("Environment data not found");
    }
    const kc_url = environmentData[`${env.ENV}-kc-url`];

    const response = await axios.get(`${kc_url}/realms/${realm}/protocol/openid-connect/certs`);
    
    const key = response.data.keys.find((k: any) => k.alg === "RS256"); // Ensure we use the RS256 key

    if (!key || !key.x5c || key.x5c.length === 0) {
      throw new Error("Public key not found in Keycloak response.");
    }

    // Convert x5c (JWK format) to PEM format
    const pem = `-----BEGIN CERTIFICATE-----\n${key.x5c[0]}\n-----END CERTIFICATE-----`;
    return pem
   
  } catch (error: any) {
    console.error("❌ Error fetching public key:", error.message);
    throw new Error("Internal server error");
  }
}

/**
 * Verify the JWT token locally using Keycloak's public key.
 */
// export function verifyTokenLocal(): (req: Request, res: Response, next: NextFunction) => Promise<void> {
//   return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//     console.log("inside verify token function!")
//     console.log("req.originalUrl =>", req.originalUrl);
//     const client_id: string = req.headers.client_id as string;
//     console.log("client_id =>", client_id);
//     let realm ;
//    if (req.originalUrl == '/api/v1/rules/') {
//        // if (req.originalUrl == '/api/v1/rules') {
//       console.log("inside initial realm setup")
//       realm = 'RuleMaster';
//       req.headers.operation = 'starfish_realmsetup'
//     } else if (req.originalUrl == '/api/v1/rules') {
//       console.log("inside tenant realm creation")
//       realm = 'RuleMaster';
//       req.headers.operation = 'tenant_realmsetup'
//     }else {
//        realm = req.params.tenant;
//       if(req.originalUrl == `/api/v1/rules/${realm}` && req.method == 'DELETE'){
//         realm = 'RuleMaster';
//       }
//     }

//     console.log("realm =>", realm);
//     req.headers.tenant = realm;

//     const authHeader = req.get("Authorization");

//     if (!authHeader) {
//       console.warn("🚫 No authorization token provided");
//       res.status(401).json(
//         {
//           "success": false,
//           "meta": {
//             "tracingId": req.headers.correlationId || '',
//             "statusCode":  401,
//             "message":  `No token provided` 
//           },
//           "data": []
//         });
//         return;
//   }

//   const token: string | string[] | undefined = authHeader?.split(" ")[1] || "";
  
//   const decodedToken = jwt.decode(token) as any;

//   if (!decodedToken) {
//       console.warn("🚫 Invalid JWT token received");
//       res.status(401).json(
//           {
//             "success": false,
//             "meta": {
//               "tracingId": req.headers.correlationId || '',
//               "statusCode":  401,
//               "message":  `Invalid token` 
//             },
//             "data": []
//           });
//           return;
//   }

//     if (!realm || !client_id) {
//       res.status(400).json(
//         {
//           "success": false,
//           "meta": {
//             "tracingId": req.headers.correlationId || '',
//             "statusCode":  400,
//             "message":  `Missing realm or clientId in request` 
//           },
//           "data": []
//         })
//       return;
//     }

//     try {
//       const publicKey = await getKeycloakPublicKey(realm);
//       console.log("publicKey =>", publicKey)
//       jwt.verify(token, publicKey, { algorithms: ["RS256"] });
//       console.log("token verified")
//       next();

      
//     } catch (error: any) {
//       console.error("Token verfication failed:", error.message);
//       if (error.message == 'jwt expired') {
//         res.status(401).json(
//         {
//           "success": false,
//           "meta": {
//             "tracingId": req.headers.correlationId || '',
//             "statusCode":  401,
//             "message":  `Token expired` 
//           },
//           "data": []
//         })
//         return;
//       } else if(error.message == 'invalid signature'){
//         res.status(401).json(
//           {
//             "success": false,
//             "meta": {
//               "tracingId": req.headers.correlationId || '',
//               "statusCode":  401,
//               "message":  `Invalid token` 
//             },
//             "data": []
//           })
//           return;
//       } else{
//         res.status(500).json(
//           {
//             "success": false,
//             "meta": {
//               "tracingId": req.headers.correlationId || '',
//               "statusCode":  500,
//               "message":  `${error.message}` 
//             },
//             "data": []
//           })
//           return;
//       }
//     }
//   };
// }




export function verifyTokenLocal(): (req: Request, res: Response, next: NextFunction) => Promise<void> {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    console.log("🛡️ Inside verifyTokenLocal()");
    console.log("🔗 req.originalUrl =>", req.originalUrl);

    const client_id = req.query.client_id as string || req.headers.client_id as string;
    let realm: string | undefined;

    // Handle special paths
    if (req.originalUrl === '/api/v1/rules/' || req.originalUrl === '/api/v1/rules') {
      console.log("⚙️ Inside initial/tenant realm setup");
      realm = 'sonaldev';
      req.headers.operation = req.originalUrl.endsWith('/') ? 'starfish_realmsetup' : 'tenant_realmsetup';
    } else {
      realm = req.query.tenant as string || req.headers.realm as string;

      // Special handling for DELETE by path
      const match = req.originalUrl.match(/^\/api\/v1\/rules\/([^/?]+)/);
      if (!realm && match && req.method === 'DELETE') {
        realm = 'sonaldev';
      }
    }

    console.log("📛 realm =>", realm);
    console.log("📛 client_id =>", client_id);
    req.headers.tenant = realm;

    const authHeader = req.get("Authorization");
    if (!authHeader) {
      console.warn("🚫 No authorization token provided");
      res.status(401).json({
        success: false,
        meta: {
          tracingId: req.headers.correlationId || '',
          statusCode: 401,
          message: `No token provided`
        },
        data: []
      });
      return;
    }

    const token = authHeader?.split(" ")[1];
    const decodedToken = jwt.decode(token) as any;

    if (!decodedToken) {
      console.warn("🚫 Invalid JWT token received");
      res.status(401).json({
        success: false,
        meta: {
          tracingId: req.headers.correlationId || '',
          statusCode: 401,
          message: `Invalid token`
        },
        data: []
      });
      return;
    }

    // ✅ Ensure realm and client_id are not undefined before proceeding
    if (!realm || !client_id) {
      res.status(400).json({
        success: false,
        meta: {
          tracingId: req.headers.correlationId || '',
          statusCode: 400,
          message: `Missing realm or clientId in request`
        },
        data: []
      });
      return;
    }

    try {
      const publicKey = await getKeycloakPublicKey(realm); // ✅ realm is guaranteed to be string
      console.log("🔑 publicKey =>", publicKey);
      jwt.verify(token, publicKey, { algorithms: ["RS256"] }); // ✅ safe to call
      console.log("✅ Token verified");
      next();
    } catch (error: any) {
      console.error("❌ Token verification failed:", error.message);
      const status = error.message === 'jwt expired' || error.message === 'invalid signature' ? 401 : 500;
      res.status(status).json({
        success: false,
        meta: {
          tracingId: req.headers.correlationId || '',
          statusCode: status,
          message: error.message
        },
        data: []
      });
    }
  };
}
