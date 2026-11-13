'use client';

import { useEffect, useState } from 'react';

export type ApplicantTargetRole = 'seller' | 'distributor' | 'service_provider';
export type ApplicationStatus =
  | 'pending_review'
  | 'need_revision'
  | 'approved'
  | 'rejected'
  | 'suspended'
  | 'blacklisted';

export type SupportingFileType = 'image' | 'pdf';

export interface AdminSupportingFile {
  id: string;
  label: string;
  fileName: string;
  fileType: SupportingFileType;
  fileSize: string;
  documentNumber: string;
  issuer: string;
  issuedDate: string;
  validUntil: string;
  applicantOrOwner: string;
  businessName: string;
  address: string;
  verificationMatchSummary: string;
  isDataMatching: boolean;
  /** Digunakan apabila fileType === 'image' (ditampilkan langsung di modal Dashboard Admin) */
  imageUrl?: string;
  imageCaption?: string;
  /** Digunakan apabila fileType === 'pdf' (dibuka di Tab Baru terisolasi untuk memeriksa isi dokumen) */
  pdfSections?: {
    heading: string;
    content: string[];
  }[];
}

export interface MemberUpgradeApplication {
  id: string;
  memberName: string;
  memberEmail: string;
  memberJoinedAt: string;
  targetRole: ApplicantTargetRole;
  proposedBusinessName: string;
  region: string;
  commodityFocus: string;
  ktpNumber: string;
  /** NIK bersih 16 digit untuk pengecekan Blacklist */
  rawNik?: string;
  npwpNumber: string;
  nibNumber: string;
  legalityDocuments: string[];
  supportingFiles: AdminSupportingFile[];
  warehouseOrStoreAddress: string;
  submittedAt: string;
  status: ApplicationStatus;
  adminNotes: string;
  /** Pillar 1: Siklus hidup akun, pembekuan, blacklist NIK/NPWP & retensi 2 tahun */
  isBlacklistedNikNpwp?: boolean;
  blacklistReason?: string;
  suspendedReason?: string;
  dataRetentionDueAt: string;
  retentionAlertStatus: 'ok' | 'due_soon' | 'overdue';
  /** Pillar 4 & 5: Proteksi Undo Approval & pengalihan tiket antar staf Admin */
  hasTransactions: boolean;
  approvedAt?: string;
  approvedBy?: string;
  assignedAdminStaff: string;
}

export type ComplaintReporterRole = 'member' | 'seller' | 'distributor' | 'moderator';
export type ComplaintStatus = 'open' | 'in_mediation' | 'resolved' | 'escalated_legal';
export type SplitDecisionType =
  | 'none'
  | 'full_refund'
  | 'partial_split'
  | 'release_to_seller';
export type ForceOrderActionType = 'none' | 'force_completed' | 'force_cancelled';

export interface AdminComplaintTicket {
  id: string;
  ticketCode: string;
  /** Jalur masuk: komplain transaksi Member/Seller atau Eskalasi Pelanggaran dari Role Moderator */
  sourceType: 'member_seller_dispute' | 'moderator_escalation';
  reporterName: string;
  reporterRole: ComplaintReporterRole;
  reportedPartyName: string;
  reportedPartyRole: ComplaintReporterRole;
  orderOrContractRef: string;
  category:
    | 'Kerusakan / Ketidaksesuaian Barang'
    | 'Keterlambatan Konfirmasi / Pencairan'
    | 'Sengketa Kuota & Distribusi'
    | 'Pelanggaran Administrasi & Legalitas'
    | 'Eskalasi Pelanggaran Produk / Konten (Moderator)';
  subject: string;
  chronology: string;
  evidenceSummary: string;
  supportingFiles: AdminSupportingFile[];
  createdAt: string;
  status: ComplaintStatus;
  resolutionDecision: string;
  /** Pillar 2: Nilai sengketa escrow, keputusan Split Decision & Force Order */
  escrowAmountRp: number;
  splitDecisionType: SplitDecisionType;
  refundBuyerAmountRp: number;
  releaseSellerAmountRp: number;
  forceOrderAction: ForceOrderActionType;
  /** Pillar 4 & 5: Hold Payout sementara & PIC Staf Admin */
  escrowHoldActive: boolean;
  assignedAdminStaff: string;
}

export interface PartnerLegalDocumentRecord {
  id: string;
  partnerName: string;
  partnerRole: 'seller' | 'distributor';
  region: string;
  nibStatus: 'valid' | 'expiring_soon' | 'incomplete';
  contractNumber: string;
  certificationList: string[];
  supportingFiles: AdminSupportingFile[];
  lastVerifiedAt: string;
  adminStatus: 'verified' | 'under_audit' | 'suspended' | 'blacklisted';
  notes: string;
  /** Pillar 1 & 4: Pengingat pembaruan data/alamat siklus 2 tahun & Hold Payout */
  dataRetentionDueAt: string;
  retentionAlertStatus: 'ok' | 'due_soon' | 'overdue';
  retentionReminderSentAt?: string;
  escrowHoldActive: boolean;
  assignedAdminStaff: string;
}

/** Pillar 3: Tata Kelola Dokumen B2B, Checkbox Approval Log, Custom Fee & Validasi Armada STNK/KIR */
export interface B2BCheckboxApprovalLog {
  approvedByName: string;
  approvedByRole: string;
  approvedAt: string;
  ipAddress: string;
  documentVersion: string;
  agreementText: string;
  verifiedByAdmin: boolean;
}

export interface B2BAndRentalRecord {
  id: string;
  referenceCode: string;
  governanceType: 'b2b_contract' | 'fleet_rental';
  partnerName: string;
  partnerRole: 'seller' | 'distributor' | 'service-provider';
  region: string;
  title: string;
  submittedAt: string;
  /** Custom Fee Override (di luar tarif standar 5%) */
  standardFeePercent: number;
  customFeePercent: number;
  additionalServiceFeeRp: number;
  feeOverrideReason: string;
  feeOverrideLocked: boolean;
  /** Persetujuan Digital tanpa tanda tangan basah */
  checkboxApprovalLog: B2BCheckboxApprovalLog;
  /** Khusus Sewa Armada (Pickup / Truk): Validasi STNK & KIR */
  vehiclePlate?: string;
  vehicleType?: string;
  stnkNumber?: string;
  stnkExpiry?: string;
  stnkStatus?: 'active' | 'expired';
  kirNumber?: string;
  kirExpiry?: string;
  kirStatus?: 'active' | 'expired';
  status: 'pending_review' | 'approved' | 'need_revision' | 'rejected';
  assignedAdminStaff: string;
  adminNotes: string;
  supportingFiles: AdminSupportingFile[];
}

/** Template Draf Formulir PDF Bantuan B2B / Sewa yang dikelola Admin */
export interface B2BTemplateDocument {
  id: string;
  title: string;
  version: string;
  updatedAt: string;
  updatedBy: string;
  pdfFile: AdminSupportingFile;
}

/** Pillar 4: Pengaman Dana Escrow Mitra */
export interface PartnerEscrowGuardRecord {
  id: string;
  partnerName: string;
  partnerRole: 'seller' | 'distributor' | 'service-provider';
  escrowBalanceRp: number;
  pendingInvoiceCount: number;
  payoutStatus: 'normal' | 'held_investigation';
  holdReason: string;
  updatedAt: string;
  updatedBy: string;
}

/** Pillar 4: Validasi Trafik Royalti Penulis (Filter Indikasi Bot) */
export interface AuthorRoyaltyTrafficRecord {
  id: string;
  articleTitle: string;
  authorName: string;
  periodLabel: string;
  rawViews: number;
  botFlaggedViews: number;
  validViews: number;
  ratePerThousandViewsRp: number;
  estimatedRoyaltyRp: number;
  botDetectionNote: string;
  auditStatus: 'pending_filter' | 'bot_deducted_approved' | 'held_audit';
  reviewedBy?: string;
  reviewedAt?: string;
}

/** Pillar 5: Log Riwayat Permanen (Immutable Audit Trail) */
export interface AdminAuditTrailEntry {
  id: string;
  timestamp: string;
  adminStaff: string;
  category:
    | 'Siklus Akun & KYB'
    | 'Mediasi Sengketa & Force Order'
    | 'Eskalasi Moderator'
    | 'Legalitas & Retensi 2 Tahun'
    | 'Tata Kelola B2B & Armada'
    | 'Pengaman Escrow & Royalti'
    | 'Kontrol Antrean Sistem';
  targetEntity: string;
  actionLabel: string;
  previousState: string;
  newState: string;
  reason: string;
}

export const ADMIN_STAFF_LIST = [
  'Nadia Putri (Admin Administrasi Senior)',
  'Bagas Pratama (Admin KYB & Legalitas)',
  'Siti Rahma (Admin Mediasi & Sengketa)',
  'Rizky Maulana (Admin B2B & Armada)',
];

const UPGRADE_STORAGE_KEY = 'racik-admin-member-upgrades-v3';
const COMPLAINTS_STORAGE_KEY = 'racik-admin-complaints-v3';
const LEGAL_DOCS_STORAGE_KEY = 'racik-admin-legal-docs-v3';
const B2B_RENTAL_STORAGE_KEY = 'racik-admin-b2b-rental-v3';
const B2B_TEMPLATES_STORAGE_KEY = 'racik-admin-b2b-templates-v3';
const ESCROW_GUARD_STORAGE_KEY = 'racik-admin-escrow-guard-v3';
const ROYALTY_TRAFFIC_STORAGE_KEY = 'racik-admin-royalty-traffic-v3';
const AUDIT_TRAIL_STORAGE_KEY = 'racik-admin-audit-trail-v3';
const ACTIVE_STAFF_STORAGE_KEY = 'racik-admin-active-staff-v3';
const ADMIN_UPDATE_EVENT = 'racik-admin-administration-updated';

function formatNowWib(): string {
  try {
    const now = new Date();
    return (
      now.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }) +
      ' • ' +
      now.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
      }) +
      ' WIB'
    );
  } catch {
    return 'Hari ini • WIB';
  }
}

