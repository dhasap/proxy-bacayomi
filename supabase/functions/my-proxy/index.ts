// Import library standar Deno untuk membuat server
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Header CORS untuk mengizinkan permintaan dari domain manapun.
// Ini penting agar aplikasi frontend Anda bisa mengakses proxy ini.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // Izinkan semua domain
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Fungsi utama yang akan dijalankan saat function ini dipanggil
serve(async (req) => {
  // Tangani permintaan pre-flight CORS (biasanya metode OPTIONS)
  // Browser mengirim ini sebelum permintaan utama untuk memeriksa izin CORS.
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // 1. Ambil URL target dari query parameter
    // Contoh pemanggilan: .../my-proxy?target=https://api.example.com/data
    const url = new URL(req.url);
    const targetUrl = url.searchParams.get("target");

    // Jika parameter 'target' tidak ada, kirim error.
    if (!targetUrl) {
      throw new Error("Parameter 'target' URL is required.");
    }

    // 2. Lakukan permintaan (fetch) ke URL target
    const response = await fetch(targetUrl, {
      method: req.method, // Gunakan metode yang sama (GET, POST, dll)
      headers: {
        // Teruskan beberapa header penting jika ada
        "Content-Type": req.headers.get("Content-Type") || "application/json",
        "Authorization": req.headers.get("Authorization") || ""
      },
      body: req.body, // Teruskan body jika ada (untuk POST, PUT)
    });

    // 3. Ambil data dari respons target
    const data = await response.json(); // Asumsi data berupa JSON

    // 4. Kirim kembali data ke pemanggil dengan header CORS
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: response.status,
    });

  } catch (err) {
    // Tangani jika ada error
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

