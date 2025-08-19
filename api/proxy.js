// /api/proxy.js (Versi Perbaikan)
export default async function handler(req, res) {
  const targetUrl = req.query.url;

  if (!targetUrl) {
    return res.status(400).json({ error: "Parameter 'url' wajib ada." });
  }

  try {
    const url = new URL(targetUrl); // Membuat objek URL untuk ekstraksi origin
    
    const requestHeaders = new Headers();
    requestHeaders.set(
      "User-Agent",
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36"
    );
    // Referer dinamis, lebih aman untuk semua situs
    requestHeaders.set("Referer", url.origin + "/");

    module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

    const { url } = req.query;

    if (!url) {
        return res.status(400).send('URL parameter is required');
    }

    try {
        const response = await fetch(url, {
            headers: {
                'Referer': 'https://komikcast.li/',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
        }

        const data = await response.text();

        res.status(response.status).send(data);
    } catch (error) {
        console.error('Proxy Error:', error);
        res.status(500).send(`Proxy Error: ${error.message}`);
    }
};

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      return res.status(apiResponse.status).send(`Error dari target: ${apiResponse.statusText}. Rincian: ${errorText}`);
    }
    
    const contentType = apiResponse.headers.get("content-type") || '';

    // Atur header CORS dan Cache untuk semua respons
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate'); // Cache untuk 1 hari

    // Logika baru untuk membedakan konten
    if (contentType.startsWith("image/")) {
      // Kirim sebagai gambar
      res.setHeader('Content-Type', contentType);
      const imageBuffer = await apiResponse.arrayBuffer();
      return res.status(200).send(Buffer.from(imageBuffer));
    } else if (contentType.startsWith("text/html")) {
      // Kirim sebagai teks HTML
      res.setHeader('Content-Type', 'text/plain'); // Kirim sebagai plain text agar aman
      const htmlText = await apiResponse.text();
      return res.status(200).send(htmlText);
    } else {
      // Default ke JSON untuk sisanya
      res.setHeader('Content-Type', 'application/json');
      const data = await apiResponse.json();
      return res.status(200).json(data);
    }

  } catch (error) {
    return res.status(500).json({ error: `Error pada server proxy: ${error.message}` });
  }
}
