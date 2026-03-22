package com.bankresolve.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ContactResponseDto {
    private Long contactId;
    private String name;
    private String email;
    private String mobileNumber;
    private String message;
    private String status;
}
