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

export const ConfirmProfileRejected = (from, firstname, lastname) => (
   {
      action: 'confirm_profile_rejected',
      from,
      firstname,
      lastname,
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
