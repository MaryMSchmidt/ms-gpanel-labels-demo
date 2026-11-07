package com.maryschmidt.gpanel.labels.config;

import com.google.api.client.auth.oauth2.Credential;
import com.google.api.client.extensions.java6.auth.oauth2.AuthorizationCodeInstalledApp;
import com.google.api.client.extensions.jetty.auth.oauth2.LocalServerReceiver;
import com.google.api.client.googleapis.auth.oauth2.GoogleAuthorizationCodeFlow;
import com.google.api.client.googleapis.auth.oauth2.GoogleClientSecrets;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.JsonFactory;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.client.util.store.FileDataStoreFactory;
import com.google.api.services.gmail.Gmail;
import com.google.api.services.gmail.GmailScopes;
import java.io.IOException;
import java.io.Reader;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.GeneralSecurityException;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class GmailConfig {

    private static final String APPLICATION_NAME = "gpanel-labels";
    private static final List<String> SCOPES = List.of(GmailScopes.GMAIL_LABELS);
    private static final Path TOKENS_DIR = Path.of("tokens");
    private static final int CALLBACK_PORT = 8888;

    @Bean
    public Gmail gmail(@Value("${gmail.credentials-path}") String credentialsPath)
            throws IOException, GeneralSecurityException {
        Path credentialsFile = requireCredentialsFile(credentialsPath);
        NetHttpTransport transport = GoogleNetHttpTransport.newTrustedTransport();
        JsonFactory jsonFactory = GsonFactory.getDefaultInstance();

        GoogleClientSecrets clientSecrets;
        try (Reader reader = Files.newBufferedReader(credentialsFile)) {
            clientSecrets = GoogleClientSecrets.load(jsonFactory, reader);
        }

        GoogleAuthorizationCodeFlow flow = new GoogleAuthorizationCodeFlow.Builder(
                transport, jsonFactory, clientSecrets, SCOPES)
                .setDataStoreFactory(new FileDataStoreFactory(TOKENS_DIR.toFile()))
                .setAccessType("offline")
                .build();
        LocalServerReceiver receiver = new LocalServerReceiver.Builder().setPort(CALLBACK_PORT).build();
        Credential credential = new AuthorizationCodeInstalledApp(flow, receiver).authorize("user");

        return new Gmail.Builder(transport, jsonFactory, credential)
                .setApplicationName(APPLICATION_NAME)
                .build();
    }

    private static Path requireCredentialsFile(String credentialsPath) {
        if (credentialsPath == null || credentialsPath.isBlank()) {
            throw new IllegalStateException(
                    "GMAIL_CREDENTIALS_PATH is not set. Set it to the full path of your credentials.json file.");
        }
        Path file = Path.of(credentialsPath);
        if (!Files.isReadable(file)) {
            throw new IllegalStateException(
                    "Cannot read credentials file at " + file + ". Check GMAIL_CREDENTIALS_PATH.");
        }
        return file;
    }
}
