package com.maryschmidt.gpanel.labels.error;

import com.google.api.client.googleapis.json.GoogleJsonResponseException;
import java.io.IOException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class ApiExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(ApiExceptionHandler.class);

    @ExceptionHandler(GoogleJsonResponseException.class)
    public ProblemDetail handleGmailError(GoogleJsonResponseException e) {
        if (e.getStatusCode() == HttpStatus.NOT_FOUND.value()) {
            return ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, "Label not found.");
        }
        return gmailFailed(e);
    }

    @ExceptionHandler(IOException.class)
    public ProblemDetail handleGmailUnreachable(IOException e) {
        return gmailFailed(e);
    }

    private ProblemDetail gmailFailed(IOException e) {
        log.warn("Gmail request failed", e);
        return ProblemDetail.forStatusAndDetail(HttpStatus.BAD_GATEWAY, "Gmail request failed. Try again.");
    }
}
