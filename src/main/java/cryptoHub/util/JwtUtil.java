package cryptoHub.util;

import cryptoHub.lib.AppConstants;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.security.SecureRandom;
import java.util.Collection;
import java.util.Date;
import java.util.HashSet;
import java.util.Set;

@Component
public class JwtUtil {
    private static final SecretKey secretKey = Keys.hmacShaKeyFor(AppConstants.JWT_SECRETE_KEY.getBytes());

    public String generateJwtToken(String subject, long expiryTimeInMinutes, Authentication authentication) {
        String roles = getRolesFromAuthentication(authentication.getAuthorities());
        return Jwts
                .builder()
                .signWith(secretKey)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * expiryTimeInMinutes))
                .setSubject(subject)
                .claim("email", subject)
                .claim("authorities", roles)
                .compact();
    }

    public String getEmailFromToken(String token) {
        Claims claims = Jwts.parserBuilder().setSigningKey(secretKey).build().parseClaimsJws(token).getBody();
        return String.valueOf(claims.get("email"));
    }

    public String getRolesFromToken(String token) {
        Claims claims = Jwts.parserBuilder().setSigningKey(secretKey).build().parseClaimsJws(token).getBody();
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
        try {
            Claims claims = Jwts.parserBuilder().setSigningKey(secretKey).build().parseClaimsJws(token).getBody();
            return claims.getExpiration() != null && claims.getExpiration().after(new Date());
        } catch (RuntimeException e) {
            return false;
        }
    }

}
