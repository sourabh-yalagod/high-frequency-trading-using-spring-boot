package cryptoHub.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class LoginResponseDto {
    private String id;
    private String accessToken;
    private String refreshToken;
}
