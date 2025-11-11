package cryptoHub.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.security.SecureRandom;
import java.util.*;

@Component
public class JwtUtil {
    public final static String JWT_SECRET_KEY = Base64.getEncoder().encodeToString(
            "this-is-a-very-long-random-secret-key-at-least-64-bytes-long-please-do-not-shortcut".getBytes()
    );
    private static final SecretKey secretKey =
            Keys.hmacShaKeyFor(Base64.getDecoder().decode(JWT_SECRET_KEY));

    public String generateJwtToken(String subject, String userId, long expiryTimeInMinutes) {
        return Jwts
                .builder()
                .signWith(secretKey)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * expiryTimeInMinutes))
                .setSubject(subject)
                .claim("email", subject)
                .claim("userId", userId)
                .compact();
    }
    public Claims getClaims(String token) {
        try{
            return Jwts.parserBuilder().setSigningKey(secretKey).build().parseClaimsJws(token).getBody();
        } catch (RuntimeException e) {
            System.out.println(e.getMessage());
            return null;
        }
    }
    public String getEmailFromToken(String token) {
        Claims claims = getClaims(token);
        return String.valueOf(claims.get("email"));
    }
    public String getRolesFromToken(String token) {
        Claims claims = getClaims(token);
        return String.valueOf(claims.get("authorities"));
    }
    private String getRolesFromAuthentication(Collection<? extends GrantedAuthority> authorities) {
        Set<String> role = new HashSet<>();
        authorities.forEach((auth) -> {
            role.add(auth.getAuthority());
        });
        return String.join("", role);
    }
    public boolean isValidJwt(String token) {
        Claims claims = getClaims(token);
        return claims.getExpiration() != null && claims.getExpiration().after(new Date());
    }
}
