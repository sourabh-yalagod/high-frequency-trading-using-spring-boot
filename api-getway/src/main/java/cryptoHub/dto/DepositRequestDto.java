package cryptoHub.dto;

import lombok.Data;

@Data
public class DepositRequestDto {
    private String name;
    private Long amount;
    private String userId;
    private String currency;
}
