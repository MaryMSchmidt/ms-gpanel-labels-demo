package com.maryschmidt.gpanel.labels.label;

import com.google.api.services.gmail.Gmail;
import com.google.api.services.gmail.model.Label;
import java.io.IOException;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class LabelService {

    private static final String CURRENT_USER = "me";

    private final Gmail gmail;

    public LabelService(Gmail gmail) {
        this.gmail = gmail;
    }

    public List<LabelResponse> list() throws IOException {
        List<Label> labels = gmail.users().labels().list(CURRENT_USER).execute().getLabels();
        if (labels == null) {
            return List.of();
        }
        return labels.stream().map(LabelResponse::from).toList();
    }

    public LabelResponse get(String id) throws IOException {
        return LabelResponse.from(gmail.users().labels().get(CURRENT_USER, id).execute());
    }

    public LabelResponse create(LabelRequest request) throws IOException {
        // The Java client requires both visibility fields; these are Gmail's defaults.
        Label label = new Label()
                .setName(request.name().trim())
                .setLabelListVisibility("labelShow")
                .setMessageListVisibility("show");
        return LabelResponse.from(gmail.users().labels().create(CURRENT_USER, label).execute());
    }

    public LabelResponse update(String id, LabelRequest request) throws IOException {
        Label changes = new Label().setName(request.name().trim());
        return LabelResponse.from(gmail.users().labels().patch(CURRENT_USER, id, changes).execute());
    }

    public void delete(String id) throws IOException {
        gmail.users().labels().delete(CURRENT_USER, id).execute();
    }
}
