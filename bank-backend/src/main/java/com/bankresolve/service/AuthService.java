package com.bankresolve.service;

import com.bankresolve.dto.AuthResponseDto;
import com.bankresolve.dto.LoginRequestDto;
import com.bankresolve.dto.RegisterRequestDto;

public interface AuthService {
    AuthResponseDto register(RegisterRequestDto request);
    AuthResponseDto login(LoginRequestDto request);
}
