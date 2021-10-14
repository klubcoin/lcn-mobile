export const ConfirmProfileRequest = (from, firstname, lastname, avatar) => (
   {
      action: 'confirm_profile_request',
      from,
      firstname,
      lastname,
      avatar,
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
