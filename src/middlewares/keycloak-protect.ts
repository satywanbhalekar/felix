import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

/**
 * Middleware to apply Keycloak's `protect()` in a type-safe way.
 * @param role (Optional) Role required to access the resource
 */
export function protectKeycloak(requiredRole?: string) {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {

        console.log("KeycloakRequest =>", req.params.tenant);
        const client_id: string = req.headers.client_id as string;
        console.log("client_id =>", client_id);
        console.log(`🔐 protectKeycloak executing for role: ${requiredRole || "Authenticated User"}`);

        try {
            // Extract token from request headers
            const authHeader = req.headers.authorization || '';
            if (!authHeader) {
                console.warn("🚫 No authorization token provided");
                res.status(401).json(
                    {
                      "success": false,
                      "meta": {
                        "tracingId": req.headers.correlationId || '',
                        "statusCode":  401,
                        "message":  `No token provided` 
                      },
                      "data": []
                    });
                    return;
            }

            const token = authHeader.split(" ")[1];
            const decodedToken = jwt.decode(token) as any;

            if (!decodedToken) {
                console.warn("🚫 Invalid JWT token received");
                res.status(401).json(
                    {
                      "success": false,
                      "meta": {
                        "tracingId": req.headers.correlationId || '',
                        "statusCode":  401,
                        "message":  `Invalid token` 
                      },
                      "data": []
                    });
                    return;
            }

            console.log("🔑 Decoded Token:", JSON.stringify(decodedToken, null, 2));

            // Extract user roles from token
            const userRoles = decodedToken.resource_access?.[client_id]?.roles || [];
            console.log("👤 User Roles:", userRoles);
            console.log("👤 Required Role:", requiredRole);

            // If a role is required, check if the user has it
            if (requiredRole && !userRoles.includes(requiredRole)) {
                console.warn(`🚫 Access Denied: User does not have the required role '${requiredRole}'`);
                res.status(403).json(
                    {
                      "success": false,
                      "meta": {
                        "tracingId": req.headers.correlationId || '',
                        "statusCode":  403,
                        "message":  `Unauthorized access` 
                      },
                      "data": []
                    });
                    return;
            } else {
                console.log("✅ User authorized, calling next()");
                next();
            }


           
        } catch (error: any) {
            console.error("❌ Error in protectKeycloak:", error.message);
            res.status(500).json(
                {
                  "success": false,
                  "meta": {
                    "tracingId": req.headers.correlationId || '',
                    "statusCode":  500,
                    "message":  `Internal Server Error` 
                  },
                  "data": []
                });
                return;
        }
    };
}