export const INITIAL_MEMBER_UPGRADES: MemberUpgradeApplication[] = [
  {
    id: 'upg-01',
    memberName: 'Hendra Wijaya',
    memberEmail: 'hendra.kopi@nusantara.id',
    memberJoinedAt: '12 Jan 2025',
    targetRole: 'seller',
    proposedBusinessName: 'Roastery & Kebun Kopi Gayo Lestari',
    region: 'Takengon, Aceh Tengah',
    commodityFocus: 'Kopi Arabika Spesialti & Rempah Dataran Tinggi',
    ktpNumber: '1104021805880002 (Terverifikasi Dukcapil)',
    rawNik: '1104021805880002',
    npwpNumber: '84.219.441.2-101.000',
    nibNumber: 'NIB-9120300481921',
    legalityDocuments: [
      'KTP Penanggung Jawab (Gambar)',
      'Foto Kebun & Tempat Sangrai (Gambar)',
      'NIB OSS Berbasis Risiko (PDF)',
      'NPWP Usaha / Pribadi (PDF)',
      'Sertifikat PIRT & Uji Mutu Kopi (PDF)',
    ],
    supportingFiles: [
      {
        id: 'doc-upg01-ktp-img',
        label: 'KTP Penanggung Jawab',
        fileName: 'KTP_Hendra_Wijaya_1104021805880002.jpg',
        fileType: 'image',
        fileSize: '840 KB',
        documentNumber: 'NIK: 1104021805880002',
        issuer: 'Disdukcapil Kab. Aceh Tengah',
        issuedDate: '18 Mei 2021',
        validUntil: 'Seumur Hidup',
        applicantOrOwner: 'Hendra Wijaya',
        businessName: 'Roastery & Kebun Kopi Gayo Lestari',
        address: 'Jl. Lebe Kader No. 18, Kec. Bebesen, Kab. Aceh Tengah',
        verificationMatchSummary:
          'NIK 1104021805880002, nama Hendra Wijaya, dan alamat di KTP sesuai 100% dengan formulir pengajuan Seller.',
        isDataMatching: true,
        imageUrl:
          'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1000&q=80',
        imageCaption:
          'Lampiran Foto Identitas KTP Penanggung Jawab & Kartu Verifikasi Pemilik Usaha (Hendra Wijaya — NIK 1104021805880002).',
      },
      {
        id: 'doc-upg01-kebun-img',
        label: 'Foto Kebun & Tempat Sangrai (Roastery)',
        fileName: 'Foto_Roastery_Kopi_Gayo_Takengon.jpg',
        fileType: 'image',
        fileSize: '1.4 MB',
        documentNumber: 'LOK-ROASTERY-ACEH-01',
        issuer: 'Dokumentasi Lapangan Pemohon',
        issuedDate: '10 Nov 2026',
        validUntil: 'Aktif',
        applicantOrOwner: 'Hendra Wijaya',
        businessName: 'Roastery & Kebun Kopi Gayo Lestari',
        address: 'Jl. Lebe Kader No. 18, Kec. Bebesen, Kab. Aceh Tengah',
        verificationMatchSummary:
          'Foto fasilitas mesin roastery, gudang penyimpanan green bean, dan papan nama usaha sesuai dengan alamat pengajuan.',
        isDataMatching: true,
        imageUrl:
          'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1000&q=80',
        imageCaption:
          'Dokumentasi Fisik Tempat Sangrai (Roastery) & Gudang Penyimpanan Biji Kopi Arabika Gayo di Takengon, Aceh Tengah.',
      },
      {
        id: 'doc-upg01-nib-pdf',
        label: 'NIB OSS Berbasis Risiko.pdf',
        fileName: 'NIB_OSS_9120300481921_Gayo_Lestari.pdf',
        fileType: 'pdf',
        fileSize: '620 KB',
        documentNumber: 'NIB-9120300481921',
        issuer: 'Kementerian Investasi / BKPM — Lembaga OSS Republik Indonesia',
        issuedDate: '14 Maret 2024',
        validUntil: 'Berlaku Selama Menjalankan Kegiatan Usaha',
        applicantOrOwner: 'Hendra Wijaya',
        businessName: 'Roastery & Kebun Kopi Gayo Lestari',
        address: 'Jl. Lebe Kader No. 18, Kec. Bebesen, Kab. Aceh Tengah, Provinsi Aceh',
        verificationMatchSummary:
          'Nomor NIB-9120300481921 terdaftar aktif dengan KBLI 10761 (Industri Pengolahan Kopi dan Teh) & KBLI 47212 (Perdagangan Eceran Hasil Pertanian).',
        isDataMatching: true,
        pdfSections: [
          {
            heading: 'I. IDENTITAS PELAKU USAHA & NOMOR INDUK BERUSAHA (NIB)',
            content: [
              'Nomor Induk Berusaha (NIB) : 9120300481921',
              'Nama Usaha / Entitas       : ROASTERY & KEBUN KOPI GAYO LESTARI',
              'Penanggung Jawab / Pemilik : HENDRA WIJAYA (NIK: 1104021805880002)',
              'NPWP Terdaftar             : 84.219.441.2-101.000',
              'Alamat Lokasi Usaha        : Jl. Lebe Kader No. 18, Kec. Bebesen, Kab. Aceh Tengah',
              'Status Penanaman Modal     : PMDN — Usaha Mikro / Kecil (UMK)',
            ],
          },
          {
            heading: 'II. KLASIFIKASI BAKU LAPANGAN USAHA INDONESIA (KBLI)',
            content: [
              '1. KBLI 10761 — Industri Pengolahan Kopi (Penyangraian, Penggilingan & Pengemasan Kopi Arabika)',
              '2. KBLI 47212 — Perdagangan Eceran Hasil Pertanian & Rempah Nusantara',
              'Tingkat Risiko Usaha : Rendah — Menengah Rendah (Telah Memenuhi Komitmen Standar Usaha)',
            ],
          },
          {
            heading: 'III. PENGESAHAN ELEKTRONIK OSS',
            content: [
              'Dokumen NIB ini diterbitkan secara elektronik melalui sistem Online Single Submission (OSS) Republik Indonesia.',
              'Hasil Pengecekan Silang Admin : DATA NIB, NIK KTP, DAN ALAMAT USAHA SESUAI DENGAN PENGAJUAN SELLER.',
            ],
          },
        ],
      },
      {
        id: 'doc-upg01-pirt-pdf',
        label: 'Sertifikat PIRT & Uji Mutu Kopi.pdf',
        fileName: 'SPP_IRT_dan_Uji_Mutu_Kopi_Gayo.pdf',
        fileType: 'pdf',
        fileSize: '910 KB',
        documentNumber: 'P-IRT 5101104010082-28',
        issuer: 'Dinas Kesehatan Kab. Aceh Tengah & Laboratorium Uji Mutu Kopi',
        issuedDate: '22 Juni 2024',
        validUntil: '22 Juni 2029',
        applicantOrOwner: 'Hendra Wijaya',
        businessName: 'Roastery & Kebun Kopi Gayo Lestari',
        address: 'Jl. Lebe Kader No. 18, Kec. Bebesen, Kab. Aceh Tengah',
        verificationMatchSummary:
          'Sertifikat P-IRT 5101104010082-28 aktif dan hasil uji kadar air biji kopi memenuhi standar SNI 01-2907-2008.',
        isDataMatching: true,
        pdfSections: [
          {
            heading: 'I. SERTIFIKAT PRODUKSI PANGAN INDUSTRI RUMAH TANGGA (SPP-IRT)',
            content: [
              'Nomor P-IRT          : 5101104010082-28',
              'Jenis Pangan         : Kopi Biji Sangrai (Roasted Bean) & Kopi Bubuk Murni Arabika Gayo',
              'Kemasan Primer       : Aluminium Foil Gusset dengan One-Way Degassing Valve (250g, 500g, 1Kg)',
              'Nama Produsen        : Roastery & Kebun Kopi Gayo Lestari (Hendra Wijaya)',
            ],
          },
          {
            heading: 'II. HASIL UJI LABORATORIUM & ORGANOLEPTIK (SNI 01-2907-2008)',
            content: [
              '• Kadar Air Biji Sangrai : 3,8% (Batas Maksimum SNI: 7,0%) — LULUS',
              '• Kadar Abu              : 4,1% (Batas Maksimum SNI: 5,0%) — LULUS',
              '• Cemaran Mikroba & Kapang : Negatif / Di Bawah Ambang Batas Aman — LULUS',
              '• Cupping Score (SCA)    : 84.75 (Specialty Grade Arabica Gayo)',
            ],
          },
        ],
      },
    ],
    warehouseOrStoreAddress: 'Jl. Lebe Kader No. 18, Kec. Bebesen, Kab. Aceh Tengah',
    submittedAt: 'Hari ini • 09:15 WIB',
    status: 'pending_review',
    adminNotes: 'Dokumen NIB dan PIRT lengkap, menunggu persetujuan akhir Admin Administrasi.',
    dataRetentionDueAt: '11 Nov 2028',
    retentionAlertStatus: 'ok',
    hasTransactions: false,
    assignedAdminStaff: 'Nadia Putri (Admin Administrasi Senior)',
  },
  {
    id: 'upg-02',
    memberName: 'PT Lumbung Pangan Nusantara (Wakil: Rina Kusuma)',
    memberEmail: 'logistik@lumbungpangan.co.id',
    memberJoinedAt: '03 Feb 2025',
    targetRole: 'distributor',
    proposedBusinessName: 'Distribusi Logistik Agrikultur Jawa Timur',
    region: 'Surabaya & Malang, Jawa Timur',
    commodityFocus: 'Distribusi Pupuk Organik, Beras Organik & Hasil Tani Partai Besar',
    ktpNumber: '3578045209850004 (Terverifikasi)',
    rawNik: '3578045209850004',
    npwpNumber: '02.918.772.1-609.000',
    nibNumber: 'NIB-8192004918234',
    legalityDocuments: [
      'Foto Gudang & Armada Cold Storage (Gambar)',
      'Akta Pendirian & SK Kemenkumham (PDF)',
      'NPWP Badan Usaha PKP (PDF)',
      'NIB & Izin Gudang Distribusi (PDF)',
    ],
    supportingFiles: [
      {
        id: 'doc-upg02-gudang-img',
        label: 'Foto Gudang & Armada Distribusi',
        fileName: 'Gudang_Margomulyo_Blok_D14_Surabaya.jpg',
        fileType: 'image',
        fileSize: '1.6 MB',
        documentNumber: 'GUDANG-JATIM-D14',
        issuer: 'Inspeksi Visual PT Lumbung Pangan Nusantara',
        issuedDate: '09 Nov 2026',
        validUntil: 'Aktif',
        applicantOrOwner: 'PT Lumbung Pangan Nusantara (Wakil: Rina Kusuma)',
        businessName: 'Distribusi Logistik Agrikultur Jawa Timur',
        address: 'Kawasan Pergudangan Margomulyo Permai Blok D-14, Surabaya',
        verificationMatchSummary:
          'Foto gudang penyimpanan berkapasitas 250 ton dan 6 unit armada truk boks sesuai dengan data pengajuan Distributor Regional.',
        isDataMatching: true,
        imageUrl:
          'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1000&q=80',
        imageCaption:
          'Foto Fisik Gudang Distribusi Margomulyo Permai Blok D-14 Surabaya & Armada Logistik PT Lumbung Pangan Nusantara.',
      },
      {
        id: 'doc-upg02-akta-pdf',
        label: 'Akta Pendirian & SK Kemenkumham.pdf',
        fileName: 'SK_Kemenkumham_PT_Lumbung_Pangan_Nusantara.pdf',
        fileType: 'pdf',
        fileSize: '1.1 MB',
        documentNumber: 'AHU-0049182.AH.01.01.TAHUN 2022',
        issuer: 'Kementerian Hukum dan HAM Republik Indonesia',
        issuedDate: '12 Agustus 2022',
        validUntil: 'Berlaku Selama Perseroan Berdiri',
        applicantOrOwner: 'Rina Kusuma (Direktur Operasional)',
        businessName: 'PT Lumbung Pangan Nusantara',
        address: 'Kawasan Pergudangan Margomulyo Permai Blok D-14, Surabaya',
        verificationMatchSummary:
          'SK Kemenkumham AHU-0049182 sah. Rina Kusuma (NIK 3578045209850004) tercantum resmi sebagai Direktur yang berwenang menandatangani kemitraan distribusi.',
        isDataMatching: true,
        pdfSections: [
          {
            heading: 'I. KEPUTUSAN MENTERI HUKUM DAN HAK ASASI MANUSIA RI',
            content: [
              'Nomor SK Pengesahan : AHU-0049182.AH.01.01.TAHUN 2022',
              'Nama Perseroan      : PT LUMBUNG PANGAN NUSANTARA',
              'Kedudukan           : Kota Surabaya, Provinsi Jawa Timur',
              'Akta Notaris        : No. 28 Tanggal 08 Agustus 2022 (Notaris Dr. Hendro Wibowo, S.H., M.Kn.)',
            ],
          },
          {
            heading: 'II. SUSUNAN PENGURUS & KEWENANGAN DIREKSI',
            content: [
              '• Direktur Operasional : RINA KUSUMA (NIK: 3578045209850004)',
              '• Bidang Usaha Utama   : Perdagangan Besar Hasil Pertanian, Pergudangan & Distribusi Logistik Antarwilayah',
              '• Status Verifikasi    : SESUAI DENGAN DATA PENGAJUAN DISTRIBUTOR.',
            ],
          },
        ],
      },
      {
        id: 'doc-upg02-nib-pdf',
        label: 'NIB & Izin Gudang Distribusi.pdf',
        fileName: 'NIB_8192004918234_Izin_Gudang_Distribusi.pdf',
        fileType: 'pdf',
        fileSize: '780 KB',
        documentNumber: 'NIB-8192004918234 / TDG-3578-2024',
        issuer: 'Lembaga OSS & Dinas Perdagangan Kota Surabaya',
        issuedDate: '04 Februari 2024',
        validUntil: '04 Februari 2029',
        applicantOrOwner: 'PT Lumbung Pangan Nusantara',
        businessName: 'Distribusi Logistik Agrikultur Jawa Timur',
        address: 'Kawasan Pergudangan Margomulyo Permai Blok D-14, Surabaya',
        verificationMatchSummary:
          'Tanda Daftar Gudang (TDG) dan NIB-8192004918234 sesuai dengan titik koordinat gudang Margomulyo Blok D-14.',
        isDataMatching: true,
        pdfSections: [
          {
            heading: 'I. RINCIAN NIB & TANDA DAFTAR GUDANG (TDG)',
            content: [
              'Nomor Induk Berusaha : 8192004918234',
              'Nomor NPWP Badan     : 02.918.772.1-609.000 (PKP Aktif)',
              'KBLI Terdaftar       : 52101 (Pergudangan dan Penyimpanan) & 46201 (Perdagangan Besar Padi dan Palawija)',
              'Luas & Kapasitas     : 1.200 m² (Kapasitas Simpan 250 Ton + Ruang Pendingin Terkontrol)',
            ],
          },
          {
            heading: 'II. DAFTAR ARMADA DISTRIBUSI TERVERIFIKASI',
            content: [
              '• 4 Unit Truk CDD Box Kapasitas 8 Ton (Rute Jawa Timur & Bali)',
              '• 2 Unit Truk Cold Box Berpendingin (Khusus Komoditas Hortikultura Segar)',
              '• Sistem Pelacakan   : GPS Telemetry Terintegrasi',
            ],
          },
        ],
      },
    ],
    warehouseOrStoreAddress: 'Kawasan Pergudangan Margomulyo Permai Blok D-14, Surabaya',
    submittedAt: 'Hari ini • 11:20 WIB',
    status: 'pending_review',
    adminNotes: 'Kapasitas gudang distribusi memenuhi syarat mitra Distributor Regional.',
    dataRetentionDueAt: '11 Nov 2028',
    retentionAlertStatus: 'ok',
    hasTransactions: false,
    assignedAdminStaff: 'Bagas Pratama (Admin KYB & Legalitas)',
  },
  {
    id: 'upg-03',
    memberName: 'Yohana Bria',
    memberEmail: 'yohana.tenun@flores.id',
    memberJoinedAt: '20 Mar 2025',
    targetRole: 'seller',
    proposedBusinessName: 'Galeri Tenun Ikat Pewarna Alam Sikka',
    region: 'Maumere, Kab. Sikka, NTT',
    commodityFocus: 'Kriya Tenun Ikat Tradisional & Benang Kapas Lokal',
    ktpNumber: '5307054102900001 (Terverifikasi)',
    rawNik: '5307054102900001',
    npwpNumber: '71.402.118.9-922.000',
    nibNumber: 'Sementara Proses Unggah Lampiran ke-2',
    legalityDocuments: [
      'Foto Studio Tenun & Pewarnaan Alam (Gambar)',
      'Surat Keterangan Usaha Desa / Komunitas Adat (PDF)',
    ],
    supportingFiles: [
      {
        id: 'doc-upg03-studio-img',
        label: 'Foto Studio Tenun & Pewarnaan Alam',
        fileName: 'Studio_Tenun_Ikat_Watublapi_Sikka.jpg',
        fileType: 'image',
        fileSize: '1.1 MB',
        documentNumber: 'DOK-STUDIO-SIKKA-03',
        issuer: 'Komunitas Penenun Desa Watublapi',
        issuedDate: '08 Nov 2026',
        validUntil: 'Aktif',
        applicantOrOwner: 'Yohana Bria',
        businessName: 'Galeri Tenun Ikat Pewarna Alam Sikka',
        address: 'Desa Watublapi, Kec. Hewokloang, Kab. Sikka, NTT',
        verificationMatchSummary:
          'Foto alat tenun gedogan dan proses pencelupan warna alam (indigofera & mengkudu) asli milik kelompok pengrajin.',
        isDataMatching: true,
        imageUrl:
          'https://images.unsplash.com/photo-1606722590583-6951b5ea92ad?w=1000&q=80',
        imageCaption:
          'Foto Studio Tenun Ikat Pewarna Alam Sikka & Kelompok Pengrajin Desa Watublapi, Maumere, NTT.',
      },
      {
        id: 'doc-upg03-sku-pdf',
        label: 'Surat Keterangan Usaha Desa.pdf',
        fileName: 'SKU_Desa_Watublapi_Yohana_Bria_Hal1.pdf',
        fileType: 'pdf',
        fileSize: '490 KB',
        documentNumber: '470/SKU-WTB/XI/2026',
        issuer: 'Pemerintah Desa Watublapi, Kec. Hewokloang, Kab. Sikka',
        issuedDate: '05 November 2026',
        validUntil: '05 November 2027',
        applicantOrOwner: 'Yohana Bria',
        businessName: 'Galeri Tenun Ikat Pewarna Alam Sikka',
        address: 'Desa Watublapi, Kec. Hewokloang, Kab. Sikka, NTT',
        verificationMatchSummary:
          'PERHATIAN ADMIN: Halaman 1 memuat identitas Yohana Bria dengan benar, namun lampiran halaman 2 (daftar anggota kelompok tenun & stempel basah kepala desa) belum terlampir.',
        isDataMatching: false,
        pdfSections: [
          {
            heading: 'I. SURAT KETERANGAN USAHA KRIYA ADAT (HALAMAN 1 DARI 2)',
            content: [
              'Nomor Surat       : 470/SKU-WTB/XI/2026',
              'Nama Pemohon      : YOHANA BRIA (NIK: 5307054102900001)',
              'Nama Usaha Kriya  : GALERI TENUN IKAT PEWARNA ALAM SIKKA',
              'Alamat Lokasi     : Desa Watublapi, Kec. Hewokloang, Kab. Sikka, Provinsi NTT',
            ],
          },
          {
            heading: 'II. CATATAN KETIDAKSESUAIAN / KEKURANGAN BERKAS (TEMUAN ADMIN)',
            content: [
              '• Halaman 2 yang memuat Daftar 12 Penenun Anggota Kelompok dan Tanda Tangan/Stempel Kepala Desa terpotong saat pemindaian.',
              '• Rekomendasi Tindakan Admin: Klik "Minta Revisi Berkas (Pending Revision)" tanpa membatalkan pendaftaran agar pemohon mengunggah ulang halaman 2.',
            ],
          },
        ],
      },
    ],
    warehouseOrStoreAddress: 'Desa Watublapi, Kec. Hewokloang, Kab. Sikka, NTT',
    submittedAt: 'Kemarin • 16:40 WIB',
    status: 'need_revision',
    adminNotes: 'Mohon lengkapi foto halaman kedua Surat Keterangan Usaha Komunitas.',
    dataRetentionDueAt: '10 Nov 2028',
    retentionAlertStatus: 'ok',
    hasTransactions: false,
    assignedAdminStaff: 'Bagas Pratama (Admin KYB & Legalitas)',
  },
  {
    id: 'upg-04',
    memberName: 'Koperasi Tani Subur Makmur',
    memberEmail: 'admin@tanisubur.id',
    memberJoinedAt: '10 Des 2024',
    targetRole: 'seller',
    proposedBusinessName: 'Sentra Pupuk & Kompos Organik Lembang',
    region: 'Lembang, Bandung Barat',
    commodityFocus: 'Pupuk Organik Cair, Kompos Fermentasi & Bibit Hortikultura',
    ktpNumber: '3217011408790003 (Terverifikasi)',
    rawNik: '3217011408790003',
    npwpNumber: '01.554.889.0-421.000',
    nibNumber: 'NIB-9001283910021',
    legalityDocuments: [
      'Foto Rumah Kompos & Instalasi Fermentasi (Gambar)',
      'Akta Koperasi & Izin Edar Kementan (PDF)',
      'Hasil Uji Lab Kandungan C-Organik (PDF)',
    ],
    supportingFiles: [
      {
        id: 'doc-upg04-kompos-img',
        label: 'Foto Rumah Kompos & Instalasi Fermentasi',
        fileName: 'Instalasi_Kompos_Organik_Lembang.jpg',
        fileType: 'image',
        fileSize: '1.3 MB',
        documentNumber: 'LOK-LEMBANG-88',
        issuer: 'Koperasi Tani Subur Makmur',
        issuedDate: '01 Nov 2026',
        validUntil: 'Aktif',
        applicantOrOwner: 'Koperasi Tani Subur Makmur',
        businessName: 'Sentra Pupuk & Kompos Organik Lembang',
        address: 'Jl. Raya Tangkuban Parahu No. 88, Lembang, Bandung Barat',
        verificationMatchSummary:
          'Fasilitas pengolahan kompos organik dan gudang karung siap kirim terverifikasi sesuai standar.',
        isDataMatching: true,
        imageUrl:
          'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=1000&q=80',
        imageCaption:
          'Instalasi Pengolahan Pupuk Organik & Kebun Bibit Koperasi Tani Subur Makmur di Lembang, Bandung Barat.',
      },
      {
        id: 'doc-upg04-ujilab-pdf',
        label: 'Hasil Uji Lab Kandungan C-Organik.pdf',
        fileName: 'Sertifikat_Uji_Lab_Pupuk_Organik_Lembang.pdf',
        fileType: 'pdf',
        fileSize: '710 KB',
        documentNumber: 'LAB-BPTP-JB/2026/0912',
        issuer: 'Balai Pengujian Standar Instrumen Tanah dan Pupuk',
        issuedDate: '19 September 2026',
        validUntil: '19 September 2028',
        applicantOrOwner: 'Koperasi Tani Subur Makmur',
        businessName: 'Sentra Pupuk & Kompos Organik Lembang',
        address: 'Jl. Raya Tangkuban Parahu No. 88, Lembang, Bandung Barat',
        verificationMatchSummary:
          'Kandungan C-Organik 18,4% dan rasio C/N 14,2 memenuhi standar mutu Permentan.',
        isDataMatching: true,
        pdfSections: [
          {
            heading: 'I. SERTIFIKAT HASIL UJI MUTU PUPUK ORGANIK PADAT & CAIR',
            content: [
              'Nomor Sertifikat Lab : LAB-BPTP-JB/2026/0912',
              'Nama Pemohon         : KOPERASI TANI SUBUR MAKMUR (NIB: 9001283910021)',
              'Parameter C-Organik  : 18,4% (Syarat Minimum: >= 15,0%) — SESUAI STANDAR',
              'Rasio C/N            : 14,2 (Rentang Standar: 12 – 25) — SESUAI STANDAR',
              'pH Pupuk             : 6,8 (Netral) — SESUAI STANDAR',
            ],
          },
        ],
      },
    ],
    warehouseOrStoreAddress: 'Jl. Raya Tangkuban Parahu No. 88, Lembang, Bandung Barat',
    submittedAt: '3 hari lalu',
    status: 'approved',
    adminNotes: 'Telah disetujui Admin menjadi Seller resmi. Seluruh dokumen legalitas sah.',
    dataRetentionDueAt: '20 Nov 2026 (Jatuh Tempo Siklus 2 Tahun)',
    retentionAlertStatus: 'due_soon',
    hasTransactions: false,
    approvedAt: '08 Nov 2026 • 10:15 WIB',
    approvedBy: 'Nadia Putri (Admin Administrasi Senior)',
    assignedAdminStaff: 'Nadia Putri (Admin Administrasi Senior)',
  },
  {
    id: 'upg-05',
    memberName: 'Darmawan Halim',
    memberEmail: 'darmawan.ex@mail.id',
    memberJoinedAt: '14 Sep 2024',
    targetRole: 'seller',
    proposedBusinessName: 'UD Berkah Pupuk Subsidi Mandiri',
    region: 'Brebes, Jawa Tengah',
    commodityFocus: 'Pupuk Kimia Non-Resmi / Tanpa Izin Edar',
    ktpNumber: '3329091003820007 (Terindikasi Manipulasi)',
    rawNik: '3329091003820007',
    npwpNumber: '66.912.334.5-501.000',
    nibNumber: 'NIB-0001928374651 (Tidak Aktif)',
    legalityDocuments: [
      'Dokumen Izin Edar Diduga Palsu (PDF)',
    ],
    supportingFiles: [
      {
        id: 'doc-upg05-audit-pdf',
        label: 'Berita Acara Pemblokiran NIK & NPWP.pdf',
        fileName: 'BA_Blacklist_NIK_NPWP_Darmawan_Halim.pdf',
        fileType: 'pdf',
        fileSize: '390 KB',
        documentNumber: 'BLK/RM-ADMIN/2026/011',
        issuer: 'Tim KYB & Legalitas Role Admin Racik Media',
        issuedDate: '06 Nov 2026',
        validUntil: 'Permanen (Daftar Hitam Nasional Platform)',
        applicantOrOwner: 'Darmawan Halim',
        businessName: 'UD Berkah Pupuk Subsidi Mandiri',
        address: 'Kab. Brebes, Jawa Tengah',
        verificationMatchSummary:
          'NIK 3329091003820007 dan NPWP 66.912.334.5-501.000 masuk Daftar Hitam (Blacklist) karena mencoba mengunggah izin edar pupuk bersubsidi yang dipalsukan.',
        isDataMatching: false,
        pdfSections: [
          {
            heading: 'I. KEPUTUSAN PEMBEKUAN & DAFTAR HITAM (BLACKLIST NIK/NPWP)',
            content: [
              'NIK Terblokir  : 3329091003820007',
              'NPWP Terblokir : 66.912.334.5-501.000',
              'Alasan Blokir  : Pelanggaran berat — pemalsuan dokumen edar pupuk bersubsidi.',
              'Dampak Sistem  : NIK dan NPWP ini ditolak otomatis oleh formulir pendaftaran Seller maupun Distributor baru.',
            ],
          },
        ],
      },
    ],
    warehouseOrStoreAddress: 'Jl. Pantura Km. 12, Brebes, Jawa Tengah',
    submittedAt: '5 hari lalu',
    status: 'blacklisted',
    adminNotes: 'Akun dibekukan permanen & NIK/NPWP masuk Daftar Hitam agar tidak dapat mendaftar ulang.',
    isBlacklistedNikNpwp: true,
    blacklistReason: 'Pemalsuan dokumen izin edar pupuk bersubsidi (Hasil Eskalasi Moderator).',
    dataRetentionDueAt: 'Arsip Blacklist Permanen',
    retentionAlertStatus: 'ok',
    hasTransactions: true,
    assignedAdminStaff: 'Bagas Pratama (Admin KYB & Legalitas)',
  },
];

