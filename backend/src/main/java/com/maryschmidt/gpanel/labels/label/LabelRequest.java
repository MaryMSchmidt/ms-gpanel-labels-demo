package com.maryschmidt.gpanel.labels.label;

import jakarta.validation.constraints.NotBlank;

public record LabelRequest(@NotBlank(message = "Name is required.") String name) {
}
