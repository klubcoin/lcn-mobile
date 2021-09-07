import { RNKeycloak } from '@react-keycloak/native';

// Setup Keycloak instance as needed
// Pass initialization options as required
const keycloak = new RNKeycloak({
  url: 'https://account.liquichain.io/auth',
  realm: 'meveo',
  clientId: 'account',
});

export default keycloak;