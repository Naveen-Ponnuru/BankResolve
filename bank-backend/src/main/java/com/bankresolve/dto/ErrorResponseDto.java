package com.bankresolve.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

/**
 * Standard error response DTO returned by GlobalExceptionHandler.
 */
@Getter
@Setter
@AllArgsConstructor
public class ErrorResponseDto {
    private int status;
    private String message;
    private String timestamp;
}
