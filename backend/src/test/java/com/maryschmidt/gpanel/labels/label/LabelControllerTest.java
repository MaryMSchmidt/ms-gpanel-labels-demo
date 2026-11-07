package com.maryschmidt.gpanel.labels.label;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.google.api.client.googleapis.json.GoogleJsonResponseException;
import com.google.api.client.http.HttpHeaders;
import com.google.api.client.http.HttpResponseException;
import java.io.IOException;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(LabelController.class)
class LabelControllerTest {

    private static final LabelResponse RECEIPTS =
            new LabelResponse("Label_1", "Receipts", "user", "show", "labelShow");

    @Autowired
    MockMvc mockMvc;

    @MockitoBean
    LabelService labelService;

    @Test
    void listReturnsLabels() throws Exception {
        when(labelService.list()).thenReturn(List.of(
                new LabelResponse("INBOX", "INBOX", "system", null, null),
                RECEIPTS));

        mockMvc.perform(get("/api/labels"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[1].id").value("Label_1"))
                .andExpect(jsonPath("$[1].name").value("Receipts"))
                .andExpect(jsonPath("$[1].type").value("user"));
    }

    @Test
    void listReturns502WhenGmailFails() throws Exception {
        when(labelService.list()).thenThrow(new IOException("connection reset"));

        mockMvc.perform(get("/api/labels"))
                .andExpect(status().isBadGateway())
                .andExpect(jsonPath("$.detail").value("Gmail request failed. Try again."));
    }

    @Test
    void getReturnsLabel() throws Exception {
        when(labelService.get("Label_1")).thenReturn(RECEIPTS);

        mockMvc.perform(get("/api/labels/Label_1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("Label_1"))
                .andExpect(jsonPath("$.name").value("Receipts"));
    }

    @Test
    void getReturns404WhenLabelDoesNotExist() throws Exception {
        when(labelService.get("Label_999")).thenThrow(gmailError(404));

        mockMvc.perform(get("/api/labels/Label_999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.detail").value("Label not found."));
    }

    private static GoogleJsonResponseException gmailError(int status) {
        return new GoogleJsonResponseException(
                new HttpResponseException.Builder(status, null, new HttpHeaders()), null);
    }
}
