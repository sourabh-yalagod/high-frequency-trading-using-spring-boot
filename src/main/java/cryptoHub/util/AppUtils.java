package cryptoHub.util;

import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

public class AppUtils {
    public static String getAttribute(String registrationId) {
        String nameAttributeKey = "sub";
        if ("github".equals(registrationId)) {
            nameAttributeKey = "login";
        } else if ("google".equals(registrationId)) {
            nameAttributeKey = "sub";
        } else if ("facebook".equals(registrationId)) {
            nameAttributeKey = "id";
        } else if ("linkedin".equals(registrationId)) {
            nameAttributeKey = "id";
        }
        return nameAttributeKey;
    }
    public static String fetchGithubPrimaryEmail(OAuth2UserRequest userRequest, RestTemplate restTemplate) {
        try {
            String emailEndpoint = "https://api.github.com/user/emails";
            HttpHeaders headers = new HttpHeaders();
            headers.add(HttpHeaders.AUTHORIZATION, "token " + userRequest.getAccessToken().getTokenValue());

            HttpEntity<String> entity = new HttpEntity<>(headers);
            ResponseEntity<List<Map<String, Object>>> response = restTemplate.exchange(
                    emailEndpoint,
                    HttpMethod.GET,
                    entity,
                    new ParameterizedTypeReference<>() {
                    }
            );

            if (response.getBody() != null) {
                for (Map<String, Object> emailEntry : response.getBody()) {
                    Boolean primary = (Boolean) emailEntry.get("primary");
                    Boolean verified = (Boolean) emailEntry.get("verified");
                    if (Boolean.TRUE.equals(primary) && Boolean.TRUE.equals(verified)) {
                        return (String) emailEntry.get("email");
                    }
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }
}
