package com.bankresolve.service;

import com.bankresolve.dto.ContactRequestDto;
import com.bankresolve.dto.ContactResponseDto;

import java.util.List;
import jakarta.servlet.http.HttpServletRequest;

public interface ContactService {
    boolean saveContact(ContactRequestDto contactRequestDto, HttpServletRequest request);
    List<ContactResponseDto> getAllOpenMessages();
    List<ContactResponseDto> getContactsByBank(HttpServletRequest request);
    void updateMessageStatus(Long contactId, String status);
}
