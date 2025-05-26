export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const scriptUrl = "https://script.google.com/macros/s/AKfycbwF0jcrVgZHW3BjNTymC4FUt1-xpze8HD0Nv9gDmJldkkT8xAakMvr9Cp-Ib5rGEUjZfA/exec";

  try {
    const gsRes = await fetch(scriptUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams(req.body)
    });

    const data = await gsRes.json();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
}
