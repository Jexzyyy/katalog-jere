import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { periksaLogin } from "@/app/admin/actions";

export async function POST(request) {
  // Validasi login di server
  try {
    await periksaLogin();
  } catch {
    return NextResponse.json(
      { error: "Anda harus login terlebih dahulu." },
      { status: 401 }
    );
  }

  // Periksa API key
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY belum diatur di environment variable." },
      { status: 500 }
    );
  }

  try {
    const { nama, kategori } = await request.json();

    // Validasi input
    if (!nama || nama.trim().length === 0) {
      return NextResponse.json(
        { error: "Nama produk harus diisi." },
        { status: 400 }
      );
    }

    if (nama.length > 200) {
      return NextResponse.json(
        { error: "Nama produk terlalu panjang (maksimal 200 karakter)." },
        { status: 400 }
      );
    }

    // Panggil Gemini API
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Buatkan deskripsi pemasaran singkat (2-3 kalimat) dalam bahasa Indonesia untuk produk UMKM berikut:
Nama produk: ${nama}
Kategori: ${kategori || "Produk umum"}

Deskripsi harus menarik untuk pembeli, profesional, dan hanya berdasarkan informasi yang diberikan. Jangan membuat klaim yang tidak diketahui.`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const deskripsi = response.text();

    return NextResponse.json({ deskripsi: deskripsi.trim() });
  } catch (error) {
    console.error("Error generating description:", error);
    return NextResponse.json(
      { error: "Gagal membuat deskripsi. Silakan coba lagi." },
      { status: 500 }
    );
  }
}
