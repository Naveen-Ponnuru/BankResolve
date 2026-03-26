package com.bankresolve.repository;

import com.bankresolve.entity.Bank;
import com.bankresolve.entity.BankFeature;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BankFeatureRepository extends JpaRepository<BankFeature, Long> {
    List<BankFeature> findByBank(Bank bank);
}
