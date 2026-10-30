package edu.bsit.garcia.exception;

/** Signals invalid client-supplied data that should be returned as HTTP 400. */
public class BadRequestException extends RuntimeException {
    public BadRequestException(String message) {
        super(message);
    }
}
