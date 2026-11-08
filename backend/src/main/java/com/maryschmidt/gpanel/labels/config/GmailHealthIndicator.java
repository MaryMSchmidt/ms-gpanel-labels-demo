package com.maryschmidt.gpanel.labels.config;

import com.google.api.services.gmail.Gmail;
import org.springframework.boot.health.contributor.AbstractHealthIndicator;
import org.springframework.boot.health.contributor.Health;
import org.springframework.stereotype.Component;

// Reports "gmail" as DOWN when Gmail can't be reached, such as after the saved sign-in expires.
@Component
public class GmailHealthIndicator extends AbstractHealthIndicator {

    private final Gmail gmail;

    public GmailHealthIndicator(Gmail gmail) {
        this.gmail = gmail;
    }

    @Override
    protected void doHealthCheck(Health.Builder builder) throws Exception {
        gmail.users().labels().list("me").execute();
        builder.up();
    }
}
