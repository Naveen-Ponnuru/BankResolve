package com.bankresolve.controller;

import com.bankresolve.dto.ContactRequestDto;
import com.bankresolve.service.ContactService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import com.bankresolve.dto.ContactResponseDto;

@RestController
@RequestMapping("/api/contacts")
@RequiredArgsConstructor
public class ContactController {

    private final ContactService contactService;

    @PostMapping
    public ResponseEntity<String> saveContact(
            @Valid @RequestBody ContactRequestDto contactRequestDto,
            HttpServletRequest request) {
        contactService.saveContact(contactRequestDto, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body("Request processed successfully");
    }

    @GetMapping("/bank")
    public ResponseEntity<List<ContactResponseDto>> getContactsByBank(HttpServletRequest request) {
        return ResponseEntity.ok(contactService.getContactsByBank(request));
    }

}
