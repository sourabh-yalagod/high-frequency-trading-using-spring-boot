package cryptoHub.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import cryptoHub.types.RolesEnum;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "users")
@Getter
@Setter
@ToString
@Builder
public class UserEntity implements UserDetails {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "username")
    private String username;

    private String email;

    private String refreshToken;

    @JsonProperty(access = JsonProperty.Access.READ_WRITE)
    private String password;

    @Enumerated(EnumType.STRING)
    private RolesEnum role = RolesEnum.USER;

    @JoinColumn(name = "two_factor_authentication")
    @OneToOne(cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private TwoFactorAuthEntity twoFactorAuthEntity = new TwoFactorAuthEntity();

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of();
    }
}
