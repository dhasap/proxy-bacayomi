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
    // Kita tambahkan referer palsu untuk lebih meyakinkan
    requestHeaders.set("Referer", "https://mangadex.org/");

    const apiResponse = await fetch(targetUrl, {
      headers: requestHeaders,
    });

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      return res.status(apiResponse.status).send(`Error dari target: ${apiResponse.statusText}. Rincian: ${errorText}`);
    }
    
    const contentType = apiResponse.headers.get("content-type");

    // Atur header CORS dan Cache untuk semua respons
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'public, s-maxage=259200, stale-while-revalidate'); // Cache untuk 3 hari

    // Logika baru untuk membedakan gambar dan JSON
    if (contentType && contentType.startsWith("image/")) {
      // Jika ini adalah gambar, kirim sebagai data gambar
      res.setHeader('Content-Type', contentType);
      const imageBuffer = await apiResponse.arrayBuffer();
      // Menggunakan Buffer untuk mengirim data biner
      return res.status(200).send(Buffer.from(imageBuffer));
    } else {
      // Jika bukan gambar (kemungkinan besar JSON), kirim sebagai JSON
      const data = await apiResponse.json();
      return res.status(200).json(data);
    }

  } catch (error) {
    return res.status(500).json({ error: `Error pada server proxy: ${error.message}` });
  }
}

