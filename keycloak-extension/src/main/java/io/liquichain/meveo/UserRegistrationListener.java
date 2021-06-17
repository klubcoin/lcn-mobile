package io.liquichain.meveo;

import org.jboss.logging.Logger;
import org.keycloak.email.EmailException;
import org.keycloak.events.Event;
import org.keycloak.events.EventListenerProvider;
import org.keycloak.events.admin.AdminEvent;
import org.keycloak.events.admin.OperationType;
import org.keycloak.events.admin.ResourceType;
import org.keycloak.models.KeycloakSession;
import org.keycloak.models.RealmModel;
import org.keycloak.models.RealmProvider;
import org.keycloak.models.UserModel;

/**
 * Hello world!
 *
 */
public class UserRegistrationListener implements EventListenerProvider {

	private static final Logger log = Logger.getLogger(UserRegistrationListener.class);

	private final KeycloakSession session;
	private final RealmProvider model;

	public UserRegistrationListener(KeycloakSession session) {
		this.session = session;
		this.model = session.realms();
	}

	@Override
	public void close() {
		// TODO Auto-generated method stub

	}

	@Override
	public void onEvent(Event event) {
		RealmModel realm = this.model.getRealm(event.getRealmId());
		UserModel user = this.session.users().getUserById(event.getUserId(), realm);
		if (event.getDetails().keySet().contains("register_method")) {
			log.info("----------------------------------------------------------");
			event.getDetails().forEach((key, value) -> log.info(key + ": " + value));
			if (user != null && user.getEmail() != null) {
				log.info("Sending welcome e-mail to -> " + user.getEmail());

				org.keycloak.email.DefaultEmailSenderProvider senderProvider = new org.keycloak.email.DefaultEmailSenderProvider(session);
				try {

					String emailSubject = "Welcome to Liquichain!";
					String emailContent = "Welcome to Liquichain!<br><br><br>"
							+ "For starters, download our apps available through <a href=\"https://www.apple.com/app-store/\">App Store</a> and <a href=\"https://play.google.com/store\">Google Play!</a></br>";
					senderProvider.send(session.getContext().getRealm().getSmtpConfig(), user, emailSubject, "body", emailContent);
				} catch (EmailException e) {
					e.printStackTrace();
				}
			}
			log.info("----------------------------------------------------------");
		}

	}

	@Override
	public void onEvent(AdminEvent adminEvent, boolean includeRepresentation) {
	}

}