export const INITIAL_COMPLAINTS: AdminComplaintTicket[] = [
  {
    id: 'cmp-01',
    ticketCode: 'KOMPLAIN-RM-401',
    sourceType: 'member_seller_dispute',
    reporterName: 'Ahmad Fauzi (Member / Pembeli)',
    reporterRole: 'member',
    reportedPartyName: 'Madu Hutan Sumbawa Asli (Seller)',
    reportedPartyRole: 'seller',
    orderOrContractRef: 'INV-RM-20261108-882',
    category: 'Kerusakan / Ketidaksesuaian Barang',
    subject: '1 Botol Madu Hutan Retak Saat Diterima, Mohon Mediasi Penggantian',
    chronology:
      'Pembeli memesan 3 botol Madu Hutan Sumbawa 500ml. Saat paket dibuka (disertai video unboxing), 1 botol mengalami retak pada leher kaca karena pelindung bubble wrap kurang tebal.',
    evidenceSummary: 'Foto kemasan luar & botol madu retak (Gambar) serta Berita Acara Klaim & Resi (PDF).',
    supportingFiles: [
      {
        id: 'doc-cmp01-foto-img',
        label: 'Foto Bukti Kemasan & Botol Retak',
        fileName: 'Bukti_Unboxing_Madu_Sumbawa_INV882.jpg',
        fileType: 'image',
        fileSize: '950 KB',
        documentNumber: 'BUKTI-IMG-401',
        issuer: 'Diunggah oleh Ahmad Fauzi (Member)',
        issuedDate: '11 Nov 2026 • 08:25 WIB',
        validUntil: 'Bukti Komplain Aktif',
        applicantOrOwner: 'Ahmad Fauzi (Member / Pembeli)',
        businessName: 'Transaksi INV-RM-20261108-882 (Madu Hutan Sumbawa Asli)',
        address: 'Jl. Cempaka Putih Tengah No. 12, Jakarta Pusat',
        verificationMatchSummary:
          'Foto bukti menunjukkan segel ekspedisi masih utuh saat dibuka, 2 botol aman dan 1 botol mengalami retak pada bagian leher botol kaca.',
        isDataMatching: true,
        imageUrl:
          'https://images.unsplash.com/photo-1587049352847-4a222e784d38?w=1000&q=80',
        imageCaption:
          'Bukti Foto Komplain Member (INV-RM-20261108-882): Kondisi Kemasan & Botol Madu Hutan Sumbawa 500ml Saat Unboxing.',
      },
      {
        id: 'doc-cmp01-ba-pdf',
        label: 'Berita Acara Klaim & Resi Pengiriman.pdf',
        fileName: 'Berita_Acara_Klaim_INV_RM_20261108_882.pdf',
        fileType: 'pdf',
        fileSize: '420 KB',
        documentNumber: 'BA-KOMPLAIN-401/XI/2026',
        issuer: 'Sistem Rekening Bersama (Escrow) Racik Media & Logistik',
        issuedDate: '11 Nov 2026',
        validUntil: 'Selama Proses Mediasi',
        applicantOrOwner: 'Ahmad Fauzi vs. Madu Hutan Sumbawa Asli',
        businessName: 'Pesanan INV-RM-20261108-882',
        address: 'Rute Pengiriman: Sumbawa Besar (NTB) → Jakarta Pusat',
        verificationMatchSummary:
          'Nilai pesanan Rp 450.000 (3 botol @ Rp 150.000). Klaim penggantian 1 botol (Rp 150.000) dilindungi asuransi pengiriman platform.',
        isDataMatching: true,
        pdfSections: [
          {
            heading: 'I. RINCIAN TRANSAKSI & REKENING BERSAMA (ESCROW)',
            content: [
              'Nomor Invoice        : INV-RM-20261108-882',
              'Pembeli (Member)     : Ahmad Fauzi',
              'Penjual (Seller)     : Sentra Madu Hutan Sumbawa Asli',
              'Total Dana di Escrow : Rp 450.000 (3 Botol Madu Hutan Murni 500ml)',
              'Nomor Resi Logistik  : RM-EXP-9920184721 (Asuransi Aktif)',
            ],
          },
          {
            heading: 'II. VERIFIKASI BUKTI & OPSI PENYELESAIAN ADMIN',
            content: [
              '• Bukti Unboxing valid dan diajukan dalam batas waktu 1x24 jam sejak barang tiba.',
              '• Opsi Mediasi Split Decision: Partial Refund Rp 150.000 ke saldo Member dan Rp 300.000 diteruskan ke Seller.',
            ],
          },
        ],
      },
    ],
    createdAt: 'Hari ini • 08:30 WIB',
    status: 'in_mediation',
    resolutionDecision:
      'Admin memediasi pengiriman 1 botol pengganti oleh Seller atau Partial Refund Rp 150.000 ke Pembeli (Rp 300.000 ke Seller).',
    escrowAmountRp: 450000,
    splitDecisionType: 'partial_split',
    refundBuyerAmountRp: 150000,
    releaseSellerAmountRp: 300000,
    forceOrderAction: 'none',
    escrowHoldActive: true,
    assignedAdminStaff: 'Siti Rahma (Admin Mediasi & Sengketa)',
  },
  {
    id: 'cmp-02',
    ticketCode: 'KOMPLAIN-RM-402',
    sourceType: 'member_seller_dispute',
    reporterName: 'Koperasi Kopi Gayo (Seller)',
    reporterRole: 'seller',
    reportedPartyName: 'Deni Kurniawan (Member / Pembeli)',
    reportedPartyRole: 'member',
    orderOrContractRef: 'INV-RM-20261104-719',
    category: 'Keterlambatan Konfirmasi / Pencairan',
    subject: 'Pesanan Sudah Tiba 4 Hari Menurut Resi Namun Pembeli Belum Klik Selesai',
    chronology:
      'Seller melaporkan paket 5 Kg Biji Kopi Arabika Gayo sudah berstatus Delivered di kurir sejak 4 hari lalu dan diterima langsung oleh pembeli, namun dana Escrow Rp 725.000 belum cair karena pembeli lalai menekan konfirmasi.',
    evidenceSummary: 'Foto Bukti Serah Terima Kurir / POD (Gambar) & Dokumen Manifest Resi (PDF).',
    supportingFiles: [
      {
        id: 'doc-cmp02-pod-img',
        label: 'Foto Bukti Serah Terima (POD Kurir)',
        fileName: 'Foto_POD_Kurir_INV_RM_20261104_719.jpg',
        fileType: 'image',
        fileSize: '780 KB',
        documentNumber: 'POD-RM-719',
        issuer: 'Kurir Ekspedisi Mitra Nusantara',
        issuedDate: '07 Nov 2026 • 15:40 WIB',
        validUntil: 'Terverifikasi',
        applicantOrOwner: 'Koperasi Kopi Gayo (Seller)',
        businessName: 'Pesanan INV-RM-20261104-719 (5 Kg Kopi Arabika Gayo)',
        address: 'Diterima di: Jl. Diponegoro No. 45, Bandung',
        verificationMatchSummary:
          'Foto serah terima paket menunjukkan barang telah diterima langsung oleh penerima (Deni Kurniawan) dalam keadaan utuh pada 07 Nov 2026.',
        isDataMatching: true,
        imageUrl:
          'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=1000&q=80',
        imageCaption:
          'Bukti Foto Proof of Delivery (POD) Paket 5 Kg Biji Kopi Arabika Gayo — Diterima Lengkap pada 07 Nov 2026.',
      },
      {
        id: 'doc-cmp02-manifest-pdf',
        label: 'Dokumen Manifest & Riwayat Pelacakan Resi.pdf',
        fileName: 'Manifest_Tracking_INV_RM_20261104_719.pdf',
        fileType: 'pdf',
        fileSize: '510 KB',
        documentNumber: 'TRK-RM-20261104-719',
        issuer: 'Sistem Logistik Terintegrasi Racik Media',
        issuedDate: '10 Nov 2026',
        validUntil: 'Sah sebagai Dasar Force Complete SLA',
        applicantOrOwner: 'Koperasi Kopi Gayo (Seller)',
        businessName: 'Klaim Pencairan SLA Escrow INV-RM-20261104-719',
        address: 'Takengon → Bandung',
        verificationMatchSummary:
          'Status pengiriman DELIVERED lebih dari 2x24 jam tanpa komplain dari pembeli. Memenuhi syarat Force Complete Order & Release Escrow oleh Admin.',
        isDataMatching: true,
        pdfSections: [
          {
            heading: 'I. LOG RIWAYAT PENGIRIMAN RESI TRK-RM-20261104-719',
            content: [
              '• 04 Nov 2026 10:15 WIB : Paket diserahkan Seller ke Gudang Sortir Takengon',
              '• 06 Nov 2026 06:30 WIB : Paket tiba di Hub Distribusi Bandung',
              '• 07 Nov 2026 15:40 WIB : DELIVERED — Diterima oleh Deni Kurniawan (Tanda Tangan & Foto POD Terlampir)',
              '• 10 Nov 2026 14:10 WIB : Melewati batas SLA 2x24 jam konfirmasi manual pembeli — Siap Force Complete oleh Admin.',
            ],
          },
        ],
      },
    ],
    createdAt: 'Kemarin • 14:10 WIB',
    status: 'open',
    resolutionDecision:
      'Menunggu Admin mengeksekusi Force Complete Order & Release 100% dana Escrow (Rp 725.000) ke Seller.',
    escrowAmountRp: 725000,
    splitDecisionType: 'none',
    refundBuyerAmountRp: 0,
    releaseSellerAmountRp: 725000,
    forceOrderAction: 'none',
    escrowHoldActive: false,
    assignedAdminStaff: 'Siti Rahma (Admin Mediasi & Sengketa)',
  },
  {
    id: 'cmp-03',
    ticketCode: 'ESKALASI-MOD-109',
    sourceType: 'moderator_escalation',
    reporterName: 'Tim Kurasi Moderator Editorial',
    reporterRole: 'moderator',
    reportedPartyName: 'Toko Jamu Srikandi Herbal (Seller)',
    reportedPartyRole: 'seller',
    orderOrContractRef: 'MOD-ESC-2026-109',
    category: 'Eskalasi Pelanggaran Produk / Konten (Moderator)',
    subject: 'Produk Jamu Klaim Obat Medis Keras Tanpa Izin BPOM & Mencantumkan Foto Kemasan Obat Terlarang',
    chronology:
      'Role Moderator mendapati pengajuan deskripsi produk dan 2 artikel promosi dari Toko Jamu Srikandi Herbal mengklaim dapat menyembuhkan penyakit kronis tanpa melampirkan nomor izin edar BPOM/PIRT yang sah. Dieskalasi ke Role Admin untuk penindakan level akun (Hold Payout + Audit Legalitas / Pembekuan Sementara).',
    evidenceSummary: 'Tangkap layar klaim deskripsi terlarang (Gambar) & Berita Acara Eskalasi Moderator (PDF).',
    supportingFiles: [
      {
        id: 'doc-cmp03-esc-img',
        label: 'Tangkap Layar Klaim Produk Bermasalah',
        fileName: 'Bukti_Eskalasi_Moderator_Jamu_Tanpa_BPOM.jpg',
        fileType: 'image',
        fileSize: '880 KB',
        documentNumber: 'ESC-MOD-IMG-109',
        issuer: 'Sistem Kurasi Moderator Racik Media',
        issuedDate: '11 Nov 2026 • 13:20 WIB',
        validUntil: 'Bukti Eskalasi Pelanggaran Hukum',
        applicantOrOwner: 'Tim Moderator → Role Admin',
        businessName: 'Toko Jamu Srikandi Herbal (Seller)',
        address: 'Kab. Sukoharjo, Jawa Tengah',
        verificationMatchSummary:
          'Deskripsi mencantumkan klaim medis terlarang UU Kesehatan dan nomor izin edar BPOM fiktif.',
        isDataMatching: false,
        imageUrl:
          'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=1000&q=80',
        imageCaption:
          'Lampiran Eskalasi Role Moderator: Produk Herbal Tanpa Registrasi BPOM Resmi untuk Ditindaklanjuti Role Admin.',
      },
      {
        id: 'doc-cmp03-esc-pdf',
        label: 'Berita Acara Eskalasi Pelanggaran Moderator.pdf',
        fileName: 'BA_Eskalasi_Moderator_MOD_ESC_2026_109.pdf',
        fileType: 'pdf',
        fileSize: '460 KB',
        documentNumber: 'MOD-ESC-2026-109',
        issuer: 'Role Moderator Editorial & Kurasi Produk',
        issuedDate: '11 Nov 2026',
        validUntil: 'Wajib Tindak Lanjut Admin < 1x24 Jam',
        applicantOrOwner: 'Moderator → Role Admin',
        businessName: 'Toko Jamu Srikandi Herbal',
        address: 'Kab. Sukoharjo, Jawa Tengah',
        verificationMatchSummary:
          'Rekomendasi Moderator kepada Admin: Tahan pencairan Escrow (Hold Payout), bekukan toko sementara (Suspend), atau Blacklist NIK/NPWP jika terbukti memalsukan BPOM.',
        isDataMatching: false,
        pdfSections: [
          {
            heading: 'I. LAPORAN ESKALASI PELANGGARAN HUKUM DARI ROLE MODERATOR',
            content: [
              'Kode Eskalasi     : MOD-ESC-2026-109',
              'Entitas Terlapor  : Toko Jamu Srikandi Herbal (Role Seller)',
              'Jenis Pelanggaran : Klaim kesehatan overclaim + Nomor registrasi BPOM tidak ditemukan pada database resmi.',
              'Tindakan Moderator: Penayangan produk & artikel sudah ditolak (blokir tayang) oleh Moderator.',
              'Tindakan Diminta ke Admin: Audit legalitas level akun, Hold Payout escrow berjalan, atau Suspend/Blacklist NIK/NPWP.',
            ],
          },
        ],
      },
    ],
    createdAt: 'Hari ini • 13:25 WIB',
    status: 'escalated_legal',
    resolutionDecision:
      'Diterima dari Moderator: Pencairan Escrow ditahan sementara (Hold Payout Aktif) sambil menunggu bukti izin edar BPOM asli.',
    escrowAmountRp: 1850000,
    splitDecisionType: 'none',
    refundBuyerAmountRp: 0,
    releaseSellerAmountRp: 0,
    forceOrderAction: 'none',
    escrowHoldActive: true,
    assignedAdminStaff: 'Nadia Putri (Admin Administrasi Senior)',
  },
  {
    id: 'cmp-04',
    ticketCode: 'KOMPLAIN-RM-403',
    sourceType: 'member_seller_dispute',
    reporterName: 'CV Logistik Nusantara (Distributor)',
    reporterRole: 'distributor',
    reportedPartyName: 'Sentra Pupuk Organik Lembang (Seller)',
    reportedPartyRole: 'seller',
    orderOrContractRef: 'DIST-BATCH-2026-19',
    category: 'Sengketa Kuota & Distribusi',
    subject: 'Penyesuaian Jadwal Pasokan 2 Ton Kompos Granul karena Cuaca Ekstrem',
    chronology:
      'Distributor mengajukan penjadwalan ulang pengiriman tahap ke-2 karena akses jalan menuju gudang transit tertutup longsor selama 2 hari, membutuhkan adendum surat jalan administrasi.',
    evidenceSummary: 'Surat Pemberitahuan Dishub & Adendum Manifest Distribusi (PDF).',
    supportingFiles: [
      {
        id: 'doc-cmp04-adendum-pdf',
        label: 'Surat Dishub & Adendum Jadwal Distribusi.pdf',
        fileName: 'Adendum_Distribusi_Batch_2026_19.pdf',
        fileType: 'pdf',
        fileSize: '640 KB',
        documentNumber: 'ADD/DIST-RM/2026/019',
        issuer: 'Admin Administrasi Racik Media & Mitra Distribusi',
        issuedDate: '09 Nov 2026',
        validUntil: '30 Nov 2026',
        applicantOrOwner: 'CV Logistik Nusantara & Sentra Pupuk Organik Lembang',
        businessName: 'Kontrak Distribusi Batch DIST-BATCH-2026-19',
        address: 'Jalur Distribusi Lembang — Garut — Tasikmalaya',
        verificationMatchSummary:
          'Adendum perpanjangan SLA pengiriman +3 hari kerja akibat keadaan kahar (force majeure cuaca) telah disepakati kedua pihak.',
        isDataMatching: true,
        pdfSections: [
          {
            heading: 'I. ADENDUM SURAT JALAN & JADWAL PASOKAN DISTRIBUSI',
            content: [
              'Nomor Referensi Batch : DIST-BATCH-2026-19',
              'Volume Komoditas      : 2.000 Kg (2 Ton) Kompos Organik Granul',
              'Alasan Penyesuaian    : Penutupan jalur lintas kecamatan akibat perbaikan tebing longsor (Force Majeure)',
              'Keputusan Admin       : Perpanjangan SLA pengiriman 3 hari kerja tanpa penalti keterlambatan.',
            ],
          },
        ],
      },
    ],
    createdAt: '2 hari lalu',
    status: 'resolved',
    resolutionDecision:
      'Diselesaikan oleh Admin: Adendum jadwal pengiriman disetujui kedua pihak (+3 hari kerja) tanpa penalti & Escrow Rp 6.400.000 diteruskan penuh.',
    escrowAmountRp: 6400000,
    splitDecisionType: 'release_to_seller',
    refundBuyerAmountRp: 0,
    releaseSellerAmountRp: 6400000,
    forceOrderAction: 'force_completed',
    escrowHoldActive: false,
    assignedAdminStaff: 'Rizky Maulana (Admin B2B & Armada)',
  },
];

