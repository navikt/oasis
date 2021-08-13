export default function signout(req, res) {
  req.logout();
  res.status(204).end();
}
