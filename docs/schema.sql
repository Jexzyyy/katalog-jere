-- Skema database Katalog UMKM
-- Cara pakai: Supabase > SQL Editor > New query > tempel seluruh isi file ini > Run.
-- Aman dijalankan ulang.

-- 1. Tabel produk
create table if not exists public.produk (
  id bigint generated always as identity primary key,
  nama text not null,
  harga integer not null check (harga >= 0),
  deskripsi text,
  foto_url text,
  kategori text,
  created_at timestamptz not null default now()
);

-- 2. Row Level Security
-- Tidak ada izin untuk publik: akses langsung ke tabel dari luar aplikasi ditolak.
-- Hanya admin yang sudah login yang boleh membaca dan mengubah data.
alter table public.produk enable row level security;

drop policy if exists "admin_baca_produk" on public.produk;
drop policy if exists "admin_tambah_produk" on public.produk;
drop policy if exists "admin_ubah_produk" on public.produk;
drop policy if exists "admin_hapus_produk" on public.produk;

create policy "admin_baca_produk" on public.produk
  for select to authenticated using (true);

create policy "admin_tambah_produk" on public.produk
  for insert to authenticated with check (true);

create policy "admin_ubah_produk" on public.produk
  for update to authenticated using (true) with check (true);

create policy "admin_hapus_produk" on public.produk
  for delete to authenticated using (true);

-- 3. Data produk awal (hanya diisi jika tabel masih kosong)
insert into public.produk (nama, harga, deskripsi, foto_url, kategori)
select * from (values
  ('Kopi Bubuk Robusta 250 g', 45000, 'Biji robusta disangrai sedang lalu digiling halus. Cocok untuk kopi tubruk dan kopi susu.', '/produk/kopi.svg', 'Minuman'),
  ('Keripik Singkong Balado', 15000, 'Singkong iris tipis, digoreng renyah, dibalut bumbu balado pedas manis.', '/produk/keripik.svg', 'Camilan'),
  ('Sambal Bawang Botol 150 ml', 25000, 'Cabai rawit dan bawang putih goreng dengan minyak, tahan hingga 2 bulan.', '/produk/sambal.svg', 'Bumbu'),
  ('Kue Nastar Toples 500 g', 85000, 'Nastar lembut dengan selai nanas buatan sendiri. Dikemas toples kedap udara.', '/produk/nastar.svg', 'Kue kering'),
  ('Tas Anyaman Pandan', 120000, 'Dianyam tangan dari daun pandan kering, dilapisi kain di bagian dalam.', '/produk/tas.svg', 'Kerajinan'),
  ('Kain Batik Cap 2 m', 175000, 'Batik cap motif parang di atas kain katun primisima, panjang 2 meter.', '/produk/batik.svg', 'Kain')
) as data_awal (nama, harga, deskripsi, foto_url, kategori)
where not exists (select 1 from public.produk);

-- 4. Data tambahan untuk menguji paginasi, urutan, filter, dan pencarian (54 produk).
--    Bersama data awal jadi 60 produk, 10 per kategori, dengan harga dan waktu dibuat berbeda.
--    Hanya diisi sekali; kalau tidak dibutuhkan, hapus dengan:
--    delete from public.produk where deskripsi like 'Contoh untuk uji paginasi%';
with kategori (urut, kategori, foto_url, harga_dasar, langkah, daftar) as (values
  (1, 'Minuman', '/produk/kopi.svg', 20000, 4000, array[
    'Kopi Arabika Gayo 250 g', 'Kopi Luwak Liar 100 g', 'Teh Melati Tubruk 100 g',
    'Wedang Uwuh Isi 10', 'Jahe Merah Instan 250 g', 'Kopi Susu Gula Aren 250 ml',
    'Teh Rosella Kering 50 g', 'Bajigur Instan Isi 5', 'Cokelat Bubuk Murni 200 g']),
  (2, 'Camilan', '/produk/keripik.svg', 10000, 1500, array[
    'Keripik Tempe Original', 'Keripik Pisang Cokelat', 'Rempeyek Kacang 250 g',
    'Basreng Pedas Daun Jeruk', 'Makaroni Bantat Pedas', 'Kerupuk Kulit Sapi 100 g',
    'Emping Melinjo Manis', 'Keripik Kentang Balado', 'Kacang Telur 250 g']),
  (3, 'Bumbu', '/produk/sambal.svg', 18000, 2500, array[
    'Sambal Cumi Asin 150 ml', 'Sambal Teri Medan 150 ml', 'Bumbu Rendang Instan',
    'Bumbu Pecel Kacang 250 g', 'Sambal Matah Botol 150 ml', 'Petis Udang 200 g',
    'Bumbu Rawon Instan', 'Saus Kacang Sate 250 g', 'Terasi Udang Bakar 100 g']),
  (4, 'Kue kering', '/produk/nastar.svg', 60000, 5000, array[
    'Kastengel Keju Toples 500 g', 'Putri Salju Toples 500 g', 'Lidah Kucing Toples 400 g',
    'Kue Semprit Toples 500 g', 'Sagu Keju Toples 400 g', 'Kue Kacang Toples 500 g',
    'Choco Chip Cookies 400 g', 'Bolu Kering Jadul 300 g', 'Kue Bawang 250 g']),
  (5, 'Kerajinan', '/produk/tas.svg', 35000, 15000, array[
    'Dompet Anyaman Rotan', 'Topi Pandan Pantai', 'Keranjang Bambu Serbaguna',
    'Tatakan Gelas Eceng Gondok Isi 6', 'Gantungan Kunci Kayu Ukir', 'Tas Rajut Benang Katun',
    'Vas Bunga Gerabah', 'Sandal Anyaman Mendong', 'Kotak Tisu Kayu Jati']),
  (6, 'Kain', '/produk/batik.svg', 150000, 25000, array[
    'Kain Batik Tulis Lasem 2 m', 'Sarung Tenun Samarinda', 'Kain Tenun Ikat NTT 2 m',
    'Selendang Songket Palembang', 'Kain Lurik Klaten 2 m', 'Batik Kawung Katun 2 m',
    'Kain Jumputan Palembang 2 m', 'Syal Batik Sutra', 'Kain Sasirangan Banjar 2 m'])
)
insert into public.produk (nama, harga, deskripsi, foto_url, kategori, created_at)
select
  p.nama,
  k.harga_dasar + p.ke * k.langkah,
  format('Contoh untuk uji paginasi, urutan, dan pencarian. Produk %s nomor %s.', lower(k.kategori), p.ke),
  k.foto_url,
  k.kategori,
  now() - make_interval(hours => ((k.urut - 1) * 9 + p.ke)::int)
