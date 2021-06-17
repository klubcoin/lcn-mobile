package io.liquichain.meveo;

import org.keycloak.Config;
import org.keycloak.events.EventListenerProviderFactory;
import org.keycloak.models.KeycloakSession;
import org.keycloak.models.KeycloakSessionFactory;

public class UserRegistrationListenerProviderFactory implements EventListenerProviderFactory {

	@Override
	public UserRegistrationListener create(KeycloakSession keycloakSession) {
		return new UserRegistrationListener(keycloakSession);
	}

	@Override
	public void init(Config.Scope scope) {
		//
	}

	@Override
	public void postInit(KeycloakSessionFactory keycloakSessionFactory) {
		//
	}

	@Override
	public void close() {
		//
	}

	@Override
	public String getId() {
		return "user_creation_listener";
	}

}
