package com.maryschmidt.gpanel.labels.config;

import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.nio.file.Path;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

class GmailConfigTest {

    private final GmailConfig config = new GmailConfig();

    @Test
    void failsClearlyWhenPathIsNotSet() {
        assertThatThrownBy(() -> config.gmail(""))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("GMAIL_CREDENTIALS_PATH is not set");
    }

    @Test
    void failsClearlyWhenFileDoesNotExist(@TempDir Path dir) {
        String missingFile = dir.resolve("credentials.json").toString();

        assertThatThrownBy(() -> config.gmail(missingFile))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Cannot read credentials file");
    }
}
