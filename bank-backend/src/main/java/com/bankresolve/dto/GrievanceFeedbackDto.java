package com.bankresolve.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class GrievanceFeedbackDto {
    @Min(1) @Max(5)
    private Integer rating;
    
    @NotBlank(message = "Feedback comment is required")
    private String comment;
}
