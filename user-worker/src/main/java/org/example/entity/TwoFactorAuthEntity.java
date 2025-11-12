package org.example.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.example.entity.UserEntity;
import org.example.types.CommunicationChannel;

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

    @JsonIgnore
    @OneToOne(mappedBy = "twoFactorAuthEntity")
    private UserEntity user;

    private String otp;
}
