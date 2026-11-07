package com.maryschmidt.gpanel.labels.label;

import com.google.api.services.gmail.model.Label;

public record LabelResponse(
        String id,
        String name,
        String type,
        String messageListVisibility,
        String labelListVisibility) {

    public static LabelResponse from(Label label) {
        return new LabelResponse(
                label.getId(),
                label.getName(),
                label.getType(),
                label.getMessageListVisibility(),
                label.getLabelListVisibility());
    }
}
