import React from 'react'
import { View } from 'react-native'
import { useKeycloak } from '@react-keycloak/native';
import StyledButton from '../../UI/StyledButton';
import preferences from '../../../store/preferences';

const styles = {
  container: {
    marginTop: 20,
    width: '100%',
  },
  button: {},
};

const LoginWithKeycloak = ({ label, type, onSuccess, onError }) => {
  const { keycloak } = useKeycloak();

  const handleLogin = () => {
    keycloak?.login(
      {
        prompt: 'login',
        redirectUri: 'liquichain://auth',
        clientSecret: '5ccd4a10-e42b-4af9-a609-25f8c0ca094b',
      }).then(() => {
        preferences.setKeycloakAccount(keycloak.tokenParsed);
        if (onSuccess) onSuccess(keycloak.tokenParsed);
      })
      .catch((error) => {
        if (onError) onError(error);
      })
  };

  return (
    <View style={styles.container}>
      <StyledButton
        style={styles.button}
        type={type || 'normal'}
        onPress={handleLogin}
      >{label || ''}</StyledButton>
    </View>
  );
}

export default LoginWithKeycloak;
