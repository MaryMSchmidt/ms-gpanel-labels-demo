package com.maryschmidt.gpanel.labels.label;

import jakarta.validation.Valid;
import java.io.IOException;
import java.net.URI;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/labels")
public class LabelController {

    private final LabelService labelService;

    public LabelController(LabelService labelService) {
        this.labelService = labelService;
    }

    @GetMapping
    public List<LabelResponse> list() throws IOException {
        return labelService.list();
    }

    @GetMapping("/{id}")
    public LabelResponse get(@PathVariable String id) throws IOException {
        return labelService.get(id);
    }

    @PostMapping
    public ResponseEntity<LabelResponse> create(@Valid @RequestBody LabelRequest request) throws IOException {
        LabelResponse created = labelService.create(request);
        return ResponseEntity.created(URI.create("/api/labels/" + created.id())).body(created);
    }

    @PatchMapping("/{id}")
    public LabelResponse update(@PathVariable String id, @Valid @RequestBody LabelRequest request)
            throws IOException {
        return labelService.update(id, request);
    }
}
