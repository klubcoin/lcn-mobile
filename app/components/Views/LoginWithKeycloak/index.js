import React from 'react'
import { View } from 'react-native'
import { useKeycloak } from '@react-keycloak/native';
import StyledButton from '../../UI/StyledButton';

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
      }).then(() => {
        if (onSuccess) onSuccess();
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
