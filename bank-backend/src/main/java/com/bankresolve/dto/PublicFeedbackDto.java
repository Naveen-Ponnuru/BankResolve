package com.bankresolve.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PublicFeedbackDto {
    private String customerName; // Can be masked for privacy (e.g. R*** K***)
    private Integer rating;
    private String comment;
    private String timestamp;
}
