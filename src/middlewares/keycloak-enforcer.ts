import { Request, Response, NextFunction } from "express";
import { createKeycloakInstance } from "../config/keycloak-config";

/**
 * Middleware to apply Keycloak's `protect()` in a type-safe way.
 * @param permissionToBe Required permission string in format "resource-scope"
 */
export function keycloakEnforcer(permissionToBe: string) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const client_id: string = req.headers.client_id as string;
      const permissions: string = req.headers.permissions as string;
      const realm: string = req.headers.tenant as string;

      console.log("permissions", req.headers);

      if (!permissions) {
        console.warn("🚫 No permissions provided");
        res.status(400).json({
          success: false,
          meta: {
            tracingId: req.headers.correlationid || '',
            statusCode: 400,
            message: "Missing permissions in request"
          },
          data: []
        });
      } else if (permissionToBe !== permissions) {
        res.status(403).json({
          success: false,
          meta: {
            tracingId: req.headers.correlationid || '',
            statusCode: 403,
            message: "Insufficient permissions"
          },
          data: []
        });
      } else {
        const permissionsArray: string[] = [permissions];
        console.log("permissionsArray", permissionsArray, realm);

        // TODO: Use createKeycloakInstance if needed with realm
        next();
      }
    } catch (error) {
      console.error("❌ Error in keycloakEnforcer middleware:", error);
      res.status(500).json({
        success: false,
        meta: {
          tracingId: req.headers.correlationid || '',
          statusCode: 500,
          message: "Internal server error"
        },
        data: []
      });
    }
  };
}
