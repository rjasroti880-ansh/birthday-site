// Checks Razorpay's signature so nobody can fake a payment from the browser.
const crypto = require("crypto");
exports.handler = async (event) => {
  const json = (code, obj) => ({ statusCode: code, headers: { "Content-Type": "application/json" }, body: JSON.stringify(obj) });
  if (event.httpMethod !== "POST") return json(405, { error: "POST only" });
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) return json(500, { error: "Server key is missing." });
  let b = {}; try { b = JSON.parse(event.body || "{}"); } catch (e) {}
  const { razorpay_order_id: o, razorpay_payment_id: p, razorpay_signature: s } = b;
  if (!o || !p || !s) return json(400, { error: "Payment details missing." });
  const want = crypto.createHmac("sha256", secret).update(o + "|" + p).digest("hex");
  const ok = want.length === s.length && crypto.timingSafeEqual(Buffer.from(want), Buffer.from(s));
  return ok ? json(200, { ok: true }) : json(400, { error: "Payment could not be verified." });
};
