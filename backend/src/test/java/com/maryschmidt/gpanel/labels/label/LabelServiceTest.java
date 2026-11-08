package com.maryschmidt.gpanel.labels.label;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.google.api.services.gmail.Gmail;
import com.google.api.services.gmail.model.Label;
import com.google.api.services.gmail.model.ListLabelsResponse;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Answers;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class LabelServiceTest {

    // Deep stubs let one mock answer the whole gmail.users().labels().x().execute() chain.
    @Mock(answer = Answers.RETURNS_DEEP_STUBS)
    Gmail gmail;

    private LabelService service() {
        return new LabelService(gmail);
    }

    private static Label receipts() {
        return new Label().setId("Label_1").setName("Receipts").setType("user")
                .setMessageListVisibility("show").setLabelListVisibility("labelShow");
    }

    @Test
    void listMapsGmailLabels() throws Exception {
        when(gmail.users().labels().list("me").execute())
                .thenReturn(new ListLabelsResponse().setLabels(List.of(receipts())));

        assertThat(service().list())
                .containsExactly(new LabelResponse("Label_1", "Receipts", "user", "show", "labelShow"));
    }

    @Test
    void listReturnsEmptyWhenGmailReturnsNoLabels() throws Exception {
        when(gmail.users().labels().list("me").execute()).thenReturn(new ListLabelsResponse());

        assertThat(service().list()).isEmpty();
    }

    @Test
    void getReturnsTheLabel() throws Exception {
        when(gmail.users().labels().get("me", "Label_1").execute()).thenReturn(receipts());

        assertThat(service().get("Label_1").name()).isEqualTo("Receipts");
    }

    @Test
    void createTrimsTheNameAndSetsDefaultVisibility() throws Exception {
        when(gmail.users().labels().create(eq("me"), any(Label.class)).execute()).thenReturn(receipts());

        service().create(new LabelRequest("  Receipts  "));

        ArgumentCaptor<Label> sent = ArgumentCaptor.forClass(Label.class);
        verify(gmail.users().labels()).create(eq("me"), sent.capture());
        assertThat(sent.getValue().getName()).isEqualTo("Receipts");
        assertThat(sent.getValue().getLabelListVisibility()).isEqualTo("labelShow");
        assertThat(sent.getValue().getMessageListVisibility()).isEqualTo("show");
    }

    @Test
    void updateSendsOnlyTheTrimmedName() throws Exception {
        when(gmail.users().labels().patch(eq("me"), eq("Label_1"), any(Label.class)).execute())
                .thenReturn(receipts());

        service().update("Label_1", new LabelRequest(" Bills "));

        ArgumentCaptor<Label> sent = ArgumentCaptor.forClass(Label.class);
        verify(gmail.users().labels()).patch(eq("me"), eq("Label_1"), sent.capture());
        assertThat(sent.getValue().getName()).isEqualTo("Bills");
        assertThat(sent.getValue().getLabelListVisibility()).isNull();
        assertThat(sent.getValue().getMessageListVisibility()).isNull();
    }

    @Test
    void deleteCallsGmail() throws Exception {
        service().delete("Label_1");

        verify(gmail.users().labels().delete("me", "Label_1")).execute();
    }
}