export const INITIAL_LEGAL_DOCS: PartnerLegalDocumentRecord[] = [
  {
    id: 'leg-01',
    partnerName: 'Koperasi Kopi Arabika Gayo',
    partnerRole: 'seller',
    region: 'Aceh Tengah',
    nibStatus: 'valid',
    contractNumber: 'MOU/RM-SELLER/2025/014',
    certificationList: ['NIB Aktif', 'Sertifikat Indikasi Geografis', 'Halal MUI', 'PIRT'],
    supportingFiles: [
      {
        id: 'doc-leg01-mou-pdf',
        label: 'Kontrak MoU Kemitraan Seller.pdf',
        fileName: 'MoU_RM_Seller_2025_014_Koperasi_Gayo.pdf',
        fileType: 'pdf',
        fileSize: '1.2 MB',
        documentNumber: 'MOU/RM-SELLER/2025/014',
        issuer: 'Divisi Legal & Administrasi Racik Media Nusantara',
        issuedDate: '15 Januari 2025',
        validUntil: '15 Januari 2028',
        applicantOrOwner: 'Koperasi Kopi Arabika Gayo',
        businessName: 'Koperasi Kopi Arabika Gayo',
        address: 'Takengon, Kab. Aceh Tengah, Provinsi Aceh',
        verificationMatchSummary:
          'Kontrak MoU ditandatangani di atas meterai elektronik, mencakup jaminan keaslian Indikasi Geografis Kopi Gayo dan kepatuhan bagi hasil Escrow.',
        isDataMatching: true,
        pdfSections: [
          {
            heading: 'I. PERJANJIAN KERJA SAMA KEMITRAAN SELLER (MOU/RM-SELLER/2025/014)',
            content: [
              'Pihak Pertama : PT Racik Media Nusantara (Pengelola Platform & Rekening Bersama)',
              'Pihak Kedua   : Koperasi Kopi Arabika Gayo (Mitra Produsen / Seller Resmi)',
              'Masa Berlaku  : 15 Januari 2025 s/d 15 Januari 2028 (3 Tahun)',
            ],
          },
          {
            heading: 'II. KEWAJIBAN MUTU & LEGALITAS PRODUK',
            content: [
              '• Pihak Kedua menjamin keaslian komoditas Kopi Arabika Gayo sesuai Sertifikat Indikasi Geografis.',
              '• Setiap perubahan deskripsi produk wajib melewati kurasi Role Moderator sebelum tayang di Homepage.',
              '• Sengketa pengiriman atau komplain pembeli diselesaikan melalui mediasi Role Admin.',
            ],
          },
        ],
      },
      {
        id: 'doc-leg01-sertifikat-img',
        label: 'Foto Sertifikat Indikasi Geografis & Halal',
        fileName: 'Sertifikat_IG_dan_Halal_Kopi_Gayo.jpg',
        fileType: 'image',
        fileSize: '890 KB',
        documentNumber: 'IG-ID-GAYO-001 / HALAL-MUI-2025',
        issuer: 'Kemenkumham & BPJPH',
        issuedDate: '10 Februari 2025',
        validUntil: '10 Februari 2029',
        applicantOrOwner: 'Koperasi Kopi Arabika Gayo',
        businessName: 'Koperasi Kopi Arabika Gayo',
        address: 'Takengon, Aceh Tengah',
        verificationMatchSummary:
          'Pindaian sertifikat fisik Indikasi Geografis dan Halal terlihat jelas, hologram asli, dan nomor registrasi valid.',
        isDataMatching: true,
        imageUrl:
          'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1000&q=80',
        imageCaption:
          'Arsip Fisik Sertifikat Indikasi Geografis & Sertifikat Halal Koperasi Kopi Arabika Gayo.',
      },
    ],
    lastVerifiedAt: '05 Nov 2026',
    adminStatus: 'verified',
    notes: 'Seluruh berkas administrasi dan izin edar lengkap serta aktif.',
    dataRetentionDueAt: '15 Jan 2027',
    retentionAlertStatus: 'ok',
    escrowHoldActive: false,
    assignedAdminStaff: 'Bagas Pratama (Admin KYB & Legalitas)',
  },
  {
    id: 'leg-02',
    partnerName: 'PT Distribusi Agrikultur Nusantara',
    partnerRole: 'distributor',
    region: 'Jawa Barat & Jabodetabek',
    nibStatus: 'valid',
    contractNumber: 'MOU/RM-DIST/2025/003',
    certificationList: ['Akta Perseroan', 'NIB Logistik & Pergudangan', 'NPWP PKP', 'SLA Armada'],
    supportingFiles: [
      {
        id: 'doc-leg02-mou-pdf',
        label: 'Kontrak MoU & SLA Distributor Regional.pdf',
        fileName: 'MoU_Distributor_2025_003_Agrikultur_Nusantara.pdf',
        fileType: 'pdf',
        fileSize: '1.5 MB',
        documentNumber: 'MOU/RM-DIST/2025/003',
        issuer: 'Divisi Legal & Administrasi Racik Media Nusantara',
        issuedDate: '01 Februari 2025',
        validUntil: '01 Februari 2028',
        applicantOrOwner: 'PT Distribusi Agrikultur Nusantara',
        businessName: 'PT Distribusi Agrikultur Nusantara',
        address: 'Kawasan Industri Jababeka, Cikarang, Jawa Barat',
        verificationMatchSummary:
          'Dokumen MoU mencakup Service Level Agreement (SLA) ketepatan waktu pengiriman 98,5% dan jaminan asuransi kargo.',
        isDataMatching: true,
        pdfSections: [
          {
            heading: 'I. KONTRAK KEMITRAAN DISTRIBUTOR REGIONAL (MOU/RM-DIST/2025/003)',
            content: [
              'Nomor Kontrak    : MOU/RM-DIST/2025/003',
              'Mitra Distributor: PT Distribusi Agrikultur Nusantara',
              'Cakupan Wilayah  : Jawa Barat, DKI Jakarta, Banten, dan Jawa Tengah',
              'Standar SLA      : Maksimal waktu proses gudang 1x24 jam sejak manifest diterbitkan.',
            ],
          },
        ],
      },
    ],
    lastVerifiedAt: '01 Nov 2026',
    adminStatus: 'verified',
    notes: 'Kontrak distribusi tahunan telah diperbarui dan ditandatangani.',
    dataRetentionDueAt: '25 Nov 2026 (Wajib Pembaruan Data Alamat Gudang 2 Tahunan)',
    retentionAlertStatus: 'due_soon',
    escrowHoldActive: false,
    assignedAdminStaff: 'Nadia Putri (Admin Administrasi Senior)',
  },
  {
    id: 'leg-03',
    partnerName: 'Sentra Madu Hutan Sumbawa',
    partnerRole: 'seller',
    region: 'Sumbawa, NTB',
    nibStatus: 'expiring_soon',
    contractNumber: 'MOU/RM-SELLER/2025/029',
    certificationList: ['NIB Aktif', 'Uji Kemurnian Lab SNI (Perlu Perpanjangan Desember)'],
    supportingFiles: [
      {
        id: 'doc-leg03-lab-pdf',
        label: 'Sertifikat Uji Kemurnian Lab SNI Madu.pdf',
        fileName: 'Uji_Lab_SNI_Madu_Hutan_Sumbawa_2025.pdf',
        fileType: 'pdf',
        fileSize: '680 KB',
        documentNumber: 'SNI-MADU-8664-2025',
        issuer: 'Laboratorium Pengujian Mutu Pangan Mataram',
        issuedDate: '15 Desember 2024',
        validUntil: '15 Desember 2026 (Segera Berakhir)',
        applicantOrOwner: 'Sentra Madu Hutan Sumbawa',
        businessName: 'Sentra Madu Hutan Sumbawa',
        address: 'Kec. Batulanteh, Kab. Sumbawa, NTB',
        verificationMatchSummary:
          'Sertifikat masih sah saat ini (enzim diastase & kadar HMF memenuhi SNI), namun masa berlaku berakhir 15 Desember 2026 sehingga perlu pembaruan berkala 2 tahun.',
        isDataMatching: true,
        pdfSections: [
          {
            heading: 'I. HASIL UJI KEMURNIAN MADU HUTAN (SNI 8664:2018)',
            content: [
              'Nomor Dokumen    : SNI-MADU-8664-2025',
              'Mitra Seller     : Sentra Madu Hutan Sumbawa (MOU/RM-SELLER/2025/029)',
              'Aktivitas Enzim Diastase : 5,4 DN (Syarat SNI Madu Hutan: Min. 1,0 DN) — LULUS',
              'Kadar Hidroksimetilfurfural (HMF) : 18,2 mg/kg (Maks. 50 mg/kg) — LULUS',
              'Siklus Retensi 2 Tahun : Memasuki jatuh tempo pembaruan sertifikat & konfirmasi alamat.',
            ],
          },
        ],
      },
    ],
    lastVerifiedAt: '09 Nov 2026',
    adminStatus: 'under_audit',
    notes: 'Siklus 2 tahun akan berakhir — pengingat pembaruan dokumen & alamat diperlukan.',
    dataRetentionDueAt: '01 Nov 2026 (Terlewat 10 Hari — Segera Konfirmasi)',
    retentionAlertStatus: 'overdue',
    escrowHoldActive: false,
    assignedAdminStaff: 'Bagas Pratama (Admin KYB & Legalitas)',
  },
];

