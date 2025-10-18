package cryptoHub.entity;

import cryptoHub.types.CommunicationChannel;
import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.*;

@Embeddable
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@ToString
public class TwoFactorAuthEntity {

    @Column(name = "is_verified")
    private boolean isVerified = false;

    @Enumerated(EnumType.STRING)
    @Column(name = "channel")
    private CommunicationChannel channel = CommunicationChannel.EMAIL;
}
