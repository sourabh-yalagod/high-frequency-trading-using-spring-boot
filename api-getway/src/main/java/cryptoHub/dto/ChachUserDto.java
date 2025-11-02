package cryptoHub.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
public class ChachUserDto {
    private String userId;
    private Double amount;
    private Boolean isLocked = false;
    private String email;
}
