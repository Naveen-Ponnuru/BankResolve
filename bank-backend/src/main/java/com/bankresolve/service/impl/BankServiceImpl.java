package com.bankresolve.service.impl;

import com.bankresolve.dto.BankDto;
import com.bankresolve.repository.BankRepository;
import com.bankresolve.service.BankService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BankServiceImpl implements BankService {

    private final BankRepository bankRepository;

    @Override
    @Transactional(readOnly = true)
    public List<BankDto> getAllBanks() {
        return bankRepository.findAll().stream()
                .map(bank -> BankDto.builder()
                        .id(bank.getId())
                        .name(bank.getName())
                        .code(bank.getCode())
                        .build())
                .collect(Collectors.toList());
    }
}
