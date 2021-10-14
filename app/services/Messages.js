export const ConfirmProfileRequest = (from, firstname, lastname, avatar, email) => (
   {
      action: 'confirm_profile_request',
      from,
      firstname,
      lastname,
      avatar,
      email,
   }
);

export const RestoreSecretRequest = (from, firstname, lastname, avatar) => (
   {
      action: 'restore_secret_request',
      from,
      firstname,
      lastname,
      avatar,
   }
);
