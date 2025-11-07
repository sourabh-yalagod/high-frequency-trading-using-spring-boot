// utils/auth.ts
import { jwtDecode } from "jwt-decode";

interface DecodedToken {
    exp: number;
    iat?: number;
    [key: string]: any;
}

/**
 * Verifies if the stored JWT token is valid and not expired.
 * Returns the decoded payload if valid, otherwise null.
 */
export function getUserId(): string | null {
    try {
        const token = localStorage.getItem("token");
        if (!token || typeof token !== "string") return null;

        const parts = token.split(".");
        if (parts.length !== 3) return null;

        const decoded: DecodedToken = jwtDecode(token);

        if (!decoded.exp) return null;

        const currentTime = Math.floor(Date.now() / 1000);
        if (decoded.exp < currentTime) {
            localStorage.removeItem("token");
            return null;
        }

        return decoded?.userId || decoded?.id || decoded?._id || null;;
    } catch (err) {
        localStorage.removeItem("token");
        return null;
    }
}

/**
 * Helper to check if user is authenticated
 */
export function isAuthenticated(): boolean {
    return getUserId() !== null;
}
