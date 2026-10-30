package edu.bsit.garcia.exception;

/** Signals missing, expired, or invalid authentication. */
public class AuthException extends RuntimeException {
    public AuthException(String message) { super(message); }
}
