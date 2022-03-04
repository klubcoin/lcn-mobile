import { RNKeycloak } from '@react-keycloak/native';
import BuildVariant from "./app/variants/BuildVariant"

// Setup Keycloak instance as needed
// Pass initialization options as required
const keycloak = new RNKeycloak({
  url: BuildVariant.activeVariant().keycloakUrl,
  realm: 'meveo',
  clientId: 'account',
});

export default keycloak;