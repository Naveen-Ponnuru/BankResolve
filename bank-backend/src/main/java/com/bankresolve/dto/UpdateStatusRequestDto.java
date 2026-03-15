package com.bankresolve.dto;

import com.bankresolve.entity.enums.GrievanceStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * Request body for PUT /api/grievances/{id}/status
 */
@Data
public class UpdateStatusRequestDto {

    @NotNull(message = "Status is required")
    private GrievanceStatus status;
}
