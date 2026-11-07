package com.maryschmidt.gpanel.labels.label;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(LabelController.class)
class LabelControllerTest {

    @Autowired
    MockMvc mockMvc;

    @MockitoBean
    LabelService labelService;

    @Test
    void listReturnsLabels() throws Exception {
        when(labelService.list()).thenReturn(List.of(
                new LabelResponse("INBOX", "INBOX", "system", null, null),
                new LabelResponse("Label_1", "Receipts", "user", "show", "labelShow")));

        mockMvc.perform(get("/api/labels"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[1].id").value("Label_1"))
                .andExpect(jsonPath("$[1].name").value("Receipts"))
                .andExpect(jsonPath("$[1].type").value("user"));
    }
}
