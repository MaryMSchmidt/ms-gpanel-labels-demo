package com.maryschmidt.gpanel.labels;

import com.google.api.services.gmail.Gmail;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

@SpringBootTest
class GpanelLabelsApplicationTests {

	// Replaces the real client so tests never sign in to Google.
	@MockitoBean
	Gmail gmail;

	@Test
	void contextLoads() {
	}

}
