package com.bankresolve.service;

import com.bankresolve.dto.PublicStatsDto;

public interface PublicService {
    PublicStatsDto getPublicStats(Long bankId);
}
