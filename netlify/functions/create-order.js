// Asks Razorpay to open a new payment "order". Your secret key stays here, never in the web page.
exports.handler = async (event) => {
  const json = (code, obj) => ({ statusCode: code, headers: { "Content-Type": "application/json" }, body: JSON.stringify(obj) });
  if (event.httpMethod !== "POST") return json(405, { error: "POST only" });
  const id = process.env.RAZORPAY_KEY_ID, secret = process.env.RAZORPAY_KEY_SECRET;
  if (!id || !secret) return json(500, { error: "Server keys are missing. Add them in Netlify > Environment variables." });
  const amount = Math.round(Number(process.env.PRICE_INR || 199) * 100); // rupees -> paise
  try {
    const r = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Basic " + Buffer.from(id + ":" + secret).toString("base64") },
      body: JSON.stringify({ amount, currency: "INR", receipt: "bday_" + Date.now() })
    });
    const o = await r.json();
    if (!r.ok) return json(502, { error: (o.error && o.error.description) || "Razorpay refused the order." });
    return json(200, { keyId: id, amount: o.amount, currency: o.currency, orderId: o.id, businessName: process.env.BUSINESS_NAME || "LoveBloom Studio" });
  } catch (e) { return json(500, { error: "Could not reach Razorpay." }); }
};
