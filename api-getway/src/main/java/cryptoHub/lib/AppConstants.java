package cryptoHub.lib;

import java.util.List;

public class AppConstants {
    public final static String JWT_SECRETE_KEY = "Zm9yU2VjdXJlSFM1MTJ5b3UtbmVlZC1hLXN0cm9uZ2VyLWtleS10aGFuLXRoaXMtb25lLXNvLW1ha2UtaXQtbG9uZy1lbm91Z2g=";
    public final static String PUBLIC_AUTH_ROUTES = "/api/auth";
    public static final List<String> PUBLIC_ROUTES = List.of(
            "/api/auth/**",
            "/api/public/**",
            "/login",
            "/stripe/webhook",
            "/order/webhook/**"
    );
    public static final int ACCESS_TOKEN_EXPIRY_IN_MINUTES = 60;
    public static final int REFRESH_TOKEN_EXPIRY_IN_MINUTES = 60 * 24 * 7;
    public static final String STRIPE_SESSION_COMPLETED_EVENT="checkout.session.completed";
}
