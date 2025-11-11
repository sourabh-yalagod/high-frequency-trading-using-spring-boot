package cryptoHub.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fasterxml.jackson.annotation.JsonProperty;
import cryptoHub.types.RolesEnum;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "users")
@Getter
@Setter
@Builder
public class UserEntity implements UserDetails {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    private String username;

    @Column(nullable = false)
    private String email;

    @Column(name = "refresh_token", columnDefinition = "TEXT")
    private String refreshToken;

    private Double amount = 0.0;

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

    @OneToMany(mappedBy = "user")
    @JsonIgnore
    private List<PaymentEntity> payments = new ArrayList<>();
}