export const INITIAL_B2B_RENTALS: B2BAndRentalRecord[] = [
  {
    id: 'b2b-01',
    referenceCode: 'B2B-KONTRAK-2026-088',
    governanceType: 'b2b_contract',
    partnerName: 'PT Agro Makmur Sejahtera Tbk',
    partnerRole: 'distributor',
    region: 'Semarang & Pantura, Jawa Tengah',
    title: 'Pengadaan Partai Besar 40 Ton Pupuk Organik Cair & Padat (Skema B2B Kemitraan)',
    submittedAt: 'Hari ini • 09:45 WIB',
    standardFeePercent: 5,
    customFeePercent: 3.25,
    additionalServiceFeeRp: 750000,
    feeOverrideReason:
      'Kesepakatan volume partai besar (> 35 ton/kuartal): komisi diturunkan menjadi 3,25% dengan biaya administrasi kliring B2B Rp 750.000.',
    feeOverrideLocked: false,
    checkboxApprovalLog: {
      approvedByName: 'Ir. Bambang Sutrisno (Direktur Pengadaan PT Agro Makmur)',
      approvedByRole: 'Mitra Distributor B2B',
      approvedAt: '11 Nov 2026 • 09:44:12 WIB',
      ipAddress: '103.147.22.19 (TLS Verified Session)',
      documentVersion: 'FORM-B2B-RM-v4.2 (PDF)',
      agreementText:
        'Saya menyetujui Syarat & Ketentuan Pengadaan B2B, jadwal pembayaran termin Escrow 2 tahap, dan kesepakatan tarif khusus 3,25% tanpa tanda tangan basah.',
      verifiedByAdmin: false,
    },
    status: 'pending_review',
    assignedAdminStaff: 'Rizky Maulana (Admin B2B & Armada)',
    adminNotes:
      'Menunggu Admin memverifikasi Checkbox Approval Log digital dan mengunci Custom Fee Override 3,25%.',
    supportingFiles: [
      {
        id: 'doc-b2b01-form-pdf',
        label: 'Draf Perjanjian B2B & Lampiran Tarif Khusus.pdf',
        fileName: 'FORM_B2B_RM_v4.2_PT_Agro_Makmur.pdf',
        fileType: 'pdf',
        fileSize: '840 KB',
        documentNumber: 'B2B-KONTRAK-2026-088',
        issuer: 'Sistem B2B Governance Racik Media Nusantara',
        issuedDate: '11 Nov 2026',
        validUntil: '11 Nov 2027',
        applicantOrOwner: 'Ir. Bambang Sutrisno (PT Agro Makmur Sejahtera Tbk)',
        businessName: 'PT Agro Makmur Sejahtera Tbk',
        address: 'Kawasan Industri Terboyo Blok M-09, Semarang',
        verificationMatchSummary:
          'Persetujuan digital (Checkbox Approval Log) tercatat sah pada 11 Nov 2026 pukul 09:44 WIB dari IP 103.147.22.19 atas dokumen FORM-B2B-RM-v4.2.',
        isDataMatching: true,
        pdfSections: [
          {
            heading: 'I. RINGKASAN KESEPAKATAN KOMISI KHUSUS (CUSTOM FEE OVERRIDE)',
            content: [
              'Tarif Platform Standar   : 5,00%',
              'Tarif B2B Khusus Disetujui : 3,25% (Volume Kuartalan >= 35 Ton)',
              'Biaya Layanan Administrasi : Rp 750.000 / Kontrak Batch',
            ],
          },
          {
            heading: 'II. JEJAK PERSETUJUAN DIGITAL (CHECKBOX APPROVAL LOG)',
            content: [
              'Penyetuju   : Ir. Bambang Sutrisno (IP: 103.147.22.19)',
              'Waktu Aksi  : 11 Nov 2026 • 09:44:12 WIB',
              'Versi Form  : FORM-B2B-RM-v4.2',
              'Status Hukum: Mengikat secara elektronik sesuai UU ITE tanpa perlu tanda tangan basah.',
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'b2b-02',
    referenceCode: 'SEWA-PICKUP-2026-041',
    governanceType: 'fleet_rental',
    partnerName: 'CV Armada Tani Jaya',
    partnerRole: 'service-provider',
    region: 'Malang — Batu — Pasuruan, Jawa Timur',
    title: 'Pengajuan Sewa Armada Pickup Box Pendingin (Mitsubishi L300 Thermo) untuk Rute Panen',
    submittedAt: 'Hari ini • 10:15 WIB',
    standardFeePercent: 5,
    customFeePercent: 5,
    additionalServiceFeeRp: 125000,
    feeOverrideReason: 'Tarif standar 5% + asuransi muatan sewa armada Rp 125.000 per perjalanan.',
    feeOverrideLocked: true,
    checkboxApprovalLog: {
      approvedByName: 'Slamet Riyadi (Manajer Armada CV Armada Tani Jaya)',
      approvedByRole: 'Penyedia Jasa Transportasi',
      approvedAt: '11 Nov 2026 • 10:14:05 WIB',
      ipAddress: '182.253.88.41 (TLS Verified Session)',
      documentVersion: 'SOP-ARMADA-PICKUP-v2.1 (PDF)',
      agreementText:
        'Menyetujui standar keselamatan angkut komoditas pertanian, jaminan STNK & KIR aktif, serta klaim asuransi muatan.',
      verifiedByAdmin: true,
    },
    vehiclePlate: 'N 8492 UB',
    vehicleType: 'Pickup Box Berpendingin (Mitsubishi L300 Box 2023)',
    stnkNumber: 'STNK-JTM-84920192',
    stnkExpiry: '18 Mei 2028',
    stnkStatus: 'active',
    kirNumber: 'KIR-MLG-2026-04491',
    kirExpiry: '20 April 2027',
    kirStatus: 'active',
    status: 'pending_review',
    assignedAdminStaff: 'Rizky Maulana (Admin B2B & Armada)',
    adminNotes: 'STNK & KIR terlampir aktif. Menunggu pemeriksaan visual & persetujuan kelayakan armada oleh Admin.',
    supportingFiles: [
      {
        id: 'doc-b2b02-armada-img',
        label: 'Foto Fisik Unit Pickup & Plat Nomor N 8492 UB',
        fileName: 'Pickup_L300_Thermo_N8492UB_Malang.jpg',
        fileType: 'image',
        fileSize: '1.2 MB',
        documentNumber: 'N 8492 UB',
        issuer: 'CV Armada Tani Jaya',
        issuedDate: '11 Nov 2026',
        validUntil: 'Aktif',
        applicantOrOwner: 'Slamet Riyadi',
        businessName: 'CV Armada Tani Jaya',
        address: 'Jl. Soekarno-Hatta No. 41, Kota Malang',
        verificationMatchSummary:
          'Foto fisik armada menunjukkan kondisi boks bersih, unit pendingin terpasang, dan pelat nomor N 8492 UB sesuai STNK.',
        isDataMatching: true,
        imageUrl:
          'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=1000&q=80',
        imageCaption:
          'Foto Inspeksi Fisik Armada Sewa Pickup N 8492 UB milik CV Armada Tani Jaya (Malang).',
      },
      {
        id: 'doc-b2b02-kir-pdf',
        label: 'Salinan STNK & Buku Uji KIR Aktif N 8492 UB.pdf',
        fileName: 'STNK_dan_KIR_N8492UB_CV_Armada_Tani.pdf',
        fileType: 'pdf',
        fileSize: '720 KB',
        documentNumber: 'KIR-MLG-2026-04491 / STNK-JTM-84920192',
        issuer: 'Samsat Kota Malang & Dishub UPTD Pengujian Kendaraan Bermotor',
        issuedDate: '20 Oktober 2026',
        validUntil: 'KIR s/d 20 April 2027 • STNK s/d 18 Mei 2028',
        applicantOrOwner: 'CV Armada Tani Jaya',
        businessName: 'Unit N 8492 UB — Pickup Box',
        address: 'Kota Malang, Jawa Timur',
        verificationMatchSummary:
          'Uji emisi, pengereman, sistem kemudi, dan pajak STNK dinyatakan LULUS & AKTIF untuk angkutan barang komoditas.',
        isDataMatching: true,
        pdfSections: [
          {
            heading: 'I. STATUS LEGALITAS KENDARAAN ANGKUTAN BARANG (STNK & UJI KIR)',
            content: [
              'Nomor Polisi          : N 8492 UB (Milik CV Armada Tani Jaya)',
              'Nomor STNK            : STNK-JTM-84920192 (Pajak Tahunan Lunas s/d 18 Mei 2028)',
              'Nomor Buku Uji KIR    : KIR-MLG-2026-04491 (Berlaku s/d 20 April 2027)',
              'Daya Angkut Maksimal  : 1.450 Kg (Lulus Uji Rem & Emisi Gas Buang)',
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'b2b-03',
    referenceCode: 'SEWA-PICKUP-2026-042',
    governanceType: 'fleet_rental',
    partnerName: 'Rental Logistik Sumber Rezeki',
    partnerRole: 'service-provider',
    region: 'Garut — Bandung, Jawa Barat',
    title: 'Pengajuan Sewa Pickup Bak Terbuka GrandMax (Terkendala Uji KIR Kedaluwarsa)',
    submittedAt: 'Kemarin • 15:10 WIB',
    standardFeePercent: 5,
    customFeePercent: 5,
    additionalServiceFeeRp: 0,
    feeOverrideReason: 'Tarif standar platform 5%.',
    feeOverrideLocked: false,
    checkboxApprovalLog: {
      approvedByName: 'Ujang Suryana (Pemilik Rental Sumber Rezeki)',
      approvedByRole: 'Penyedia Jasa Transportasi',
      approvedAt: '10 Nov 2026 • 15:09:48 WIB',
      ipAddress: '114.10.42.90 (TLS Verified Session)',
      documentVersion: 'SOP-ARMADA-PICKUP-v2.1 (PDF)',
      agreementText: 'Menyetujui ketentuan sewa armada logistik Racik Media.',
      verifiedByAdmin: false,
    },
    vehiclePlate: 'Z 8104 DA',
    vehicleType: 'Pickup Bak Terbuka (Daihatsu GranMax 2020)',
    stnkNumber: 'STNK-JBR-81040021',
    stnkExpiry: '12 Jan 2027',
    stnkStatus: 'active',
    kirNumber: 'KIR-GRT-2025-00192',
    kirExpiry: '02 Nov 2026 (KEDALUWARSA)',
    kirStatus: 'expired',
    status: 'need_revision',
    assignedAdminStaff: 'Rizky Maulana (Admin B2B & Armada)',
    adminNotes: 'Buku Uji KIR berakhir pada 02 Nov 2026. Wajib perpanjang KIR sebelum sewa armada diizinkan beroperasi.',
    supportingFiles: [
      {
        id: 'doc-b2b03-kir-pdf',
        label: 'Lampiran Uji KIR Kedaluwarsa Z 8104 DA.pdf',
        fileName: 'Uji_KIR_Z8104DA_Expired.pdf',
        fileType: 'pdf',
        fileSize: '410 KB',
        documentNumber: 'KIR-GRT-2025-00192',
        issuer: 'Dishub Kab. Garut',
        issuedDate: '02 Mei 2026',
        validUntil: '02 November 2026 (SUDAH BERAKHIR)',
        applicantOrOwner: 'Ujang Suryana',
        businessName: 'Rental Logistik Sumber Rezeki',
        address: 'Tarogong Kidul, Kab. Garut',
        verificationMatchSummary:
          'PERINGATAN KELAYAKAN ARMADA: Masa berlaku uji KIR kendaraan Z 8104 DA telah berakhir. Dilarang disetujui sampai dokumen perpanjangan KIR diunggah.',
        isDataMatching: false,
        pdfSections: [
          {
            heading: 'I. TEMUAN AUDIT KELAYAKAN ARMADA (STNK & KIR)',
            content: [
              'Nomor Polisi : Z 8104 DA',
              'Status STNK  : AKTIF (s/d 12 Jan 2027)',
              'Status KIR   : KEDALUWARSA (Berakhir 02 November 2026)',
              'Tindakan Admin: Tolak aktivasi sementara / Minta Revisi unggah bukti perpanjangan uji KIR terbaru.',
            ],
          },
        ],
      },
    ],
  },
];

export const INITIAL_B2B_TEMPLATES: B2BTemplateDocument[] = [
  {
    id: 'tpl-b2b-01',
    title: 'Formulir Induk Pengadaan B2B & Persetujuan Digital (Tanpa Tanda Tangan Basah)',
    version: 'FORM-B2B-RM-v4.2',
    updatedAt: '10 Nov 2026',
    updatedBy: 'Nadia Putri (Admin Administrasi Senior)',
    pdfFile: {
      id: 'doc-tpl-b2b-v42',
      label: 'Template Resmi FORM-B2B-RM-v4.2.pdf',
      fileName: 'Template_Resmi_FORM_B2B_RM_v4.2.pdf',
      fileType: 'pdf',
      fileSize: '540 KB',
      documentNumber: 'FORM-B2B-RM-v4.2',
      issuer: 'Divisi Administrasi & Legal Racik Media Nusantara',
      issuedDate: '10 Nov 2026',
      validUntil: 'Berlaku Saat Ini (Versi Terbaru)',
      applicantOrOwner: 'Standar Seluruh Mitra B2B',
      businessName: 'Racik Media Nusantara Platform',
      address: 'Jakarta & Regional Nusantara',
      verificationMatchSummary:
        'Draf resmi formulir perjanjian B2B dengan klausul Checkbox Approval Log elektronik sesuai UU ITE.',
      isDataMatching: true,
      pdfSections: [
        {
          heading: 'I. KLAUSUL PERSETUJUAN DIGITAL (CHECKBOX APPROVAL LOG)',
          content: [
            '1. Para pihak sepakat bahwa pencentangan kotak persetujuan elektronik di dalam akun terverifikasi sah menggantikan tanda tangan basah.',
            '2. Sistem merekam nama penanggung jawab, stempel waktu (WIB), versi dokumen, dan alamat IP pengirim.',
            '3. Penyesuaian komisi khusus di luar tarif standar 5% hanya sah setelah dikunci oleh Role Admin.',
          ],
        },
      ],
    },
  },
  {
    id: 'tpl-armada-01',
    title: 'SOP Inspeksi Kelayakan Sewa Armada Pickup & Syarat STNK/KIR Aktif',
    version: 'SOP-ARMADA-PICKUP-v2.1',
    updatedAt: '08 Nov 2026',
    updatedBy: 'Rizky Maulana (Admin B2B & Armada)',
    pdfFile: {
      id: 'doc-tpl-armada-v21',
      label: 'Template Resmi SOP-ARMADA-PICKUP-v2.1.pdf',
      fileName: 'Template_SOP_ARMADA_PICKUP_v2.1.pdf',
      fileType: 'pdf',
      fileSize: '490 KB',
      documentNumber: 'SOP-ARMADA-PICKUP-v2.1',
      issuer: 'Divisi Operasional & Logistik Role Admin',
      issuedDate: '08 Nov 2026',
      validUntil: 'Berlaku Saat Ini',
      applicantOrOwner: 'Penyedia Jasa Sewa Armada / Pickup',
      businessName: 'Racik Media Logistik',
      address: 'Nasional',
      verificationMatchSummary:
        'Standar wajib kelayakan kendaraan pickup rental sebelum menerima order pengangkutan komoditas.',
      isDataMatching: true,
      pdfSections: [
        {
          heading: 'I. SYARAT WAJIB KELAYAKAN ARMADA OPERASIONAL',
          content: [
            '• STNK kendaraan wajib aktif & pajak kendaraan lunas.',
            '• Buku Uji KIR Dishub wajib aktif (belum melewati tanggal kedaluwarsa).',
            '• Foto tampak depan/belakang & bak muatan wajib sesuai pelat nomor terdaftar.',
          ],
        },
      ],
    },
  },
];

export const INITIAL_ESCROW_GUARDS: PartnerEscrowGuardRecord[] = [
  {
    id: 'esc-01',
    partnerName: 'Toko Jamu Srikandi Herbal',
    partnerRole: 'seller',
    escrowBalanceRp: 1850000,
    pendingInvoiceCount: 4,
    payoutStatus: 'held_investigation',
    holdReason: 'Ditahan sementara karena eskalasi Moderator (MOD-ESC-2026-109) terkait verifikasi izin edar BPOM.',
    updatedAt: 'Hari ini • 13:30 WIB',
    updatedBy: 'Nadia Putri (Admin Administrasi Senior)',
  },
  {
    id: 'esc-02',
    partnerName: 'Sentra Madu Hutan Sumbawa Asli',
    partnerRole: 'seller',
    escrowBalanceRp: 3450000,
    pendingInvoiceCount: 7,
    payoutStatus: 'held_investigation',
    holdReason: 'Sebagian dana dalam proses mediasi komplain KOMPLAIN-RM-401 & pembaruan sertifikat uji SNI.',
    updatedAt: 'Hari ini • 09:05 WIB',
    updatedBy: 'Siti Rahma (Admin Mediasi & Sengketa)',
  },
  {
    id: 'esc-03',
    partnerName: 'Koperasi Kopi Arabika Gayo',
    partnerRole: 'seller',
    escrowBalanceRp: 8920000,
    pendingInvoiceCount: 11,
    payoutStatus: 'normal',
    holdReason: 'Tidak ada penahanan — legalitas lengkap & transaksi bersih.',
    updatedAt: '05 Nov 2026',
    updatedBy: 'Bagas Pratama (Admin KYB & Legalitas)',
  },
  {
    id: 'esc-04',
    partnerName: 'PT Distribusi Agrikultur Nusantara',
    partnerRole: 'distributor',
    escrowBalanceRp: 24500000,
    pendingInvoiceCount: 6,
    payoutStatus: 'normal',
    holdReason: 'Arus pencairan berjalan normal sesuai jadwal kliring Escrow.',
    updatedAt: '01 Nov 2026',
    updatedBy: 'Nadia Putri (Admin Administrasi Senior)',
  },
];

export const INITIAL_ROYALTY_TRAFFIC: AuthorRoyaltyTrafficRecord[] = [
  {
    id: 'roy-01',
    articleTitle: 'Analisis Mikrobioma Tanah Gambut untuk Produktivitas Kopi Spesialti',
    authorName: 'Dr. Hendro Pratama (Author)',
    periodLabel: 'Periode Pencairan 01–15 Nov 2026',
    rawViews: 48200,
    botFlaggedViews: 19450,
    validViews: 28750,
    ratePerThousandViewsRp: 15000,
    estimatedRoyaltyRp: 431250,
    botDetectionNote:
      'Terdeteksi lonjakan 19.450 hit berulang dari 3 rentang IP datacenter luar negeri (durasi baca < 1.2 detik). Wajib dipotong sebelum dikirim ke staf keuangan.',
    auditStatus: 'pending_filter',
  },
  {
    id: 'roy-02',
    articleTitle: 'Teknik Fermentasi Kakao Biji Unggul Skala Koperasi Tani',
    authorName: 'Larasati Ningrum (Author)',
    periodLabel: 'Periode Pencairan 01–15 Nov 2026',
    rawViews: 16400,
    botFlaggedViews: 320,
    validViews: 16080,
    ratePerThousandViewsRp: 15000,
    estimatedRoyaltyRp: 241200,
    botDetectionNote:
      'Trafik pembaca organik 98% berasal dari IP residensial Indonesia dengan rata-rata waktu baca 4 menit 12 detik.',
    auditStatus: 'pending_filter',
  },
  {
    id: 'roy-03',
    articleTitle: 'Panduan Pengolahan Kompos Cair Limbah Rumah Tangga Berstandar SNI',
    authorName: 'Dr. Sarah Amalia (Penyedia Jasa / Kontributor)',
    periodLabel: 'Periode Pencairan 16–31 Okt 2026',
    rawViews: 22100,
    botFlaggedViews: 1100,
    validViews: 21000,
    ratePerThousandViewsRp: 15000,
    estimatedRoyaltyRp: 315000,
    botDetectionNote:
      '1.100 trafik crawler telah dipotong otomatis oleh Admin dan 21.000 pembaca valid disetujui masuk antrean royalti keuangan.',
    auditStatus: 'bot_deducted_approved',
    reviewedBy: 'Nadia Putri (Admin Administrasi Senior)',
    reviewedAt: '09 Nov 2026 • 16:00 WIB',
  },
];

export const INITIAL_AUDIT_TRAIL: AdminAuditTrailEntry[] = [
  {
    id: 'aud-01',
    timestamp: '11 Nov 2026 • 13:30 WIB',
    adminStaff: 'Nadia Putri (Admin Administrasi Senior)',
    category: 'Eskalasi Moderator',
    targetEntity: 'Toko Jamu Srikandi Herbal (ESKALASI-MOD-109)',
    actionLabel: 'Terima Eskalasi Moderator & Aktifkan Hold Payout',
    previousState: 'Payout Normal',
    newState: 'Escrow Held (Rp 1.850.000) & Audit Legalitas',
    reason: 'Produk mengklaim khasiat medis keras tanpa registrasi BPOM sah (laporan kurasi Moderator).',
  },
  {
    id: 'aud-02',
    timestamp: '08 Nov 2026 • 10:15 WIB',
    adminStaff: 'Nadia Putri (Admin Administrasi Senior)',
    category: 'Siklus Akun & KYB',
    targetEntity: 'Sentra Pupuk & Kompos Organik Lembang (upg-04)',
    actionLabel: 'Setujui Pengajuan Menjadi Seller',
    previousState: 'pending_review',
    newState: 'approved',
    reason: 'Seluruh dokumen NIB, Akta Koperasi, dan Hasil Uji Lab BPTP C-Organik sesuai 100%.',
  },
  {
    id: 'aud-03',
    timestamp: '06 Nov 2026 • 14:22 WIB',
    adminStaff: 'Bagas Pratama (Admin KYB & Legalitas)',
    category: 'Siklus Akun & KYB',
    targetEntity: 'Darmawan Halim — NIK 3329091003820007 (upg-05)',
    actionLabel: 'Pembekuan & Blacklist Permanen NIK/NPWP',
    previousState: 'suspended',
    newState: 'blacklisted (NIK & NPWP Diblokir)',
    reason: 'Terbukti memalsukan dokumen izin edar pupuk bersubsidi.',
  },
  {
    id: 'aud-04',
    timestamp: '09 Nov 2026 • 16:00 WIB',
    adminStaff: 'Nadia Putri (Admin Administrasi Senior)',
    category: 'Pengaman Escrow & Royalti',
    targetEntity: 'Artikel: Panduan Pengolahan Kompos Cair (Dr. Sarah Amalia)',
    actionLabel: 'Filter Trafik Bot Royalti & Setujui Valid Views',
    previousState: '22.100 Raw Views (Pending Filter)',
    newState: '21.000 Valid Views Disetujui (Rp 315.000)',
    reason: 'Memotong 1.100 hit crawler otomatis sebelum diteruskan ke antrean pencairan staf keuangan.',
  },
];

function safeReadJson<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function getMemberUpgrades(): MemberUpgradeApplication[] {
  return safeReadJson(UPGRADE_STORAGE_KEY, INITIAL_MEMBER_UPGRADES);
}

export function getAdminComplaints(): AdminComplaintTicket[] {
  return safeReadJson(COMPLAINTS_STORAGE_KEY, INITIAL_COMPLAINTS);
}

export function getPartnerLegalDocs(): PartnerLegalDocumentRecord[] {
  return safeReadJson(LEGAL_DOCS_STORAGE_KEY, INITIAL_LEGAL_DOCS);
}

export function getB2BAndRentals(): B2BAndRentalRecord[] {
  return safeReadJson(B2B_RENTAL_STORAGE_KEY, INITIAL_B2B_RENTALS);
}

export function getB2BTemplates(): B2BTemplateDocument[] {
  return safeReadJson(B2B_TEMPLATES_STORAGE_KEY, INITIAL_B2B_TEMPLATES);
}

export function getPartnerEscrowGuards(): PartnerEscrowGuardRecord[] {
  return safeReadJson(ESCROW_GUARD_STORAGE_KEY, INITIAL_ESCROW_GUARDS);
}

export function getRoyaltyTrafficRecords(): AuthorRoyaltyTrafficRecord[] {
  return safeReadJson(ROYALTY_TRAFFIC_STORAGE_KEY, INITIAL_ROYALTY_TRAFFIC);
}

export function getAdminAuditTrail(): AdminAuditTrailEntry[] {
  return safeReadJson(AUDIT_TRAIL_STORAGE_KEY, INITIAL_AUDIT_TRAIL);
}

export function getActiveAdminStaff(): string {
  if (typeof window === 'undefined') return ADMIN_STAFF_LIST[0];
  return window.localStorage.getItem(ACTIVE_STAFF_STORAGE_KEY) || ADMIN_STAFF_LIST[0];
}

export function appendAdminAuditLog(entry: Omit<AdminAuditTrailEntry, 'id' | 'timestamp'>): void {
  if (typeof window === 'undefined') return;
  const current = getAdminAuditTrail();
  const nextEntry: AdminAuditTrailEntry = {
    id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: formatNowWib(),
    ...entry,
  };
  const next = [nextEntry, ...current];
  window.localStorage.setItem(AUDIT_TRAIL_STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event(ADMIN_UPDATE_EVENT));
}

/**
 * Helper publik agar Role Moderator dapat langsung mengekskalasi produk/artikel
 * bermasalah (pelanggaran hukum/izin edar/spam berat) langsung ke antrean Role Admin.
 */
export function createModeratorEscalationToAdmin(payload: {
  subject: string;
  reportedPartyName: string;
  reportedPartyRole?: ComplaintReporterRole;
  orderOrContractRef: string;
  chronology: string;
  moderatorNote?: string;
}): AdminComplaintTicket {
  const newTicket: AdminComplaintTicket = {
    id: `cmp-esc-${Date.now()}`,
    ticketCode: `ESKALASI-MOD-${Math.floor(200 + Math.random() * 799)}`,
    sourceType: 'moderator_escalation',
    reporterName: 'Role Moderator (Kurasi Konten & Produk)',
    reporterRole: 'moderator',
    reportedPartyName: payload.reportedPartyName,
    reportedPartyRole: payload.reportedPartyRole ?? 'seller',
    orderOrContractRef: payload.orderOrContractRef,
    category: 'Eskalasi Pelanggaran Produk / Konten (Moderator)',
    subject: payload.subject,
    chronology: payload.chronology,
    evidenceSummary:
      payload.moderatorNote || 'Laporan eskalasi resmi dari Dashboard Peninjauan Role Moderator.',
    supportingFiles: [
      {
        id: `doc-esc-${Date.now()}`,
        label: 'Berita Acara Eskalasi Role Moderator.pdf',
        fileName: `Eskalasi_${payload.orderOrContractRef.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`,
        fileType: 'pdf',
        fileSize: '310 KB',
        documentNumber: payload.orderOrContractRef,
        issuer: 'Sistem Kurasi Role Moderator Racik Media',
        issuedDate: formatNowWib(),
        validUntil: 'Wajib Audit Level Akun oleh Admin',
        applicantOrOwner: 'Moderator → Role Admin',
        businessName: payload.reportedPartyName,
        address: 'Platform Racik Media Nusantara',
        verificationMatchSummary:
          payload.moderatorNote ||
          'Ditemukan pelanggaran ketentuan/legalitas pada kurasi konten. Diserahkan kepada Role Admin untuk tindakan akun (Hold Payout / Suspend / Blacklist).',
        isDataMatching: false,
        pdfSections: [
          {
            heading: 'I. RINGKASAN ESKALASI PELANGGARAN DARI ROLE MODERATOR',
            content: [
              `Subjek Eskalasi : ${payload.subject}`,
              `Entitas Terlapor: ${payload.reportedPartyName}`,
              `Ref Arsip/Item  : ${payload.orderOrContractRef}`,
              `Kronologi       : ${payload.chronology}`,
            ],
          },
        ],
      },
    ],
    createdAt: formatNowWib(),
    status: 'escalated_legal',
    resolutionDecision:
      'Menunggu penindakan Role Admin pada level akun (Audit Legalitas, Hold Payout, atau Pembekuan Akun).',
    escrowAmountRp: 0,
    splitDecisionType: 'none',
    refundBuyerAmountRp: 0,
    releaseSellerAmountRp: 0,
    forceOrderAction: 'none',
    escrowHoldActive: true,
    assignedAdminStaff: ADMIN_STAFF_LIST[0],
  };

  if (typeof window !== 'undefined') {
    const current = getAdminComplaints();
    const next = [newTicket, ...current];
    window.localStorage.setItem(COMPLAINTS_STORAGE_KEY, JSON.stringify(next));
    appendAdminAuditLog({
      adminStaff: 'Sistem Integrasi Moderator → Admin',
      category: 'Eskalasi Moderator',
      targetEntity: `${newTicket.ticketCode} (${payload.reportedPartyName})`,
      actionLabel: 'Eskalasi Pelanggaran Masuk dari Role Moderator',
      previousState: 'Antrean Kurasi Moderator',
      newState: 'escalated_legal (Hold Payout Otomatis)',
      reason: payload.subject,
    });
  }

  return newTicket;
}

/**
 * Mengajukan aktivasi Role Member -> Seller / Distributor / Penyedia Jasa
 * agar langsung masuk ke antrean verifikasi KYB Role Admin.
 */
export function submitPartnerActivationRequest(payload: {
  memberName: string;
  memberEmail: string;
  targetRole: ApplicantTargetRole;
  proposedBusinessName: string;
  region: string;
  commodityFocus: string;
  ktpNumber: string;
  npwpNumber: string;
  nibNumber: string;
  warehouseOrStoreAddress: string;
  phone?: string;
}): MemberUpgradeApplication {
  const newApp: MemberUpgradeApplication = {
    id: `upg-${Date.now()}`,
    memberName: payload.memberName,
    memberEmail: payload.memberEmail,
    memberJoinedAt: 'Member Aktif',
    targetRole: payload.targetRole,
    proposedBusinessName: payload.proposedBusinessName,
    region: payload.region,
    commodityFocus: payload.commodityFocus,
    ktpNumber: `${payload.ktpNumber} (Menunggu Verifikasi Admin)`,
    rawNik: payload.ktpNumber,
    npwpNumber: payload.npwpNumber || '-',
    nibNumber: payload.nibNumber || 'Dalam Proses OSS',
    legalityDocuments: [
      'Formulir Pengajuan Aktivasi Mitra (PDF)',
      'KTP Penanggung Jawab (Terlampir)',
    ],
    supportingFiles: [
      {
        id: `doc-app-${Date.now()}-pdf`,
        label: `Pengajuan Aktivasi ${payload.targetRole.toUpperCase()}.pdf`,
        fileName: `Pengajuan_${payload.targetRole}_${Date.now()}.pdf`,
        fileType: 'pdf',
        fileSize: '340 KB',
        documentNumber: `REG-${Date.now().toString().slice(-6)}`,
        issuer: 'Formulir Pendaftaran Member Racik Media',
        issuedDate: formatNowWib(),
        validUntil: 'Menunggu Audit Admin',
        applicantOrOwner: payload.memberName,
        businessName: payload.proposedBusinessName,
        address: payload.warehouseOrStoreAddress,
        verificationMatchSummary: `Pengajuan aktivasi dari Role Member menjadi ${payload.targetRole.toUpperCase()} (${payload.commodityFocus}). Kontak: ${payload.phone || '-'}`,
        isDataMatching: true,
        pdfSections: [
          {
            heading: 'I. DATA PENGAJUAN AKTIVASI MITRA DARI MEMBER',
            content: [
              `Pemohon (Member) : ${payload.memberName} (${payload.memberEmail})`,
              `Target Peran     : ${payload.targetRole.toUpperCase()}`,
              `Nama Usaha/Jasa  : ${payload.proposedBusinessName}`,
              `NIK / NPWP / NIB : ${payload.ktpNumber} / ${payload.npwpNumber || '-'} / ${payload.nibNumber || '-'}`,
              `Alamat Lengkap   : ${payload.warehouseOrStoreAddress} (${payload.region})`,
              `Fokus Komoditas  : ${payload.commodityFocus}`,
            ],
          },
        ],
      },
    ],
    warehouseOrStoreAddress: payload.warehouseOrStoreAddress,
    submittedAt: formatNowWib(),
    status: 'pending_review',
    adminNotes: `Pengajuan baru dari Role Member untuk aktivasi ${payload.targetRole.toUpperCase()}. Menunggu verifikasi Role Admin.`,
    dataRetentionDueAt: 'Siklus 2 Tahun Sejak Persetujuan',
    retentionAlertStatus: 'ok',
    hasTransactions: false,
    assignedAdminStaff: ADMIN_STAFF_LIST[0],
  };

  if (typeof window !== 'undefined') {
    const current = getMemberUpgrades();
    const next = [newApp, ...current];
    window.localStorage.setItem(UPGRADE_STORAGE_KEY, JSON.stringify(next));
    appendAdminAuditLog({
      adminStaff: `Pengajuan Mandiri Member (${payload.memberName})`,
      category: 'Siklus Akun & KYB',
      targetEntity: `${payload.proposedBusinessName} (${payload.targetRole.toUpperCase()})`,
      actionLabel: 'Pengajuan Aktivasi Role Baru Masuk dari Member',
      previousState: 'Role Member',
      newState: 'pending_review (Menunggu Admin)',
      reason: `Mengajukan aktivasi sebagai ${payload.targetRole.toUpperCase()}`,
    });
  }

  return newApp;
}

export function findAdminSupportingFileById(docId: string): AdminSupportingFile | null {
  const upgrades = getMemberUpgrades();
  for (const u of upgrades) {
    const found = (u.supportingFiles ?? []).find((f) => f.id === docId);
    if (found) return found;
  }
  const complaints = getAdminComplaints();
  for (const c of complaints) {
    const found = (c.supportingFiles ?? []).find((f) => f.id === docId);
    if (found) return found;
  }
  const legal = getPartnerLegalDocs();
  for (const l of legal) {
    const found = (l.supportingFiles ?? []).find((f) => f.id === docId);
    if (found) return found;
  }
  const b2bList = getB2BAndRentals();
  for (const b of b2bList) {
    const found = (b.supportingFiles ?? []).find((f) => f.id === docId);
    if (found) return found;
  }
  const templates = getB2BTemplates();
  for (const t of templates) {
    if (t.pdfFile?.id === docId) return t.pdfFile;
  }

  // Fallback ke data awal apabila localStorage belum tersinkronisasi
  for (const u of INITIAL_MEMBER_UPGRADES) {
    const found = u.supportingFiles.find((f) => f.id === docId);
    if (found) return found;
  }
  for (const c of INITIAL_COMPLAINTS) {
    const found = c.supportingFiles.find((f) => f.id === docId);
    if (found) return found;
  }
  for (const l of INITIAL_LEGAL_DOCS) {
    const found = l.supportingFiles.find((f) => f.id === docId);
    if (found) return found;
  }
  for (const b of INITIAL_B2B_RENTALS) {
    const found = b.supportingFiles.find((f) => f.id === docId);
    if (found) return found;
  }
  for (const t of INITIAL_B2B_TEMPLATES) {
    if (t.pdfFile.id === docId) return t.pdfFile;
  }
  return null;
}

export function useAdminAdministrationStore() {
  const [upgrades, setUpgrades] = useState<MemberUpgradeApplication[]>(INITIAL_MEMBER_UPGRADES);
  const [complaints, setComplaints] = useState<AdminComplaintTicket[]>(INITIAL_COMPLAINTS);
  const [legalDocs, setLegalDocs] = useState<PartnerLegalDocumentRecord[]>(INITIAL_LEGAL_DOCS);
  const [b2bRentals, setB2bRentals] = useState<B2BAndRentalRecord[]>(INITIAL_B2B_RENTALS);
  const [b2bTemplates, setB2bTemplates] = useState<B2BTemplateDocument[]>(INITIAL_B2B_TEMPLATES);
  const [escrowGuards, setEscrowGuards] = useState<PartnerEscrowGuardRecord[]>(
    INITIAL_ESCROW_GUARDS,
  );
  const [royaltyTraffic, setRoyaltyTraffic] = useState<AuthorRoyaltyTrafficRecord[]>(
    INITIAL_ROYALTY_TRAFFIC,
  );
  const [auditTrail, setAuditTrail] = useState<AdminAuditTrailEntry[]>(INITIAL_AUDIT_TRAIL);
  const [activeAdminStaff, setActiveAdminStaffState] = useState<string>(ADMIN_STAFF_LIST[0]);

  useEffect(() => {
    const syncAll = () => {
      setUpgrades(getMemberUpgrades());
      setComplaints(getAdminComplaints());
      setLegalDocs(getPartnerLegalDocs());
      setB2bRentals(getB2BAndRentals());
      setB2bTemplates(getB2BTemplates());
      setEscrowGuards(getPartnerEscrowGuards());
      setRoyaltyTraffic(getRoyaltyTrafficRecords());
      setAuditTrail(getAdminAuditTrail());
      setActiveAdminStaffState(getActiveAdminStaff());
    };
    syncAll();
    window.addEventListener(ADMIN_UPDATE_EVENT, syncAll);
    window.addEventListener('storage', syncAll);
    return () => {
      window.removeEventListener(ADMIN_UPDATE_EVENT, syncAll);
      window.removeEventListener('storage', syncAll);
    };
  }, []);

  const setActiveAdminStaff = (staffName: string) => {
    window.localStorage.setItem(ACTIVE_STAFF_STORAGE_KEY, staffName);
    setActiveAdminStaffState(staffName);
    window.dispatchEvent(new Event(ADMIN_UPDATE_EVENT));
  };

  const recordAudit = (
    category: AdminAuditTrailEntry['category'],
    targetEntity: string,
    actionLabel: string,
    previousState: string,
    newState: string,
    reason: string,
  ) => {
    const staff = getActiveAdminStaff();
    appendAdminAuditLog({
      adminStaff: staff,
      category,
      targetEntity,
      actionLabel,
      previousState,
      newState,
      reason,
    });
    setAuditTrail(getAdminAuditTrail());
  };

  const updateUpgradeApplication = (
    updated: MemberUpgradeApplication,
    auditMeta?: { actionLabel: string; reason?: string },
  ) => {
    const currentList = getMemberUpgrades();
    const prev = currentList.find((i) => i.id === updated.id);
    const next = currentList.map((item) => (item.id === updated.id ? updated : item));
    window.localStorage.setItem(UPGRADE_STORAGE_KEY, JSON.stringify(next));
    setUpgrades(next);

    if (prev) {
      recordAudit(
        'Siklus Akun & KYB',
        `${updated.proposedBusinessName} (${updated.memberName})`,
        auditMeta?.actionLabel || `Ubah Status Pengajuan → ${updated.status}`,
        prev.status,
        updated.status,
        auditMeta?.reason || updated.adminNotes,
      );
    }
    window.dispatchEvent(new Event(ADMIN_UPDATE_EVENT));
  };

  const updateComplaintTicket = (
    updated: AdminComplaintTicket,
    auditMeta?: { actionLabel: string; reason?: string },
  ) => {
    const currentList = getAdminComplaints();
    const prev = currentList.find((i) => i.id === updated.id);
    const next = currentList.map((item) => (item.id === updated.id ? updated : item));
    window.localStorage.setItem(COMPLAINTS_STORAGE_KEY, JSON.stringify(next));
    setComplaints(next);

    if (prev) {
      recordAudit(
        updated.sourceType === 'moderator_escalation'
          ? 'Eskalasi Moderator'
          : 'Mediasi Sengketa & Force Order',
        `${updated.ticketCode} (${updated.reportedPartyName})`,
        auditMeta?.actionLabel || `Keputusan Mediasi / Status → ${updated.status}`,
        `${prev.status} | Split: ${prev.splitDecisionType} | Force: ${prev.forceOrderAction}`,
        `${updated.status} | Split: ${updated.splitDecisionType} | Force: ${updated.forceOrderAction}`,
        auditMeta?.reason || updated.resolutionDecision,
      );
    }
    window.dispatchEvent(new Event(ADMIN_UPDATE_EVENT));
  };

  const updateLegalDocRecord = (
    updated: PartnerLegalDocumentRecord,
    auditMeta?: { actionLabel: string; reason?: string },
  ) => {
    const currentList = getPartnerLegalDocs();
    const prev = currentList.find((i) => i.id === updated.id);
    const next = currentList.map((item) => (item.id === updated.id ? updated : item));
    window.localStorage.setItem(LEGAL_DOCS_STORAGE_KEY, JSON.stringify(next));
    setLegalDocs(next);

    if (prev) {
      recordAudit(
        'Legalitas & Retensi 2 Tahun',
        `${updated.partnerName} (${updated.contractNumber})`,
        auditMeta?.actionLabel || `Perbarui Legalitas → ${updated.adminStatus}`,
        `${prev.adminStatus} | Retensi: ${prev.retentionAlertStatus}`,
        `${updated.adminStatus} | Retensi: ${updated.retentionAlertStatus}`,
        auditMeta?.reason || updated.notes,
      );
    }
    window.dispatchEvent(new Event(ADMIN_UPDATE_EVENT));
  };

  const updateB2BAndRental = (
    updated: B2BAndRentalRecord,
    auditMeta?: { actionLabel: string; reason?: string },
  ) => {
    const currentList = getB2BAndRentals();
    const prev = currentList.find((i) => i.id === updated.id);
    const next = currentList.map((item) => (item.id === updated.id ? updated : item));
    window.localStorage.setItem(B2B_RENTAL_STORAGE_KEY, JSON.stringify(next));
    setB2bRentals(next);

    if (prev) {
      recordAudit(
        'Tata Kelola B2B & Armada',
        `${updated.referenceCode} (${updated.partnerName})`,
        auditMeta?.actionLabel || `Update Tata Kelola B2B/Armada → ${updated.status}`,
        `${prev.status} | Komisi ${prev.customFeePercent}% | Checkbox: ${prev.checkboxApprovalLog.verifiedByAdmin ? 'Sah' : 'Menunggu'}`,
        `${updated.status} | Komisi ${updated.customFeePercent}% | Checkbox: ${updated.checkboxApprovalLog.verifiedByAdmin ? 'Sah' : 'Menunggu'}`,
        auditMeta?.reason || updated.adminNotes,
      );
    }
    window.dispatchEvent(new Event(ADMIN_UPDATE_EVENT));
  };

  const addOrUpdateB2BTemplate = (template: B2BTemplateDocument) => {
    const currentList = getB2BTemplates();
    const exists = currentList.some((t) => t.id === template.id);
    const next = exists
      ? currentList.map((t) => (t.id === template.id ? template : t))
      : [template, ...currentList];
    window.localStorage.setItem(B2B_TEMPLATES_STORAGE_KEY, JSON.stringify(next));
    setB2bTemplates(next);

    recordAudit(
      'Tata Kelola B2B & Armada',
      `${template.title} (${template.version})`,
      exists ? 'Perbarui Draf Formulir PDF B2B' : 'Unggah Draf Formulir PDF B2B Baru',
      exists ? 'Versi Sebelumnya' : 'Belum Ada',
      template.version,
      `Diunggah oleh ${template.updatedBy} pada ${template.updatedAt}`,
    );
    window.dispatchEvent(new Event(ADMIN_UPDATE_EVENT));
  };

  const updateEscrowGuard = (
    updated: PartnerEscrowGuardRecord,
    auditMeta?: { actionLabel: string; reason?: string },
  ) => {
    const currentList = getPartnerEscrowGuards();
    const prev = currentList.find((i) => i.id === updated.id);
    const next = currentList.map((item) => (item.id === updated.id ? updated : item));
    window.localStorage.setItem(ESCROW_GUARD_STORAGE_KEY, JSON.stringify(next));
    setEscrowGuards(next);

    if (prev) {
      recordAudit(
        'Pengaman Escrow & Royalti',
        `${updated.partnerName} (Saldo Rp ${updated.escrowBalanceRp.toLocaleString('id-ID')})`,
        auditMeta?.actionLabel ||
          (updated.payoutStatus === 'held_investigation'
            ? 'Aktifkan Hold Payout (Tahan Pencairan)'
            : 'Lepas Hold Payout (Pencairan Normal)'),
        prev.payoutStatus,
        updated.payoutStatus,
        auditMeta?.reason || updated.holdReason,
      );
    }
    window.dispatchEvent(new Event(ADMIN_UPDATE_EVENT));
  };

  const updateRoyaltyTraffic = (
    updated: AuthorRoyaltyTrafficRecord,
    auditMeta?: { actionLabel: string; reason?: string },
  ) => {
    const currentList = getRoyaltyTrafficRecords();
    const prev = currentList.find((i) => i.id === updated.id);
    const next = currentList.map((item) => (item.id === updated.id ? updated : item));
    window.localStorage.setItem(ROYALTY_TRAFFIC_STORAGE_KEY, JSON.stringify(next));
    setRoyaltyTraffic(next);

    if (prev) {
      recordAudit(
        'Pengaman Escrow & Royalti',
        `${updated.articleTitle} (${updated.authorName})`,
        auditMeta?.actionLabel || `Validasi Trafik Royalti → ${updated.auditStatus}`,
        `Raw ${prev.rawViews.toLocaleString('id-ID')} | Bot ${prev.botFlaggedViews.toLocaleString('id-ID')}`,
        `Valid ${updated.validViews.toLocaleString('id-ID')} (Rp ${updated.estimatedRoyaltyRp.toLocaleString('id-ID')})`,
        auditMeta?.reason || updated.botDetectionNote,
      );
    }
    window.dispatchEvent(new Event(ADMIN_UPDATE_EVENT));
  };

  const resetAdminStore = () => {
    window.localStorage.setItem(UPGRADE_STORAGE_KEY, JSON.stringify(INITIAL_MEMBER_UPGRADES));
    window.localStorage.setItem(COMPLAINTS_STORAGE_KEY, JSON.stringify(INITIAL_COMPLAINTS));
    window.localStorage.setItem(LEGAL_DOCS_STORAGE_KEY, JSON.stringify(INITIAL_LEGAL_DOCS));
    window.localStorage.setItem(B2B_RENTAL_STORAGE_KEY, JSON.stringify(INITIAL_B2B_RENTALS));
    window.localStorage.setItem(B2B_TEMPLATES_STORAGE_KEY, JSON.stringify(INITIAL_B2B_TEMPLATES));
    window.localStorage.setItem(ESCROW_GUARD_STORAGE_KEY, JSON.stringify(INITIAL_ESCROW_GUARDS));
    window.localStorage.setItem(ROYALTY_TRAFFIC_STORAGE_KEY, JSON.stringify(INITIAL_ROYALTY_TRAFFIC));
    window.localStorage.setItem(AUDIT_TRAIL_STORAGE_KEY, JSON.stringify(INITIAL_AUDIT_TRAIL));
    setUpgrades(INITIAL_MEMBER_UPGRADES);
    setComplaints(INITIAL_COMPLAINTS);
    setLegalDocs(INITIAL_LEGAL_DOCS);
    setB2bRentals(INITIAL_B2B_RENTALS);
    setB2bTemplates(INITIAL_B2B_TEMPLATES);
    setEscrowGuards(INITIAL_ESCROW_GUARDS);
    setRoyaltyTraffic(INITIAL_ROYALTY_TRAFFIC);
    setAuditTrail(INITIAL_AUDIT_TRAIL);
    window.dispatchEvent(new Event(ADMIN_UPDATE_EVENT));
  };

  const blacklistedNikSet = upgrades
    .filter((u) => u.isBlacklistedNikNpwp || u.status === 'blacklisted')
    .map((u) => ({
      id: u.id,
      name: u.memberName,
      businessName: u.proposedBusinessName,
      nik: u.rawNik || u.ktpNumber,
      npwp: u.npwpNumber,
      reason: u.blacklistReason || u.adminNotes,
    }));

  return {
    upgrades,
    complaints,
    legalDocs,
    b2bRentals,
    b2bTemplates,
    escrowGuards,
    royaltyTraffic,
    auditTrail,
    activeAdminStaff,
    blacklistedNikSet,
    setActiveAdminStaff,
    updateUpgradeApplication,
    updateComplaintTicket,
    updateLegalDocRecord,
    updateB2BAndRental,
    addOrUpdateB2BTemplate,
    updateEscrowGuard,
    updateRoyaltyTraffic,
    recordAudit,
    resetAdminStore,
  };
}
