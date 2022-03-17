import { RNKeycloak } from '@react-keycloak/native';
import Config from 'react-native-config';

// Setup Keycloak instance as needed
// Pass initialization options as required
const keycloak = new RNKeycloak({
  url: Config.KEYCLOAK_URL,
  realm: 'meveo',
  clientId: 'account',
});

export default keycloak;