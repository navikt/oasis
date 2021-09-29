export const gyldigSession = ({ token = "123" }: { token?: string } = {}) => ({
  token,
  payload: { exp: Date.now() / 1000 + 3000 },
});
