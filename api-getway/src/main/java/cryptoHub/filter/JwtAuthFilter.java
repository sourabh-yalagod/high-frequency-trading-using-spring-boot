package cryptoHub.filter;

import cryptoHub.exception.ErrorHandlerForFilters;
import cryptoHub.lib.AppConstants;
import cryptoHub.util.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {
    private final JwtUtil jwtUtil;
    private final ErrorHandlerForFilters errorHandlerForFilters;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        String apiPath = request.getServletPath();
        boolean isPublicRoute = AppConstants.PUBLIC_ROUTES.stream()
                .anyMatch(apiPath::startsWith);
        if (isPublicRoute) {
            filterChain.doFilter(request, response);
            return;
        }
        String authorization = request.getHeader("Authorization");
        try {
            if (authorization == null || !authorization.startsWith("Bearer ")) {
                errorHandlerForFilters.writeErrorResponse(response, HttpStatus.UNAUTHORIZED, "Missing Authorization header");
                return;
            }

            String token = authorization.substring(7).trim();
            if (token.isBlank()) {
                errorHandlerForFilters.writeErrorResponse(response, HttpStatus.UNAUTHORIZED, "Authorization token is empty");
                return;
            }

            if (!jwtUtil.isValidJwt(token)) {
                errorHandlerForFilters.writeErrorResponse(response, HttpStatus.UNAUTHORIZED, "Token expired or invalid");
                return;
            }
            filterChain.doFilter(request, response);
        } catch (Exception e) {
            if (!response.isCommitted()) {
                errorHandlerForFilters.writeErrorResponse(response, HttpStatus.INTERNAL_SERVER_ERROR, "Internal server error");
            }
        }
    }
}
