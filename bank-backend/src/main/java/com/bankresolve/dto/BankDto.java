package com.bankresolve.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for bank list (used on the registration page dropdown).
 */
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class BankDto {
    private Long id;
    private String name;
    private String code;
    private String themeColor;
    private String tagline;
    private List<FeatureDto> features;

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class FeatureDto {
        private String title;
        private String description;
        private String iconName;
    }
}