from kategori k
cross join lateral unnest(k.daftar) with ordinality as p (nama, ke)
where not exists (select 1 from public.produk where deskripsi like 'Contoh untuk uji paginasi%');

-- 5. Migrasi US-15 sampai US-20 (fitur lanjutan)
-- Tambah kolom untuk stok, harga diskon, dan badge

-- US-19: Kolom stok (default 10 agar produk lama tetap tersedia)
alter table public.produk add column if not exists stok integer not null default 10 check (stok >= 0);

-- US-20: Kolom harga diskon (opsional, harus lebih kecil dari harga normal)
alter table public.produk add column if not exists harga_diskon integer check (harga_diskon > 0);

-- US-20: Kolom badge (enum: null, 'baru', atau 'terlaris')
alter table public.produk add column if not exists badge text check (badge in ('baru', 'terlaris'));

-- US-18: Tabel galeri foto produk
create table if not exists public.product_images (
  id bigint generated always as identity primary key,
  product_id bigint not null references public.produk(id) on delete cascade,
  url text not null,
  urutan integer not null default 0,
  created_at timestamptz not null default now()
);

-- RLS untuk product_images (sama seperti produk: hanya admin authenticated yang bisa akses)
alter table public.product_images enable row level security;

drop policy if exists "admin_baca_product_images" on public.product_images;
drop policy if exists "admin_tambah_product_images" on public.product_images;
drop policy if exists "admin_ubah_product_images" on public.product_images;
drop policy if exists "admin_hapus_product_images" on public.product_images;

create policy "admin_baca_product_images" on public.product_images
  for select to authenticated using (true);

create policy "admin_tambah_product_images" on public.product_images
  for insert to authenticated with check (true);

create policy "admin_ubah_product_images" on public.product_images
  for update to authenticated using (true) with check (true);

create policy "admin_hapus_product_images" on public.product_images
  for delete to authenticated using (true);

-- Indeks untuk performa query
create index if not exists idx_product_images_product_id on public.product_images(product_id);
create index if not exists idx_produk_kategori on public.produk(kategori);
create index if not exists idx_produk_harga on public.produk(harga);
create index if not exists idx_produk_created_at on public.produk(created_at);

-- Migrasi foto lama: masukkan foto_url existing sebagai foto pertama di galeri
-- Hanya dilakukan sekali untuk produk yang punya foto_url dan belum ada di product_images
insert into public.product_images (product_id, url, urutan)
select id, foto_url, 0
from public.produk
where foto_url is not null 
  and foto_url != ''
  and not exists (
    select 1 from public.product_images where product_id = produk.id
  );

-- Update beberapa produk contoh dengan harga diskon dan badge untuk testing
update public.produk 
set harga_diskon = 38000, badge = 'terlaris'
where nama = 'Kopi Bubuk Robusta 250 g';

update public.produk 
set badge = 'baru'
where nama in ('Tas Anyaman Pandan', 'Kain Batik Cap 2 m');

update public.produk
set stok = 0
where nama = 'Sambal Bawang Botol 150 ml';
