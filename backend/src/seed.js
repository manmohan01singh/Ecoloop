import bcrypt from 'bcryptjs';
import sequelize from './config/database.js';
import {
  User, Device, Community, CommunityMember, Post, PostVote,
  Listing, Location, Provider, RepairRequest, Challenge,
  ChallengeParticipant, Event, EventParticipant, Report,
  EcoKarma, WasteDeposit, BusinessMaterial,
} from './models/index.js';
import logger from './utils/logger.js';

const seedData = async () => {
  try {
    await sequelize.authenticate();
    logger.info('Connected to database for seeding');
    await sequelize.sync({ force: true });
    logger.info('Tables dropped and recreated');

    // ── USERS ──────────────────────────────────────────────────
    const hash = (p) => bcrypt.hash(p, 10);

    const users = await User.bulkCreate([
      { name: 'Budi Santoso', email: 'demo@ecoloop.com', phone: '+6281234567890', password: await hash('demo123'), city: 'Jakarta', state: 'DKI Jakarta', role: 'user', ecoKarmaTotal: 145 },
      { name: 'Admin EcoLoop', email: 'admin@ecoloop.com', phone: '+6281234567891', password: await hash('admin123'), city: 'Jakarta', state: 'DKI Jakarta', role: 'admin', ecoKarmaTotal: 500 },
      { name: 'Siti Rahayu', email: 'siti@ecoloop.com', phone: '+6281234567892', password: await hash('demo123'), city: 'Bandung', state: 'Jawa Barat', role: 'user', ecoKarmaTotal: 210 },
      { name: 'Eko Prasetyo', email: 'eko@ecoloop.com', phone: '+6281234567893', password: await hash('demo123'), city: 'Surabaya', state: 'Jawa Timur', role: 'repair_provider', ecoKarmaTotal: 380 },
      { name: 'Dewi Kusuma', email: 'dewi@ecoloop.com', phone: '+6281234567894', password: await hash('demo123'), city: 'Yogyakarta', state: 'DI Yogyakarta', role: 'user', ecoKarmaTotal: 95 },
      { name: 'Agus Wibowo', email: 'agus@ecoloop.com', phone: '+6281234567895', password: await hash('demo123'), city: 'Denpasar', state: 'Bali', role: 'business', ecoKarmaTotal: 320 },
      { name: 'Rina Lestari', email: 'rina@ecoloop.com', phone: '+6281234567896', password: await hash('demo123'), city: 'Jakarta', state: 'DKI Jakarta', role: 'user', ecoKarmaTotal: 60 },
      { name: 'Hendra Gunawan', email: 'hendra@ecoloop.com', phone: '+6281234567897', password: await hash('demo123'), city: 'Bandung', state: 'Jawa Barat', role: 'recycler', ecoKarmaTotal: 440 },
      { name: 'Indah Permata', email: 'indah@ecoloop.com', phone: '+6281234567898', password: await hash('demo123'), city: 'Surabaya', state: 'Jawa Timur', role: 'user', ecoKarmaTotal: 175 },
      { name: 'Fajar Nugroho', email: 'fajar@ecoloop.com', phone: '+6281234567899', password: await hash('demo123'), city: 'Jakarta', state: 'DKI Jakarta', role: 'organization', ecoKarmaTotal: 290 },
      { name: 'Maya Putri', email: 'maya@ecoloop.com', phone: '+6281234567800', password: await hash('demo123'), city: 'Yogyakarta', state: 'DI Yogyakarta', role: 'user', ecoKarmaTotal: 130 },
      { name: 'Dodi Firmansyah', email: 'dodi@ecoloop.com', phone: '+6281234567801', password: await hash('demo123'), city: 'Denpasar', state: 'Bali', role: 'user', ecoKarmaTotal: 85 },
    ], { individualHooks: false });
    logger.info(`Created ${users.length} users`);

    const [budi, admin, siti, eko, dewi, agus, rina, hendra, indah, fajar, maya, dodi] = users;

    // ── DEVICES ────────────────────────────────────────────────
    const devices = await Device.bulkCreate([
      { userId: budi.id, name: 'Laptop Tua Masih Jalan', category: 'laptop', brand: 'Lenovo', model: 'ThinkPad X230', purchaseDate: '2018-06-01', condition: 'fair', status: 'active', usageHoursPerDay: 5.0, location: { city: 'Jakarta' } },
      { userId: budi.id, name: 'Samsung Galaxy S10', category: 'smartphone', brand: 'Samsung', model: 'Galaxy S10', purchaseDate: '2020-03-15', condition: 'good', status: 'active', usageHoursPerDay: 6.0, location: { city: 'Jakarta' } },
      { userId: siti.id, name: 'iPhone 11 Lama', category: 'smartphone', brand: 'Apple', model: 'iPhone 11', purchaseDate: '2019-11-01', condition: 'fair', status: 'active', usageHoursPerDay: 7.0, location: { city: 'Bandung' } },
      { userId: eko.id, name: 'Printer HP Rusak', category: 'printer', brand: 'HP', model: 'LaserJet 1020', purchaseDate: '2017-04-10', condition: 'poor', status: 'active', usageHoursPerDay: 2.0, location: { city: 'Surabaya' } },
      { userId: dewi.id, name: 'TV LED 32 Inch', category: 'tv', brand: 'LG', model: '32LM550B', purchaseDate: '2016-09-20', condition: 'good', status: 'active', usageHoursPerDay: 4.0, location: { city: 'Yogyakarta' } },
    ]);
    logger.info(`Created ${devices.length} devices`);

    // ── COMMUNITIES ────────────────────────────────────────────
    const communities = await Community.bulkCreate([
      { name: 'E-Waste Indonesia', slug: 'ewaste_indonesia', description: 'Komunitas pengelolaan limbah elektronik di Indonesia', category: 'ewaste', createdById: fajar.id, memberCount: 1, isVerified: true },
      { name: 'Repair Jogja', slug: 'repair_jogja', description: 'Komunitas perbaikan barang elektronik di Yogyakarta', category: 'repair', createdById: eko.id, memberCount: 1, isVerified: false },
      { name: 'Zero Waste Bandung', slug: 'zerowaste_bandung', description: 'Gerakan zero waste di kota Bandung', category: 'sustainability', createdById: siti.id, memberCount: 1 },
      { name: 'Plastik Bebas Jakarta', slug: 'plastik_bebas_jakarta', description: 'Komunitas bebas plastik Jakarta', category: 'plastic', createdById: rina.id, memberCount: 1 },
      { name: 'Circular Economy Hub', slug: 'circular_economy_hub', description: 'Hub ekonomi sirkular untuk bisnis dan organisasi', category: 'circular_business', createdById: agus.id, memberCount: 1 },
      { name: 'Daur Ulang Surabaya', slug: 'daur_ulang_surabaya', description: 'Komunitas daur ulang sampah di Surabaya', category: 'recycling', createdById: indah.id, memberCount: 1 },
      { name: 'Upcycling Bali', slug: 'upcycling_bali', description: 'Transformasi sampah menjadi karya seni di Bali', category: 'reuse', createdById: dodi.id, memberCount: 1 },
      { name: 'Composting Indonesia', slug: 'composting_indonesia', description: 'Komunitas kompos dan pertanian organik', category: 'food_organic', createdById: maya.id, memberCount: 1 },
      { name: 'Tekstil Lestari', slug: 'tekstil_lestari', description: 'Fashion berkelanjutan dan daur ulang tekstil', category: 'textile', createdById: dewi.id, memberCount: 1 },
      { name: 'Lapor Sampah', slug: 'lapor_sampah', description: 'Laporkan masalah sampah di lingkungan Anda', category: 'waste_problems', createdById: admin.id, memberCount: 1 },
    ]);
    logger.info(`Created ${communities.length} communities`);

    // Memberships
    await CommunityMember.bulkCreate([
      { communityId: communities[0].id, userId: fajar.id, role: 'admin' },
      { communityId: communities[0].id, userId: budi.id, role: 'member' },
      { communityId: communities[0].id, userId: hendra.id, role: 'member' },
      { communityId: communities[1].id, userId: eko.id, role: 'admin' },
      { communityId: communities[1].id, userId: dewi.id, role: 'member' },
      { communityId: communities[2].id, userId: siti.id, role: 'admin' },
      { communityId: communities[2].id, userId: maya.id, role: 'member' },
      { communityId: communities[3].id, userId: rina.id, role: 'admin' },
      { communityId: communities[4].id, userId: agus.id, role: 'admin' },
      { communityId: communities[5].id, userId: indah.id, role: 'admin' },
      { communityId: communities[5].id, userId: hendra.id, role: 'moderator' },
      { communityId: communities[6].id, userId: dodi.id, role: 'admin' },
      { communityId: communities[7].id, userId: maya.id, role: 'admin' },
      { communityId: communities[8].id, userId: dewi.id, role: 'admin' },
      { communityId: communities[9].id, userId: admin.id, role: 'admin' },
    ]);

    // Update member counts
    await Community.update({ memberCount: 3 }, { where: { id: communities[0].id } });
    await Community.update({ memberCount: 2 }, { where: { id: [communities[1].id, communities[2].id, communities[5].id] } });

    // ── POSTS ──────────────────────────────────────────────────
    const posts = await Post.bulkCreate([
      { authorId: budi.id, communityId: communities[0].id, title: 'Laptop lama saya masih bisa diperbaiki tidak?', body: 'Punya ThinkPad X230 dari 2018, baterai sudah melemah dan kadang hang. Masih worth it diperbaiki atau lebih baik dijual spare part?', category: 'ewaste', upvotes: 24, downvotes: 2, commentCount: 7, score: 22.5 },
      { authorId: siti.id, communityId: communities[2].id, title: 'Tips mengurangi sampah plastik di rumah tangga', body: 'Sudah 3 bulan saya menerapkan zero waste di rumah. Ini tips yang berhasil: 1) Bawa kantong belanja sendiri, 2) Hindari kemasan sekali pakai, 3) Pilah sampah dari sumber...', category: 'plastic', upvotes: 67, downvotes: 3, commentCount: 15, score: 64.2 },
      { authorId: eko.id, communityId: communities[1].id, title: 'Workshop Perbaikan HP Gratis - Sabtu Ini!', body: 'Kami mengadakan workshop perbaikan smartphone gratis di Jogja Community Hub. Bawa HP rusak Anda! Kapasitas terbatas 20 orang.', category: 'repair', upvotes: 45, downvotes: 1, commentCount: 12, score: 44.1 },
      { authorId: hendra.id, communityId: communities[5].id, title: 'Cara memilah sampah elektronik yang benar', body: 'Banyak yang belum tahu bahwa baterai, lampu LED, dan komponen elektronik TIDAK boleh dibuang ke tempat sampah biasa. Berikut panduan lengkapnya...', category: 'ewaste', upvotes: 89, downvotes: 4, commentCount: 23, score: 85.0 },
      { authorId: dewi.id, communityId: communities[8].id, title: 'Ide upcycle baju lama jadi tote bag', body: 'Kemarin saya berhasil mengubah 5 baju kaos lama menjadi tote bag yang keren. Prosesnya mudah dan tidak butuh mesin jahit! Mau tau caranya?', category: 'textile', upvotes: 112, downvotes: 2, commentCount: 31, score: 110.0 },
      { authorId: agus.id, communityId: communities[4].id, title: 'Perusahaan kami punya surplus kardus 500kg/bulan', body: 'Kami perusahaan packaging di Bali, setiap bulan punya sisa kardus sekitar 500kg yang masih layak pakai. Ada yang butuh untuk UMKM atau pengiriman?', category: 'circular_business', upvotes: 38, downvotes: 0, commentCount: 18, score: 38.0 },
      { authorId: maya.id, communityId: communities[7].id, title: 'Memulai kompos dari sampah dapur', body: 'Tutorial lengkap membuat kompos dari sisa makanan di rumah. Tidak bau, tidak ribet, dan hasilnya bisa untuk tanaman!', category: 'food_organic', upvotes: 54, downvotes: 1, commentCount: 9, score: 53.0 },
      { authorId: indah.id, communityId: communities[5].id, title: 'Berhasil daur ulang 50kg plastik minggu ini!', body: 'Alhamdulillah, minggu ini komunitas kita berhasil mengumpulkan dan mendaur ulang 50kg sampah plastik. Terima kasih semua yang sudah berpartisipasi!', category: 'recycling', upvotes: 143, downvotes: 0, commentCount: 27, score: 143.0 },
      { authorId: rina.id, communityId: communities[3].id, title: 'Sampah plastik di Kali Ciliwung makin parah', body: 'Kemarin saya foto kondisi Kali Ciliwung dekat Condet. Sampah plastik menumpuk dan menghalangi aliran air. Perlu tindakan segera dari semua pihak.', category: 'waste_problems', upvotes: 201, downvotes: 5, commentCount: 44, score: 196.0 },
      { authorId: fajar.id, communityId: communities[0].id, title: 'EcoLoop kini hadir di 5 kota Indonesia!', body: 'Dengan bangga kami umumkan bahwa platform EcoLoop kini aktif di Jakarta, Bandung, Surabaya, Yogyakarta, dan Denpasar. Mari bersama membangun ekonomi sirkular!', category: 'sustainability', upvotes: 256, downvotes: 2, commentCount: 38, score: 254.0 },
      { authorId: dodi.id, communityId: communities[6].id, title: 'Dari botol plastik jadi lampu hias unik', body: 'Koleksi terbaru saya — lampu hias dari botol plastik bekas. Sudah terjual 15 buah minggu ini. Kalau tertarik bisa hubungi saya.', category: 'reuse', upvotes: 88, downvotes: 1, commentCount: 16, score: 87.0 },
      { authorId: budi.id, communityId: communities[0].id, title: 'Mau give away laptop lama saya', body: 'ThinkPad X230 saya masih bisa jalan untuk pekerjaan ringan. Daripada nganggur, mending saya kasih ke yang membutuhkan. Silahkan DM saya!', category: 'ewaste', upvotes: 76, downvotes: 0, commentCount: 20, score: 76.0 },
    ]);
    logger.info(`Created ${posts.length} posts`);

    // ── LISTINGS ───────────────────────────────────────────────
    const listings = await Listing.bulkCreate([
      { userId: budi.id, title: 'Laptop Lenovo ThinkPad X230 - Masih Fungsi', description: 'Laptop lama tapi masih bisa dipakai untuk pekerjaan ringan. Baterai perlu ganti. Cocok untuk yang butuh laptop murah.', category: 'electronics', material: 'Mixed Electronics', condition: 'fair', quantity: 1, unit: 'unit', city: 'Jakarta', province: 'DKI Jakarta', circularAction: 'give_away', isFree: true, pickupType: 'pickup', status: 'available' },
      { userId: siti.id, title: 'Koleksi Baju Bekas Masih Bagus 15 pcs', description: 'Baju-baju lama dari brand lokal, ukuran S-M, kondisi masih bagus. Mau dijual murah atau ditukar dengan tanaman hias.', category: 'textile', condition: 'good', quantity: 15, unit: 'pcs', city: 'Bandung', province: 'Jawa Barat', circularAction: 'sell', isFree: false, price: 50000, pickupType: 'both', status: 'available' },
      { userId: eko.id, title: 'Spare Parts HP Berbagai Merk', description: 'Kumpulan spare parts HP dari berbagai merk: layar, baterai, casing. Cocok untuk yang bisa servis sendiri.', category: 'electronics', condition: 'fair', quantity: 20, unit: 'pcs', city: 'Surabaya', province: 'Jawa Timur', circularAction: 'sell', isFree: false, price: 25000, pickupType: 'both', status: 'available' },
      { userId: dewi.id, title: 'TV LED LG 32 inch - Butuh Servis', description: 'TV LG 32 inch, gambar masih oke tapi suara sedikit gangguan. Dijual as-is atau bisa diantar ke tukang servis.', category: 'electronics', condition: 'fair', quantity: 1, unit: 'unit', city: 'Yogyakarta', province: 'DI Yogyakarta', circularAction: 'repair', isFree: false, price: 300000, pickupType: 'pickup', status: 'available' },
      { userId: agus.id, title: 'Kardus Bekas Tebal 100kg - Gratis Ambil', description: 'Surplus kardus dari gudang packaging kami. Masih kuat untuk pengiriman. Silahkan ambil sendiri.', category: 'paper_cardboard', condition: 'good', quantity: 100, unit: 'kg', city: 'Denpasar', province: 'Bali', circularAction: 'give_away', isFree: true, pickupType: 'pickup', status: 'available' },
      { userId: hendra.id, title: 'Botol Plastik PET Bersih 50kg', description: 'Botol plastik PET sudah dicuci dan dipress. Siap untuk didaur ulang atau dibuat kerajinan.', category: 'plastic', condition: 'good', quantity: 50, unit: 'kg', city: 'Bandung', province: 'Jawa Barat', circularAction: 'recycle', isFree: false, price: 3000, pickupType: 'dropoff', status: 'available' },
      { userId: indah.id, title: 'Perabot Rumah Tangga Bekas', description: 'Kursi, meja, dan rak buku bekas yang masih layak pakai. Pindahan rumah, perlu cepat diambil.', category: 'furniture', condition: 'good', quantity: 5, unit: 'pcs', city: 'Surabaya', province: 'Jawa Timur', circularAction: 'give_away', isFree: true, pickupType: 'pickup', status: 'available' },
      { userId: maya.id, title: 'Kompos Matang - Pupuk Organik', description: 'Kompos dari sampah dapur dan taman, sudah matang siap pakai. Bagus untuk tanaman.', category: 'organic', condition: 'like_new', quantity: 20, unit: 'kg', city: 'Yogyakarta', province: 'DI Yogyakarta', circularAction: 'sell', isFree: false, price: 5000, pickupType: 'both', status: 'available' },
      { userId: rina.id, title: 'Kain Perca Batik Berbagai Motif', description: 'Sisa produksi batik dari workshop. Cocok untuk kerajinan tangan atau patchwork.', category: 'textile', condition: 'good', quantity: 10, unit: 'kg', city: 'Jakarta', province: 'DKI Jakarta', circularAction: 'sell', isFree: false, price: 20000, pickupType: 'both', status: 'available' },
      { userId: dodi.id, title: 'Hasil Upcycle: Lampu dari Botol Plastik', description: 'Lampu hias unik dibuat dari botol plastik bekas. Sudah pakai LED hemat energy. Bisa untuk dekorasi rumah atau kafe.', category: 'plastic', condition: 'like_new', quantity: 5, unit: 'pcs', city: 'Denpasar', province: 'Bali', circularAction: 'sell', isFree: false, price: 75000, pickupType: 'shipping', status: 'available' },
      { userId: fajar.id, title: 'Smartphone Android Bekas - Layak Pakai', description: 'Samsung Galaxy A30 kondisi baik, sudah reset pabrik. Cocok untuk anak sekolah atau orangtua.', category: 'electronics', condition: 'good', quantity: 1, unit: 'unit', city: 'Jakarta', province: 'DKI Jakarta', circularAction: 'donate', isFree: true, pickupType: 'both', status: 'available' },
      { userId: budi.id, title: 'Buku-buku Kuliah Teknik Informatika', description: 'Sekitar 20 buku kuliah TI dari semester 1-8. Edisi lama tapi masih relevan untuk referensi.', category: 'paper_cardboard', condition: 'good', quantity: 20, unit: 'pcs', city: 'Jakarta', province: 'DKI Jakarta', circularAction: 'donate', isFree: true, pickupType: 'pickup', status: 'available' },
    ]);
    logger.info(`Created ${listings.length} listings`);

    // ── LOCATIONS (Demo) ───────────────────────────────────────
    const locations = await Location.bulkCreate([
      { name: '[Demo] Bank Sampah Induk Jakarta Selatan', category: 'waste_bank', address: 'Jl. Raya Pasar Minggu No. 45', city: 'Jakarta', province: 'DKI Jakarta', lat: -6.2846, lng: 106.8451, acceptedMaterials: ['plastik', 'kertas', 'logam', 'kaca'], contact: { phone: '021-7891234', whatsapp: '+6281234001' }, openingHours: { senin_jumat: '08:00-16:00', sabtu: '08:00-12:00' }, verificationStatus: 'unverified', isDemo: true, submittedById: admin.id },
      { name: '[Demo] TPA E-Waste Bandung Barat', category: 'recycling_center', address: 'Jl. Sudirman No. 123, Bandung', city: 'Bandung', province: 'Jawa Barat', lat: -6.9175, lng: 107.6191, acceptedMaterials: ['elektronik', 'baterai', 'lampu', 'kabel'], contact: { phone: '022-4567890', email: 'ewaste@bandung.demo' }, openingHours: { senin_sabtu: '07:00-17:00' }, verificationStatus: 'unverified', isDemo: true, submittedById: admin.id },
      { name: '[Demo] Pusat Daur Ulang Surabaya Timur', category: 'recycling_center', address: 'Jl. Kenjeran No. 78, Surabaya', city: 'Surabaya', province: 'Jawa Timur', lat: -7.2575, lng: 112.7521, acceptedMaterials: ['plastik', 'kertas', 'aluminium', 'besi'], contact: { phone: '031-5678901' }, openingHours: { senin_jumat: '08:00-17:00' }, verificationStatus: 'unverified', isDemo: true, submittedById: admin.id },
      { name: '[Demo] Workshop Servis Elektronik Eko', category: 'repair_shop', address: 'Jl. Malioboro No. 56, Yogyakarta', city: 'Yogyakarta', province: 'DI Yogyakarta', lat: -7.7956, lng: 110.3695, acceptedMaterials: ['smartphone', 'laptop', 'printer', 'tv'], contact: { whatsapp: '+6281234002', instagram: '@servis_eko_jogja' }, openingHours: { senin_sabtu: '09:00-18:00' }, verificationStatus: 'unverified', isDemo: true, submittedById: admin.id },
      { name: '[Demo] Drop Point E-Waste Bali', category: 'collection_point', address: 'Jl. Bypass Ngurah Rai No. 200, Denpasar', city: 'Denpasar', province: 'Bali', lat: -8.6705, lng: 115.2126, acceptedMaterials: ['elektronik', 'baterai', 'printer', 'kabel'], contact: { phone: '0361-456789' }, openingHours: { setiap_hari: '07:00-20:00' }, verificationStatus: 'unverified', isDemo: true, submittedById: admin.id },
      { name: '[Demo] Bank Sampah Komunitas Bandung', category: 'waste_bank', address: 'Jl. Dago No. 88, Bandung', city: 'Bandung', province: 'Jawa Barat', lat: -6.8851, lng: 107.6099, acceptedMaterials: ['plastik', 'kertas', 'kaca', 'logam'], contact: { whatsapp: '+6281234003' }, openingHours: { selasa_sabtu: '08:00-15:00' }, verificationStatus: 'unverified', isDemo: true, submittedById: admin.id },
      { name: '[Demo] Komunitas Repair Hub Surabaya', category: 'community_hub', address: 'Jl. Pemuda No. 34, Surabaya', city: 'Surabaya', province: 'Jawa Timur', lat: -7.2651, lng: 112.7384, acceptedMaterials: [], contact: { email: 'hub@surabaya.demo' }, openingHours: { rabu_minggu: '10:00-20:00' }, verificationStatus: 'unverified', isDemo: true, submittedById: admin.id },
      { name: '[Demo] Pusat Donasi Elektronik Jakarta', category: 'donation_center', address: 'Jl. Thamrin No. 12, Jakarta', city: 'Jakarta', province: 'DKI Jakarta', lat: -6.1944, lng: 106.8229, acceptedMaterials: ['smartphone', 'laptop', 'tablet', 'elektronik'], contact: { phone: '021-3456789' }, openingHours: { senin_jumat: '09:00-17:00' }, verificationStatus: 'unverified', isDemo: true, submittedById: admin.id },
      { name: '[Demo] Bank Sampah Elektronik Yogya', category: 'waste_bank', address: 'Jl. Solo No. 45, Yogyakarta', city: 'Yogyakarta', province: 'DI Yogyakarta', lat: -7.7829, lng: 110.4017, acceptedMaterials: ['elektronik', 'baterai', 'kabel', 'PCB'], contact: { whatsapp: '+6281234004' }, openingHours: { senin_sabtu: '08:00-16:00' }, verificationStatus: 'unverified', isDemo: true, submittedById: admin.id },
      { name: '[Demo] Eco Hub Bali Utara', category: 'community_hub', address: 'Jl. Sunset Road No. 100, Kuta', city: 'Denpasar', province: 'Bali', lat: -8.7190, lng: 115.1686, acceptedMaterials: ['plastik', 'kaca', 'tekstil'], contact: { instagram: '@ecohub_bali', email: 'ecohub@bali.demo' }, openingHours: { setiap_hari: '08:00-21:00' }, verificationStatus: 'unverified', isDemo: true, submittedById: admin.id },
    ]);
    logger.info(`Created ${locations.length} locations`);

    // ── PROVIDERS ──────────────────────────────────────────────
    const providers = await Provider.bulkCreate([
      { userId: eko.id, businessName: 'Eko Servis Elektronik Jogja', type: 'repair', specializations: ['smartphone', 'laptop', 'printer'], description: 'Servis elektronik profesional di Yogyakarta dengan pengalaman 10 tahun', address: 'Jl. Malioboro No. 56', city: 'Yogyakarta', province: 'DI Yogyakarta', lat: -7.7956, lng: 110.3695, phone: '+6281234567893', whatsapp: '+6281234567893', serviceRadius: 20, completedJobs: 127, verificationStatus: 'unverified', acceptedMaterials: ['smartphone', 'laptop', 'tablet', 'printer'] },
      { userId: hendra.id, businessName: 'Hendra Recycling Center Bandung', type: 'recycler', specializations: ['plastik', 'logam', 'elektronik'], description: 'Pusat daur ulang sampah terpadu di Bandung', address: 'Jl. Pasteur No. 100', city: 'Bandung', province: 'Jawa Barat', lat: -6.8997, lng: 107.5953, phone: '+6281234567897', serviceRadius: 30, completedJobs: 89, verificationStatus: 'unverified', acceptedMaterials: ['plastik', 'kertas', 'logam', 'kaca', 'elektronik'] },
      { userId: agus.id, businessName: 'Bali Circular Waste Solutions', type: 'waste_collector', specializations: ['plastik', 'kardus', 'tekstil'], description: 'Layanan pengangkutan dan pengelolaan sampah sirkular di Bali', address: 'Jl. Bypass No. 150', city: 'Denpasar', province: 'Bali', lat: -8.6705, lng: 115.2126, phone: '+6281234567895', whatsapp: '+6281234567895', serviceRadius: 25, completedJobs: 45, verificationStatus: 'unverified', acceptedMaterials: ['plastik', 'kardus', 'tekstil', 'kaca'] },
      { userId: indah.id, businessName: 'Surabaya E-Waste Bank', type: 'waste_bank', specializations: ['elektronik', 'baterai'], description: 'Bank sampah khusus elektronik di Surabaya. Kami menerima semua jenis e-waste.', address: 'Jl. Kenjeran No. 78', city: 'Surabaya', province: 'Jawa Timur', lat: -7.2575, lng: 112.7521, phone: '+6281234567898', serviceRadius: 15, completedJobs: 203, verificationStatus: 'unverified', acceptedMaterials: ['smartphone', 'laptop', 'tablet', 'printer', 'baterai', 'kabel'] },
      { userId: fajar.id, businessName: 'Jakarta Green Repair Hub', type: 'repair', specializations: ['appliances', 'elektronik'], description: 'Workshop perbaikan peralatan rumah tangga dan elektronik di Jakarta', address: 'Jl. Gatot Subroto No. 78', city: 'Jakarta', province: 'DKI Jakarta', lat: -6.2297, lng: 106.8113, phone: '+6281234567899', whatsapp: '+6281234567899', serviceRadius: 20, completedJobs: 67, verificationStatus: 'unverified', acceptedMaterials: ['mesin_cuci', 'ac', 'kulkas', 'tv', 'printer'] },
    ]);
    logger.info(`Created ${providers.length} providers`);

    // ── WASTE DEPOSITS ─────────────────────────────────────────
    await WasteDeposit.bulkCreate([
      { userId: budi.id, providerId: providers[3].id, material: 'Plastik PET', weightKg: 5.0, pricePerKg: 2000, totalValue: 10000, depositDate: '2026-09-01', ecoKarmaAwarded: true },
      { userId: siti.id, providerId: providers[1].id, material: 'Kardus', weightKg: 8.5, pricePerKg: 1000, totalValue: 8500, depositDate: '2026-09-05', ecoKarmaAwarded: true },
      { userId: dewi.id, providerId: providers[3].id, material: 'Logam Campuran', weightKg: 2.0, pricePerKg: 5000, totalValue: 10000, depositDate: '2026-09-08', ecoKarmaAwarded: true },
      { userId: indah.id, providerId: providers[3].id, material: 'Elektronik Rusak', weightKg: 3.5, pricePerKg: 0, totalValue: 0, depositDate: '2026-09-10', ecoKarmaAwarded: true },
    ]);

    // ── REPAIR REQUESTS ────────────────────────────────────────
    await RepairRequest.bulkCreate([
      { userId: budi.id, providerId: providers[0].id, itemName: 'Laptop Lenovo ThinkPad X230', category: 'laptop', description: 'Baterai sudah tidak bisa charge, sering hang saat multitasking. Butuh diagnosa dan estimasi biaya perbaikan.', city: 'Yogyakarta', status: 'in_progress', estimatedCost: 350000 },
      { userId: siti.id, itemName: 'Mesin Cuci Sanyo', category: 'washing_machine', description: 'Mesin cuci tidak mau spin, bunyi aneh saat berputar. Sudah 7 tahun dipakai.', city: 'Bandung', status: 'requested' },
      { userId: maya.id, providerId: providers[4].id, itemName: 'AC Daikin 1 PK', category: 'ac', description: 'AC tidak dingin, mungkin perlu isi freon atau ada kebocoran.', city: 'Jakarta', status: 'accepted', estimatedCost: 450000 },
      { userId: rina.id, itemName: 'Printer Epson L3110', category: 'printer', description: 'Printer head tersumbat, hasil cetak bergaris-garis.', city: 'Jakarta', status: 'completed', completedAt: new Date('2026-09-11'), ecoKarmaAwarded: true },
    ]);

    // ── CHALLENGES ─────────────────────────────────────────────
    const challenges = await Challenge.bulkCreate([
      { createdById: fajar.id, title: 'Campus E-Waste Challenge', description: 'Universitas dan kampus se-Indonesia berkompetisi mengumpulkan e-waste terbanyak. Bantu selamatkan lingkungan dari limbah elektronik!', category: 'ewaste', goalType: 'weight_kg', goalValue: 1000, currentValue: 347, startDate: '2026-09-01', endDate: '2026-10-15', status: 'active', participantCount: 45, ecoKarmaReward: 50 },
      { createdById: admin.id, title: 'Plastic Free October Surabaya', description: 'Selama Oktober, kumpulkan dan daur ulang sampah plastik bersama komunitas Surabaya. Target 500kg!', category: 'plastic', goalType: 'weight_kg', goalValue: 500, currentValue: 89, startDate: '2026-10-01', endDate: '2026-10-31', status: 'upcoming', participantCount: 28, ecoKarmaReward: 40 },
      { createdById: agus.id, title: 'Bali Repair-a-Thon', description: '100 item diperbaiki dalam 30 hari. Gabung dan bawa barang rusak Anda!', category: 'repair', goalType: 'items_count', goalValue: 100, currentValue: 34, startDate: '2026-09-10', endDate: '2026-10-10', status: 'active', participantCount: 19, ecoKarmaReward: 30 },
      { createdById: fajar.id, title: 'Zero Waste Weekend Jakarta', description: 'Dua hari penuh tanpa sampah! Event seru di berbagai titik Jakarta.', category: 'sustainability', goalType: 'actions_count', goalValue: 200, currentValue: 156, startDate: '2026-09-20', endDate: '2026-09-22', status: 'active', participantCount: 73, ecoKarmaReward: 25 },
      { createdById: indah.id, title: 'Surabaya Swap & Give', description: 'Tukarkan barang yang tidak terpakai dengan barang yang kamu butuhkan. Tidak ada transaksi uang!', category: 'reuse', goalType: 'items_count', goalValue: 300, currentValue: 78, startDate: '2026-09-15', endDate: '2026-09-30', status: 'active', participantCount: 31, ecoKarmaReward: 20 },
    ]);
    logger.info(`Created ${challenges.length} challenges`);

    // Challenge participants
    await ChallengeParticipant.bulkCreate([
      { challengeId: challenges[0].id, userId: budi.id, contribution: 25.5 },
      { challengeId: challenges[0].id, userId: siti.id, contribution: 18.0 },
      { challengeId: challenges[0].id, userId: hendra.id, contribution: 67.0 },
      { challengeId: challenges[0].id, userId: indah.id, contribution: 43.5 },
      { challengeId: challenges[0].id, userId: dewi.id, contribution: 12.0 },
      { challengeId: challenges[2].id, userId: eko.id, contribution: 12 },
      { challengeId: challenges[2].id, userId: dodi.id, contribution: 8 },
      { challengeId: challenges[3].id, userId: rina.id, contribution: 15 },
      { challengeId: challenges[3].id, userId: maya.id, contribution: 22 },
      { challengeId: challenges[4].id, userId: indah.id, contribution: 14 },
    ]);

    // ── EVENTS ─────────────────────────────────────────────────
    const events = await Event.bulkCreate([
      { createdById: eko.id, communityId: communities[1].id, title: 'Workshop Perbaikan HP & Laptop Gratis', description: 'Bawa HP/laptop rusak kamu! Tim teknisi kami siap membantu. Gratis untuk 20 peserta pertama.', type: 'repair_workshop', address: 'Jogja Community Hub, Jl. Malioboro No. 56', city: 'Yogyakarta', lat: -7.7956, lng: 110.3695, startDate: new Date('2026-09-28T09:00:00'), endDate: new Date('2026-09-28T17:00:00'), capacity: 20, participantCount: 14, status: 'upcoming', goalDescription: '20 barang diperbaiki', ecoKarmaReward: 25 },
      { createdById: fajar.id, communityId: communities[0].id, title: 'E-Waste Collection Drive - Jakarta', description: 'Kumpulkan elektronik rusak dan tidak terpakai. Kami sediakan drop point di 5 lokasi Jakarta.', type: 'collection_drive', address: 'Bundaran HI, Jakarta', city: 'Jakarta', lat: -6.1944, lng: 106.8229, startDate: new Date('2026-10-04T07:00:00'), endDate: new Date('2026-10-04T15:00:00'), capacity: 200, participantCount: 87, status: 'upcoming', goalDescription: '500kg e-waste dikumpulkan', ecoKarmaReward: 30 },
      { createdById: siti.id, communityId: communities[2].id, title: 'Swap & Share - Bandung', description: 'Bawa barang yang tidak kamu butuhkan, tukarkan dengan yang kamu inginkan. Gratis, tidak ada uang!', type: 'swap_event', address: 'Taman Cibeunying, Bandung', city: 'Bandung', lat: -6.9175, lng: 107.6191, startDate: new Date('2026-09-27T10:00:00'), endDate: new Date('2026-09-27T16:00:00'), capacity: 100, participantCount: 42, status: 'upcoming', goalDescription: '100 item ditukar', ecoKarmaReward: 20 },
      { createdById: indah.id, communityId: communities[5].id, title: 'Cleanup Pantai Kenjeran Surabaya', description: 'Bersih-bersih pantai Kenjeran bersama komunitas. Semua alat kebersihan disediakan.', type: 'cleanup', address: 'Pantai Kenjeran, Surabaya', city: 'Surabaya', lat: -7.2575, lng: 112.7521, startDate: new Date('2026-10-05T06:00:00'), endDate: new Date('2026-10-05T11:00:00'), capacity: 150, participantCount: 63, status: 'upcoming', goalDescription: '200kg sampah dibersihkan', ecoKarmaReward: 35 },
      { createdById: dodi.id, communityId: communities[6].id, title: 'Upcycling Workshop - Botol Plastik jadi Dekorasi', description: 'Workshop membuat lampu dan pot dari botol plastik bekas. Bahan disediakan, peserta bawa semangat!', type: 'upcycling_workshop', address: 'Eco Hub Bali, Jl. Sunset Road No. 100', city: 'Denpasar', lat: -8.7190, lng: 115.1686, startDate: new Date('2026-10-03T14:00:00'), endDate: new Date('2026-10-03T18:00:00'), capacity: 30, participantCount: 21, status: 'upcoming', goalDescription: '60 item upcycled', ecoKarmaReward: 25 },
    ]);
    logger.info(`Created ${events.length} events`);

    // Event participants
    await EventParticipant.bulkCreate([
      { eventId: events[0].id, userId: dewi.id, status: 'joined' },
      { eventId: events[0].id, userId: maya.id, status: 'joined' },
      { eventId: events[1].id, userId: budi.id, status: 'joined' },
      { eventId: events[1].id, userId: rina.id, status: 'joined' },
      { eventId: events[1].id, userId: siti.id, status: 'joined' },
      { eventId: events[2].id, userId: hendra.id, status: 'joined' },
      { eventId: events[2].id, userId: budi.id, status: 'joined' },
      { eventId: events[3].id, userId: dodi.id, status: 'joined' },
      { eventId: events[3].id, userId: agus.id, status: 'joined' },
      { eventId: events[4].id, userId: rina.id, status: 'joined' },
    ]);

    // ── REPORTS ────────────────────────────────────────────────
    await Report.bulkCreate([
      { reporterId: rina.id, title: 'Sampah Elektronik Dibuang Sembarangan di Kali', description: 'Ada tumpukan TV rusak, kipas angin, dan komponen elektronik dibuang di pinggir Kali Ciliwung dekat Condet. Sangat berbahaya karena mengandung bahan kimia.', category: 'illegal_dumping', address: 'Kali Ciliwung, Condet, Jakarta Timur', city: 'Jakarta', lat: -6.2846, lng: 106.8751, upvotes: 34, status: 'under_review' },
      { reporterId: maya.id, title: 'TPS Penuh Tidak Diangkut 3 Hari', description: 'TPS di dekat pasar sudah penuh sejak 3 hari lalu dan belum diangkut. Bau menyengat dan mengundang lalat.', category: 'overflowing_waste', address: 'Pasar Beringharjo, Yogyakarta', city: 'Yogyakarta', lat: -7.8012, lng: 110.3651, upvotes: 18, status: 'reported' },
      { reporterId: dodi.id, title: 'Limbah Baterai dan Oli Bocor ke Tanah', description: 'Ada bengkel yang membuang oli bekas dan baterai rusak sembarangan. Tanah sekitar sudah tercemar.', category: 'hazardous_waste', address: 'Jl. Kuta Raya, Denpasar', city: 'Denpasar', lat: -8.7190, lng: 115.1800, upvotes: 27, status: 'verified' },
    ]);
    logger.info('Created reports');

    // ── BUSINESS MATERIALS ─────────────────────────────────────
    const bizMaterials = await BusinessMaterial.bulkCreate([
      { userId: agus.id, companyName: 'Bali Packaging Solutions', title: 'Surplus Kardus Double Wall 500kg/bulan', description: 'Kami produksi kemasan kardus. Setiap bulan ada sisa 400-600kg kardus double wall yang masih sangat kuat. Gratis untuk yang mau ambil sendiri.', materialType: 'cardboard', quantity: 500, unit: 'kg', frequency: 'monthly', city: 'Denpasar', province: 'Bali', isFree: true, status: 'listed', contactEmail: 'agus@ecoloop.com', contactPhone: '+6281234567895' },
      { userId: hendra.id, companyName: 'Hendra Recycling', title: 'Granul Plastik HDPE Hasil Daur Ulang', description: 'Granul plastik HDPE hasil proses daur ulang kami. Cocok untuk industri plastik yang butuh bahan baku sekunder.', materialType: 'plastic', quantity: 200, unit: 'kg', frequency: 'weekly', city: 'Bandung', province: 'Jawa Barat', isFree: false, price: 8000, status: 'listed', contactEmail: 'hendra@ecoloop.com', contactPhone: '+6281234567897' },
      { userId: fajar.id, companyName: 'Jakarta Green Hub', title: 'Pallet Kayu Bekas Kondisi Baik', description: 'Pallet kayu bekas dari gudang logistik. Kondisi masih bagus, bisa dipakai ulang atau dijadikan furnitur/kerajinan.', materialType: 'wood', quantity: 50, unit: 'pcs', frequency: 'one_time', city: 'Jakarta', province: 'DKI Jakarta', isFree: false, price: 15000, status: 'listed', contactEmail: 'fajar@ecoloop.com' },
      { userId: rina.id, companyName: 'Batik Condet Workshop', title: 'Kain Perca Batik Premium 30kg', description: 'Sisa potongan kain batik premium dari workshop kami. Cocok untuk kerajinan, patchwork, atau produk fashion upcycle.', materialType: 'textile', quantity: 30, unit: 'kg', frequency: 'monthly', city: 'Jakarta', province: 'DKI Jakarta', isFree: false, price: 25000, status: 'listed', contactEmail: 'rina@ecoloop.com' },
      { userId: indah.id, companyName: 'Surabaya Tech Dismantler', title: 'PCB dan Komponen Elektronik Bekas', description: 'Hasil dismantling perangkat elektronik. Ada PCB, kapasitor, resistor, dan komponen lain. Untuk penelitian atau refurbish.', materialType: 'electronics', quantity: 15, unit: 'kg', frequency: 'weekly', city: 'Surabaya', province: 'Jawa Timur', isFree: false, price: 50000, status: 'listed', contactEmail: 'indah@ecoloop.com' },
      { userId: budi.id, companyName: 'Startup Budi', title: 'Kemasan Bubble Wrap Bekas 20kg', description: 'Bubble wrap bekas dari pengiriman, masih bisa dipakai untuk packing lagi. Gratis, ambil sendiri.', materialType: 'packaging', quantity: 20, unit: 'kg', frequency: 'one_time', city: 'Jakarta', province: 'DKI Jakarta', isFree: true, status: 'listed', contactEmail: 'budi.demo@ecoloop.com' },
      { userId: dodi.id, companyName: 'Bali Craft Studio', title: 'Serbuk Gergaji Kayu Jati 100kg', description: 'Serbuk gergaji dari workshop furniture kami. Cocok untuk kompos, alas kandang hewan, atau briquette.', materialType: 'wood', quantity: 100, unit: 'kg', frequency: 'weekly', city: 'Denpasar', province: 'Bali', isFree: true, status: 'listed', contactEmail: 'dodi@ecoloop.com' },
      { userId: maya.id, companyName: 'Jogja Organic Farm', title: 'Kompos Matang Kualitas Premium', description: 'Produksi kompos skala kecil dari sampah organik terpilah. Dijual untuk petani urban atau pelanggan ritel.', materialType: 'other', quantity: 500, unit: 'kg', frequency: 'monthly', city: 'Yogyakarta', province: 'DI Yogyakarta', isFree: false, price: 3000, status: 'listed', contactEmail: 'maya@ecoloop.com' },
      { userId: siti.id, companyName: 'Bandung Fashion Recycle', title: 'Botol Plastik PET Bersih Terpress', description: 'Botol plastik PET sudah dipilah, dicuci, dan di-press. Siap untuk daur ulang atau pengolahan lanjutan.', materialType: 'plastic', quantity: 300, unit: 'kg', frequency: 'monthly', city: 'Bandung', province: 'Jawa Barat', isFree: false, price: 2500, status: 'listed', contactEmail: 'siti@ecoloop.com' },
      { userId: agus.id, companyName: 'Bali Hotel Supply', title: 'Linen Hotel Bekas - Masih Layak', description: 'Sprei, handuk, dan linen hotel bekas dalam kondisi baik. Cocok untuk panti asuhan, pondok pesantren, atau diubah menjadi kain lap.', materialType: 'textile', quantity: 80, unit: 'kg', frequency: 'one_time', city: 'Denpasar', province: 'Bali', isFree: true, status: 'listed', contactEmail: 'agus.hotel@ecoloop.com' },
    ]);
    logger.info(`Created ${bizMaterials.length} business materials`);

    // ── ECOKARMA LOGS ──────────────────────────────────────────
    await EcoKarma.bulkCreate([
      { userId: budi.id, points: 20, reason: 'recycling_deposit', description: 'Deposited 5kg of plastic' },
      { userId: budi.id, points: 15, reason: 'item_reuse', description: 'Gave away laptop' },
      { userId: budi.id, points: 5, reason: 'community_contribution', description: 'Active community member' },
      { userId: siti.id, points: 20, reason: 'recycling_deposit', description: 'Deposited 8.5kg of cardboard' },
      { userId: siti.id, points: 25, reason: 'event_completed', description: 'Joined Zero Waste event' },
      { userId: hendra.id, points: 30, reason: 'material_exchange', description: 'Completed plastic exchange' },
      { userId: indah.id, points: 20, reason: 'recycling_deposit', description: 'Deposited e-waste 3.5kg' },
      { userId: eko.id, points: 20, reason: 'repair_completed', description: 'Completed repair job' },
    ]);

    // ── SUMMARY ────────────────────────────────────────────────
    logger.info('╔══════════════════════════════════════════╗');
    logger.info('║         SEEDING COMPLETE!  v2.0          ║');
    logger.info('╠══════════════════════════════════════════╣');
    logger.info('║  LOGIN CREDENTIALS:                      ║');
    logger.info('║  demo@ecoloop.com   / demo123 (user)     ║');
    logger.info('║  admin@ecoloop.com  / admin123 (admin)   ║');
    logger.info('║  eko@ecoloop.com    / demo123 (repair)   ║');
    logger.info('║  agus@ecoloop.com   / demo123 (business) ║');
    logger.info('╠══════════════════════════════════════════╣');
    logger.info(`║  ${users.length} users · ${communities.length} communities · ${posts.length} posts    ║`);
    logger.info(`║  ${listings.length} listings · ${locations.length} locations · ${providers.length} providers ║`);
    logger.info(`║  ${challenges.length} challenges · ${events.length} events               ║`);
    logger.info('╚══════════════════════════════════════════╝');
    process.exit(0);
  } catch (error) {
    logger.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedData();
