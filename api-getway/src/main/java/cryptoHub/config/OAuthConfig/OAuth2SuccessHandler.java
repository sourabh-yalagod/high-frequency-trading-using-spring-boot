package cryptoHub.config.OAuthConfig;

import cryptoHub.dto.CacheUserDto;
import cryptoHub.entity.TwoFactorAuthEntity;
import cryptoHub.entity.UserEntity;
import cryptoHub.lib.AppConstants;
import cryptoHub.repository.UserRepository;
import cryptoHub.service.AuthUserService;
import cryptoHub.service.RedisService;
import cryptoHub.types.CommunicationChannel;
import cryptoHub.types.RolesEnum;
import cryptoHub.util.JwtUtil;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler implements AuthenticationSuccessHandler {
    private final AuthUserService authUserService;
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    private final RedisService redisService;
    @Value("${frontend.baseurl}")
    private String FRONTEND_BASE_URL;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        try {
            OAuth2AuthenticationToken oAuth2AuthenticationToken = (OAuth2AuthenticationToken) authentication;
            OAuth2User oAuth2User = oAuth2AuthenticationToken.getPrincipal();

            String email = oAuth2User.getAttribute("email");
            String name = oAuth2User.getAttribute("name");

            // Validate email
            if (email == null || email.isEmpty()) {
                redirectWithError(response, "Email not provided by OAuth provider");
                return;
            }

            UserEntity user = authUserService.loadUserByUsername(email);

            if (user == null) {
                try {
                    TwoFactorAuthEntity twoFactorAuthEntity = TwoFactorAuthEntity
                            .builder()
                            .channel(CommunicationChannel.EMAIL)
                            .isVerified(true)
                            .build();

                    UserEntity newUser = UserEntity
                            .builder()
                            .email(email)
                            .username(name)
                            .twoFactorAuthEntity(twoFactorAuthEntity)
                            .role(RolesEnum.USER)
                            .build();

                    user = authUserService.registerUser(newUser);
                } catch (Exception e) {
                    System.err.println("User creation failed: " + e.getMessage());
                    e.printStackTrace();
                    redirectWithError(response, "User registration failed");
                    return;
                }
            }
            String accessToken = jwtUtil.generateJwtToken(user.getEmail(), user.getId(), AppConstants.ACCESS_TOKEN_EXPIRY_IN_MINUTES);
            String refreshToken = jwtUtil.generateJwtToken(user.getEmail(), user.getId(), AppConstants.ACCESS_TOKEN_EXPIRY_IN_MINUTES);
            user.setRefreshToken(refreshToken);
            userRepository.save(user);
            CacheUserDto cacheUserDto = CacheUserDto.builder().userId(user.getId()).email(user.getEmail()).amount(user.getAmount()).build();
            redisService.cacheUser(cacheUserDto);
            String redirectUrl = FRONTEND_BASE_URL + "/signin?status=success&token=" + accessToken;
            response.sendRedirect(redirectUrl);

        } catch (Exception e) {
            System.err.println("OAuth authentication error: " + e.getMessage());
            e.printStackTrace();
            redirectWithError(response, "Authentication failed");
        }
    }

    private void redirectWithError(HttpServletResponse response, String errorMessage) throws IOException {
        String encodedError = URLEncoder.encode(errorMessage, StandardCharsets.UTF_8);
        String redirectUrl = FRONTEND_BASE_URL + "/signin?status=error&message=" + encodedError;
        response.sendRedirect(redirectUrl);
        return;
    }
}