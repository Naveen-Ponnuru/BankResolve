package com.bankresolve.controller;

import com.bankresolve.dto.PublicStatsDto;
import com.bankresolve.service.PublicService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.http.CacheControl;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/public")
@RequiredArgsConstructor
@Tag(name = "Public Information", description = "Endpoints for public-facing data (no authentication required)")
public class PublicController {

    private final PublicService publicService;

    @GetMapping("/stats")
    @Operation(summary = "Get public statistics",
               description = "Returns aggregated public statistics (users, grievances resolved, recent feedback) for the application.")
    public ResponseEntity<PublicStatsDto> getPublicStats() {
        return ResponseEntity.ok()
                .cacheControl(CacheControl.noCache().mustRevalidate())
                .body(publicService.getPublicStats());
    }
}

