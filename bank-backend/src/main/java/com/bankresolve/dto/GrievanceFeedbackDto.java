package com.bankresolve.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class GrievanceFeedbackDto {
    @NotNull(message = "Rating is required")
    @Min(1) @Max(5)
    private Integer rating;
    
    @NotBlank(message = "Feedback comment is required")
    private String comment;
}
