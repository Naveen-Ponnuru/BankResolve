package com.bankresolve.repository;

import com.bankresolve.entity.Contact;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ContactRepository extends JpaRepository<Contact, Long> {
    List<Contact> findByStatus(String status);
    List<Contact> findByBankId(Long bankId);
}
