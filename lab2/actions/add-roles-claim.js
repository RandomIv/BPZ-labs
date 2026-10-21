exports.onExecutePostLogin = async (event, api) => {
  const namespace = 'https://bezpeka-lab/';
  const roles = event.authorization?.roles ?? [];
  api.idToken.setCustomClaim(`${namespace}roles`, roles);
  api.accessToken.setCustomClaim(`${namespace}roles`, roles);
};
