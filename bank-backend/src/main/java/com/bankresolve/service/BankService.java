package com.bankresolve.service;

import com.bankresolve.dto.BankDto;

import java.util.List;

/**
 * Service for bank-related operations (public, no auth required).
 */
public interface BankService {

    /**
     * Returns all registered banks — used by the registration dropdown.
     */
    List<BankDto> getAllBanks();
}
