package cryptoHub.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TwoFactorOtpEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @OneToOne
    private UserEntity user;

    private String otp;

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String jwtToken;

}
