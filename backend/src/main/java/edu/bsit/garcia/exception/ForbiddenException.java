package edu.bsit.garcia.exception;

/** Signals an authenticated user lacks the requested role. */
public class ForbiddenException extends RuntimeException {
    public ForbiddenException(String message) { super(message); }
}
