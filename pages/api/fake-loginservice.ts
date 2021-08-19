export default function FakeLoginservice(req, res) {
  const { redirect } = req.query;

  return res.redirect(redirect);
}
