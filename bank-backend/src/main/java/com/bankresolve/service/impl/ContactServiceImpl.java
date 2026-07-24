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

import jakarta.servlet.http.HttpServletRequest;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ContactServiceImpl implements ContactService {

    private final ContactRepository contactRepository;

    @Override
    public boolean saveContact(ContactRequestDto contactRequestDto, HttpServletRequest request) {
        Contact contact = transformToEntity(contactRequestDto);
        contactRepository.save(contact);
        return true;
    }

    @Override
    public List<ContactResponseDto> getContactsByBank(HttpServletRequest request) {
        return getAllOpenMessages();
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

