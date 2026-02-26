package com.bankresolve.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Thrown when a user attempts to access a resource belonging to a different bank.
 */
@ResponseStatus(HttpStatus.FORBIDDEN)
public class BankMismatchException extends RuntimeException {

    public BankMismatchException() {
        super("Access denied: resource does not belong to your bank");
    }

    public BankMismatchException(String message) {
        super(message);
    }
}
