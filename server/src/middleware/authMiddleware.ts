import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

interface DecodedToken extends JwtPayload {
  sub: string;
  "custom:role"?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: string;
      };
    }
  }
}

export const authMiddleware = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    try {
      const decoded = jwt.decode(token) as any;
      if (!decoded) {
        console.error("JWT decode returned null for token:", token.substring(0, 10) + "...");
        res.status(401).json({ message: "Invalid token format" });
        return;
      }

      // Check multiple possible locations for the role in the JWT
      const jwtRole =
        decoded.role ||
        decoded.metadata?.role ||
        decoded.publicMetadata?.userType ||   // Clerk stores role here as "userType"
        decoded.publicMetadata?.role ||
        decoded.unsafeMetadata?.userType ||
        decoded.unsafeMetadata?.role ||
        decoded["custom:role"];

      // Fallback: use the userType query param if JWT doesn't carry role info.
      // This is needed because Clerk's default JWT template does NOT include
      // publicMetadata, so the role must be passed explicitly by the client.
      const queryRole = req.query.userType as string | undefined;

      const userRole = jwtRole || queryRole || "tenant";

      console.log(`[Auth] User:${decoded.sub} Role:${userRole} Path:${req.path}`);

      req.user = {
        id: decoded.sub || "",
        role: userRole.toLowerCase(),
      };

      const hasAccess = allowedRoles.map(r => r.toLowerCase()).includes(userRole.toLowerCase());
      if (!hasAccess) {
        console.warn(`[Auth] Access Denied: User has ${userRole} but needs ${allowedRoles}`);
        res.status(403).json({
          message: "Forbidden",
          details: `Role mismatch: User is [${userRole}] but this endpoint requires [${allowedRoles}]`
        });
        return;
      }
    } catch (err) {
      console.error("[Auth] Decode Error:", err);
      res.status(400).json({ message: "Invalid token" });
      return;
    }

    next();
  };
};