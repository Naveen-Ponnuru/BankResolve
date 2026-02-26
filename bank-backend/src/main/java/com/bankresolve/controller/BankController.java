package com.bankresolve.controller;

import com.bankresolve.dto.BankDto;
import com.bankresolve.service.BankService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Public bank listing endpoint — no authentication required.
 * Used by the React registration page to populate the bank dropdown.
 */
@RestController
@RequestMapping("/api/banks")
@RequiredArgsConstructor
@Tag(name = "Banks", description = "Public bank listing endpoint")
public class BankController {

    private final BankService bankService;

    @GetMapping
    @Operation(summary = "List all banks",
               description = "Returns all registered banks. Public — no JWT required. Used for registration dropdown.")
    public ResponseEntity<List<BankDto>> getAllBanks() {
        return ResponseEntity.ok(bankService.getAllBanks());
    }
}
