package com.tuapp.finanzas.budget.dto;

import lombok.*;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BudgetDto {
    private Long id;
    private String name;
    private BigDecimal limitAmount;
}
