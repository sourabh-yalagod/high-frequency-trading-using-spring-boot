package cryptoHub.config.OAuthConfig;

import com.fasterxml.jackson.databind.ObjectMapper;
import cryptoHub.entity.TwoFactorAuthEntity;
import cryptoHub.entity.UserEntity;
import cryptoHub.service.AuthUserService;
import cryptoHub.types.CommunicationChannel;
import cryptoHub.types.RolesEnum;
import cryptoHub.util.JwtUtil;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler implements AuthenticationSuccessHandler {
    private final AuthUserService authUserService;
    private final JwtUtil jwtUtil;
    private final ObjectMapper objectMapper;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        System.out.println("Authentication : " + authentication);
        OAuth2AuthenticationToken oAuth2AuthenticationToken = (OAuth2AuthenticationToken) authentication;
        OAuth2User oAuth2User = oAuth2AuthenticationToken.getPrincipal();
        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");
        UserEntity user = authUserService.loadUserByUsername(email);
        System.out.println("CHICHING : " + user);
        if (user == null) {
            try {
                TwoFactorAuthEntity twoFactorAuthEntity = TwoFactorAuthEntity
                        .builder()
                        .channel(CommunicationChannel.EMAIL)
                        .isVerified(false)
                        .build();
                UserEntity newUser = UserEntity
                        .builder()
                        .email(email)
                        .username(name)
                        .twoFactorAuthEntity(twoFactorAuthEntity)
                        .role(RolesEnum.USER)
                        .build();
                System.out.println(newUser);
                user = authUserService.registerUser(newUser);
            } catch (Exception e) {
                throw new RuntimeException("User Creation failed...!\n Please try with different methods");
            }
        }

        String accessToken = jwtUtil.generateJwtToken(email, 10, authentication);
        String refreshToken = jwtUtil.generateJwtToken(email, 7 * 24 * 60, authentication);

        Map<String, Object> responseBody = new HashMap<>();
        responseBody.put("message", "OAuth2 login successful");

        Map<String, Object> userData = new HashMap<>();
        userData.put("id", user.getId());
        userData.put("accessToken", accessToken);
        userData.put("refreshToken", refreshToken);

        responseBody.put("user", userData);
        // Write response
        response.setStatus(HttpServletResponse.SC_OK);
        response.setContentType("application/json");
        response.getWriter().write(objectMapper.writeValueAsString(responseBody));
    }
}
