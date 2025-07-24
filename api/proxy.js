// /api/proxy.js

export default async function handler(req, res) {
  const targetUrl = req.query.url;

  if (!targetUrl) {
    return res.status(400).json({ error: "Parameter 'url' wajib ada." });
  }

  try {
    const requestHeaders = new Headers();
    requestHeaders.set(
      "User-Agent",
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36"
    );

    const apiResponse = await fetch(targetUrl, {
      headers: requestHeaders,
    });

    if (!apiResponse.ok) {
      const errorData = await apiResponse.text();
      return res.status(apiResponse.status).json({ error: `Error dari API tujuan: ${apiResponse.statusText}`, details: errorData });
    }

    const data = await apiResponse.json();

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate');

    return res.status(200).json(data);

  } catch (error) {
    return res.status(500).json({ error: `Terjadi error pada server proxy: ${error.message}` });
  }
}
