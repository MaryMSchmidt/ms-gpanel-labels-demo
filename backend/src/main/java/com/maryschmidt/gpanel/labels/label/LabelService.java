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
}
