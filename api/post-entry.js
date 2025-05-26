import { parse } from 'querystring';

export const config = {
  api: {
    bodyParser: false
  }
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  let body = "";
  req.on("data", chunk => {
    body += chunk;
  });

  req.on("end", async () => {
    const parsed = parse(body);

    const scriptUrl = "https://script.google.com/macros/s/AKfycbwF0jcrVgZHW3BjNTymC4FUt1-xpze8HD0Nv9gDmJldkkT8xAakMvr9Cp-Ib5rGEUjZfA/exec";

    try {
      const gsRes = await fetch(scriptUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams(parsed)
      });

      const text = await gsRes.text();

      try {
        const data = JSON.parse(text);
        if (!data.code) throw new Error("No code in response");
        return res.status(200).json(data);
      } catch (err) {
        return res.status(502).json({ error: "Invalid response from script", raw: text });
      }

    } catch (err) {
      return res.status(500).json({ error: "Server error", message: err.message });
    }
  });
}

