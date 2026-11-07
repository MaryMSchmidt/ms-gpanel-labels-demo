package com.maryschmidt.gpanel.labels.error;

import com.google.api.client.googleapis.json.GoogleJsonError;
import com.google.api.client.googleapis.json.GoogleJsonResponseException;
import java.io.IOException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class ApiExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(ApiExceptionHandler.class);

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ProblemDetail handleInvalidRequest(MethodArgumentNotValidException e) {
        String message = e.getBindingResult().getFieldErrors().stream()
                .findFirst()
                .map(FieldError::getDefaultMessage)
                .orElse("Invalid request.");
        return ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, message);
    }

    @ExceptionHandler(GoogleJsonResponseException.class)
    public ProblemDetail handleGmailError(GoogleJsonResponseException e) {
        return switch (e.getStatusCode()) {
            case 400 -> ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, gmailMessage(e));
            case 404 -> ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, "Label not found.");
            case 409 -> ProblemDetail.forStatusAndDetail(
                    HttpStatus.CONFLICT, "A label with this name already exists.");
            default -> gmailFailed(e);
        };
    }

    @ExceptionHandler(IOException.class)
    public ProblemDetail handleGmailUnreachable(IOException e) {
        return gmailFailed(e);
    }

    private ProblemDetail gmailFailed(IOException e) {
        log.warn("Gmail request failed", e);
        return ProblemDetail.forStatusAndDetail(HttpStatus.BAD_GATEWAY, "Gmail request failed. Try again.");
    }

    private static String gmailMessage(GoogleJsonResponseException e) {
        GoogleJsonError details = e.getDetails();
        return details != null && details.getMessage() != null ? details.getMessage() : "Gmail rejected the request.";
    }
}
