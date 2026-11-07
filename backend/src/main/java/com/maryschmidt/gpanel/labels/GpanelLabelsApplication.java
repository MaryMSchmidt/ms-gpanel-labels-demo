package com.maryschmidt.gpanel.labels;

import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.builder.SpringApplicationBuilder;

@SpringBootApplication
public class GpanelLabelsApplication {

	public static void main(String[] args) {
		// Not headless, so the Google sign-in page can open in the default browser.
		new SpringApplicationBuilder(GpanelLabelsApplication.class).headless(false).run(args);
	}

}
