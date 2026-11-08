package com.maryschmidt.gpanel.labels.config;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import com.google.api.services.gmail.Gmail;
import com.google.api.services.gmail.model.ListLabelsResponse;
import java.io.IOException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Answers;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.boot.health.contributor.Status;

@ExtendWith(MockitoExtension.class)
class GmailHealthIndicatorTest {

    @Mock(answer = Answers.RETURNS_DEEP_STUBS)
    Gmail gmail;

    @Test
    void upWhenGmailAnswers() throws Exception {
        when(gmail.users().labels().list("me").execute()).thenReturn(new ListLabelsResponse());

        assertThat(new GmailHealthIndicator(gmail).health().getStatus()).isEqualTo(Status.UP);
    }

    @Test
    void downWhenGmailFails() throws Exception {
        when(gmail.users().labels().list("me").execute()).thenThrow(new IOException("token expired"));

        assertThat(new GmailHealthIndicator(gmail).health().getStatus()).isEqualTo(Status.DOWN);
    }
}
