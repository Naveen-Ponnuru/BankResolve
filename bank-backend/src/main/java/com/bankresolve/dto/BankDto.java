package com.bankresolve.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for bank list (used on the registration page dropdown).
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class BankDto {
    private Long id;
    private String name;
    private String code;
}
