# Installing the new user registartion e-mail module

## Configure the Email settings of Keycloak
1. Login to Keycloak Admin Console
2. On the left side of the page under `Configure`, click `Realm Settings`
3. Select `Email` tab
4. Configure the settings based on the needed settings

## Upload the jar file to the keycloak container
1. Compile source code
2. Copy generated jar file to any directory of keycloak docker image (e.g. /home)

	`docker cp keycloak-extension-1.0-SNAPSHOT.jar keycloak:/home`

## Installing the module to the keycloak jboss
1. Access keycloak container cli 

2. Execute the following commands

	//go to the stated directory
	`cd /opt/jboss/keycloak/bin`
	
	//start the jboss cli
	`./jboss-cli.sh`
	
	`connect`
	
	`module add --name=io.liquichain.meveo.user-creation-listener --resources=/home/keycloak-extension-1.0-SNAPSHOT.jar --dependencies=org.keycloak.keycloak-core,org.keycloak.keycloak-server-spi,org.keycloak.keycloak-server-spi-private,org.keycloak.keycloak-services,org.jboss.logging`

	`/subsystem=keycloak-server:list-add(name=providers, value=module:io.liquichain.meveo.user-creation-listener)`
	
	//an outcome success message should show
	
	//exit jboss cli
	`exit`
	
	//exit container cli
	`exit`

3. restart keycloak container/image

## Enabling the event listener in keycloak console
1. Login to keycloak admin console
2. On the left side of the page under `Manage`, click `Events`
4. Select `Config` tab
5. on the Event Listeners textbox `user_creation_listener` should be available
6. Click it, then Save

## Testing the user creation event listener
1. Create a user on meveo/liquichain
2. After redirecting to another page, the registered e-mail should receive a `Welcome to Liquichain!` e-mail.