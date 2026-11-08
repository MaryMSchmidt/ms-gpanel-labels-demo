package com.maryschmidt.gpanel.labels.label;

import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.google.api.client.googleapis.json.GoogleJsonError;
import com.google.api.client.googleapis.json.GoogleJsonResponseException;
import com.google.api.client.http.HttpHeaders;
import com.google.api.client.http.HttpResponseException;
import java.io.IOException;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
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
    void gmailRateLimitReturns429() throws Exception {
        when(labelService.list()).thenThrow(gmailError(429));

        mockMvc.perform(get("/api/labels"))
                .andExpect(status().isTooManyRequests())
                .andExpect(jsonPath("$.detail").value("Gmail is busy. Try again in a moment."));
    }

    @Test
    void otherGmailErrorsReturn502() throws Exception {
        when(labelService.list()).thenThrow(gmailError(403));

        mockMvc.perform(get("/api/labels"))
                .andExpect(status().isBadGateway())
                .andExpect(jsonPath("$.detail").value("Gmail request failed. Try again."));
    }

    @Test
    void gmail400WithoutMessageUsesFallback() throws Exception {
        when(labelService.get("bad-id")).thenThrow(gmailError(400));

        mockMvc.perform(get("/api/labels/bad-id"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("Gmail rejected the request."));
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

    @Test
    void createReturns201WithLocation() throws Exception {
        when(labelService.create(new LabelRequest("Receipts"))).thenReturn(RECEIPTS);

        mockMvc.perform(post("/api/labels").contentType(MediaType.APPLICATION_JSON).content("{\"name\":\"Receipts\"}"))
                .andExpect(status().isCreated())
                .andExpect(header().string("Location", "/api/labels/Label_1"))
                .andExpect(jsonPath("$.name").value("Receipts"));
    }

    @Test
    void createReturns400WhenNameIsBlank() throws Exception {
        mockMvc.perform(post("/api/labels").contentType(MediaType.APPLICATION_JSON).content("{\"name\":\"  \"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("Name is required."));

        verifyNoInteractions(labelService);
    }

    @Test
    void createReturns409WhenNameExists() throws Exception {
        when(labelService.create(new LabelRequest("Receipts"))).thenThrow(gmailError(409));

        mockMvc.perform(post("/api/labels").contentType(MediaType.APPLICATION_JSON).content("{\"name\":\"Receipts\"}"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.detail").value("A label with this name already exists."));
    }

    @Test
    void updateReturnsRenamedLabel() throws Exception {
        when(labelService.update("Label_1", new LabelRequest("Bills")))
                .thenReturn(new LabelResponse("Label_1", "Bills", "user", "show", "labelShow"));

        mockMvc.perform(patch("/api/labels/Label_1").contentType(MediaType.APPLICATION_JSON).content("{\"name\":\"Bills\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Bills"));
    }

    @Test
    void updateReturns400WhenNameIsBlank() throws Exception {
        mockMvc.perform(patch("/api/labels/Label_1").contentType(MediaType.APPLICATION_JSON).content("{\"name\":\"\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("Name is required."));

        verifyNoInteractions(labelService);
    }

    @Test
    void updateReturns404WhenLabelDoesNotExist() throws Exception {
        when(labelService.update("Label_999", new LabelRequest("Bills"))).thenThrow(gmailError(404));

        mockMvc.perform(patch("/api/labels/Label_999").contentType(MediaType.APPLICATION_JSON).content("{\"name\":\"Bills\"}"))
                .andExpect(status().isNotFound());
    }

    @Test
    void updateReturns400WithGmailMessageForSystemLabel() throws Exception {
        when(labelService.update("INBOX", new LabelRequest("Bills")))
                .thenThrow(gmailError(400, "Cannot update system label names"));

        mockMvc.perform(patch("/api/labels/INBOX").contentType(MediaType.APPLICATION_JSON).content("{\"name\":\"Bills\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("Cannot update system label names"));
    }

    @Test
    void updateReturns409WhenNameExists() throws Exception {
        when(labelService.update("Label_1", new LabelRequest("Receipts"))).thenThrow(gmailError(409));

        mockMvc.perform(patch("/api/labels/Label_1").contentType(MediaType.APPLICATION_JSON).content("{\"name\":\"Receipts\"}"))
                .andExpect(status().isConflict());
    }

    @Test
    void deleteReturns204() throws Exception {
        mockMvc.perform(delete("/api/labels/Label_1"))
                .andExpect(status().isNoContent());

        verify(labelService).delete("Label_1");
    }

    @Test
    void deleteReturns404WhenLabelDoesNotExist() throws Exception {
        doThrow(gmailError(404)).when(labelService).delete("Label_999");

        mockMvc.perform(delete("/api/labels/Label_999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.detail").value("Label not found."));
    }

    @Test
    void deleteReturns400WithGmailMessageForSystemLabel() throws Exception {
        doThrow(gmailError(400, "Invalid delete request")).when(labelService).delete("INBOX");

        mockMvc.perform(delete("/api/labels/INBOX"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("Invalid delete request"));
    }

    private static GoogleJsonResponseException gmailError(int status) {
        return gmailError(status, null);
    }

    private static GoogleJsonResponseException gmailError(int status, String message) {
        GoogleJsonError details = null;
        if (message != null) {
            details = new GoogleJsonError();
            details.setMessage(message);
        }
        return new GoogleJsonResponseException(
                new HttpResponseException.Builder(status, null, new HttpHeaders()), details);
    }
}
