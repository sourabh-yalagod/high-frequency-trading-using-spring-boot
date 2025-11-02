package cryptoHub.lib;

import java.util.List;

public class AppConstants {
    public final static String JWT_SECRETE_KEY = "4b7f9d3a2c1e8f0a9b6d4c3e5f7a12345d2e6b8a9c0f1e2d3a4b5c6d7e8f9012";
    public final static String PUBLIC_AUTH_ROUTES = "/api/auth";
    public static final List<String> PUBLIC_ROUTES = List.of(
            "/api/auth",
            "/api/public",
            "/login",
            "/stripe/webhook"
    );
}
