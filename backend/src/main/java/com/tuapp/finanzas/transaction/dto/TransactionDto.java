package com.tuapp.finanzas.transaction.dto;

import lombok.*;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TransactionDto {
    private Long id;
    private BigDecimal amount;
    private String description;
    private Long categoryId;
    private Long userId;
}
