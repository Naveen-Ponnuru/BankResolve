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
    private final com.bankresolve.repository.BankFeatureRepository bankFeatureRepository;

    @Override
    @Transactional(readOnly = true)
    public List<BankDto> getAllBanks() {
        return bankRepository.findAll().stream()
                .map(bank -> {
                    List<BankDto.FeatureDto> featureDtos = bankFeatureRepository.findByBank(bank).stream()
                            .map(feature -> BankDto.FeatureDto.builder()
                                    .title(feature.getTitle())
                                    .description(feature.getDescription())
                                    .iconName(feature.getIconName())
                                    .build())
                            .collect(Collectors.toList());

                    return BankDto.builder()
                            .id(bank.getId())
                            .name(bank.getName())
                            .code(bank.getCode())
                            .themeColor(bank.getThemeColor())
                            .tagline(bank.getTagline())
                            .features(featureDtos)
                            .build();
                })
                .collect(Collectors.toList());
    }
}
