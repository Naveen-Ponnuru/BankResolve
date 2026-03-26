package com.bankresolve.service.impl;

import com.bankresolve.dto.ContactRequestDto;
import com.bankresolve.dto.ContactResponseDto;
import com.bankresolve.entity.Contact;
import com.bankresolve.exception.ResourceNotFoundException;
import com.bankresolve.repository.ContactRepository;
import com.bankresolve.service.ContactService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

import com.bankresolve.entity.Bank;
import com.bankresolve.repository.BankRepository;
import com.bankresolve.security.BankContextUtil;
import jakarta.servlet.http.HttpServletRequest;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ContactServiceImpl implements ContactService {

    private final ContactRepository contactRepository;
    private final BankRepository bankRepository;
    private final BankContextUtil bankContextUtil;

    @Override
    public boolean saveContact(ContactRequestDto contactRequestDto, HttpServletRequest request) {
        Contact contact = transformToEntity(contactRequestDto);

        // Deriving bank context via BankContextUtil if authenticated
        try {
            Long bankId = bankContextUtil.getCurrentBankId();
            if (bankId != null) {
                Bank bank = bankRepository.findById(bankId)
                        .orElseThrow(() -> new ResourceNotFoundException("Bank", "id", bankId));
                contact.setBank(bank);
            }
        } catch (Exception e) {
            // Anonymous or non-bank user; proceed without specific bank mapping
        }

        contactRepository.save(contact);
        return true;
    }

    @Override
    public List<ContactResponseDto> getContactsByBank(HttpServletRequest request) {
        Long bankId = bankContextUtil.getCurrentBankId();
        return contactRepository.findByBankId(bankId)
                .stream()
                .map(this::mapToContactResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<ContactResponseDto> getAllOpenMessages() {
        List<Contact> contacts = contactRepository.findByStatus("OPEN_MESSAGE");
        return contacts.stream().map(this::mapToContactResponseDTO).collect(Collectors.toList());
    }

    @Override
    public void updateMessageStatus(Long contactId, String status) {
        Contact contact = contactRepository.findById(contactId).orElseThrow(
                () -> new ResourceNotFoundException("Contact", "ContactID", contactId.toString())
        );
        
        // IDOR Prevention: Ensure staff can only update messages for their bank
        if (contact.getBank() != null) {
            bankContextUtil.validateBankAccess(contact.getBank().getId());
        }
        
        contact.setStatus(status);
        contactRepository.save(contact);
    }

    private ContactResponseDto mapToContactResponseDTO(Contact contact) {
        return new ContactResponseDto(
                contact.getContactId(),
                contact.getName(),
                contact.getEmail(),
                contact.getMobileNumber(),
                contact.getMessage(),
                contact.getStatus()
        );
    }

    private Contact transformToEntity(ContactRequestDto contactRequestDto) {
        Contact contact = new Contact();
        BeanUtils.copyProperties(contactRequestDto, contact);
        contact.setStatus("OPEN_MESSAGE");
        return contact;
    }
}
