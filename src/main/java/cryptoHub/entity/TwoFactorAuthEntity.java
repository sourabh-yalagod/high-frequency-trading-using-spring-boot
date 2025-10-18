package cryptoHub.entity;

import cryptoHub.types.CommunicationChannel;
import jakarta.persistence.*;
import lombok.*;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@ToString
@Builder
public class TwoFactorAuthEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    @Column(name = "is_verified")
    private boolean isVerified = false;

    @Enumerated(EnumType.STRING)
    @Column(name = "channel")
    private CommunicationChannel channel = CommunicationChannel.EMAIL;

    @OneToOne(mappedBy = "twoFactorAuthEntity")
    private UserEntity userEntity;
}
