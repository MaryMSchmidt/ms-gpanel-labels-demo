package com.maryschmidt.gpanel.labels.label;

import java.io.IOException;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
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
}
