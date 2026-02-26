package com.bankresolve.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

/**
 * Standard JSON envelope for all API responses.
 */
@Getter
@Setter
@AllArgsConstructor
public class ResponseDto {
    private String status;
    private String message;
}
