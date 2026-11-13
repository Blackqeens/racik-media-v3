'use client';

import React, { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  AlertTriangle,
  ArrowRightLeft,
  BadgeCheck,
  Ban,
  Bot,
  CalendarClock,
  CheckCircle2,
  ClipboardCheck,
  ExternalLink,
  Eye,
  FileCheck2,
  FileText,
  FileUp,
  Gavel,
  History,
  Image as ImageIcon,
  Lock,
  PauseCircle,
  Percent,
  RotateCcw,
  Scale,
  Search,
  ShieldAlert,
  ShieldCheck,
  Split,
  Store,
  Truck,
  Undo2,
  Unlock,
  UserCheck,
  UserCog,
  Wallet,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import {
  ADMIN_STAFF_LIST,
  AdminComplaintTicket,
  AdminSupportingFile,
  ApplicationStatus,
  AuthorRoyaltyTrafficRecord,
  B2BAndRentalRecord,
  B2BTemplateDocument,
  ComplaintStatus,
  ForceOrderActionType,
  MemberUpgradeApplication,
  PartnerEscrowGuardRecord,
  PartnerLegalDocumentRecord,
  SplitDecisionType,
  useAdminAdministrationStore,
} from '@/lib/admin-administration-store';

export type AdminCenterTab =
  | 'all'
  | 'upgrades'
  | 'complaints'
  | 'legality'
  | 'b2b_fleet'
  | 'escrow_royalty'
  | 'audit_trail';

const VALID_TABS: AdminCenterTab[] = [
  'all',
  'upgrades',
  'complaints',
  'legality',
  'b2b_fleet',
  'escrow_royalty',
  'audit_trail',
];

interface AdminAdministrationCenterProps {
  initialTab?: AdminCenterTab;
}

function formatRupiah(amount: number): string {
  return `Rp ${Math.max(0, Math.round(amount)).toLocaleString('id-ID')}`;
}

function AdminTabQuerySync({
  onSyncTab,
}: {
  onSyncTab: (tab: AdminCenterTab) => void;
}) {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab') as AdminCenterTab | null;

  useEffect(() => {
    if (tabParam && VALID_TABS.includes(tabParam)) {
      onSyncTab(tabParam);
    }
  }, [tabParam, onSyncTab]);

  return null;
}

export function AdminAdministrationCenter({
  initialTab = 'all',
}: AdminAdministrationCenterProps) {
  const {
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
    resetAdminStore,
  } = useAdminAdministrationStore();

  const [activeTab, setActiveTab] = useState<AdminCenterTab>(initialTab);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  // Pillar 1 Modal: Verifikasi / Suspend / Blacklist / Revisi Pengajuan KYB
  const [selectedUpgrade, setSelectedUpgrade] = useState<MemberUpgradeApplication | null>(null);
  const [upgradeNoteDraft, setUpgradeNoteDraft] = useState('');

  // Pillar 2 Modal: Mediasi Ganda (Split Decision), Eskalasi Moderator & Force Action
  const [selectedComplaint, setSelectedComplaint] = useState<AdminComplaintTicket | null>(null);
  const [complaintDecisionDraft, setComplaintDecisionDraft] = useState('');
  const [splitTypeDraft, setSplitTypeDraft] = useState<SplitDecisionType>('none');
  const [refundBuyerDraft, setRefundBuyerDraft] = useState<number>(0);
  const [forceActionDraft, setForceActionDraft] = useState<ForceOrderActionType>('none');
  const [holdEscrowDraft, setHoldEscrowDraft] = useState<boolean>(false);

  // Pillar 3 Modal: B2B Custom Fee Override, Checkbox Approval Log & STNK/KIR Armada
  const [selectedB2B, setSelectedB2B] = useState<B2BAndRentalRecord | null>(null);
  const [customFeeDraft, setCustomFeeDraft] = useState<number>(5);
  const [additionalFeeDraft, setAdditionalFeeDraft] = useState<number>(0);
  const [feeReasonDraft, setFeeReasonDraft] = useState('');
  const [b2bNotesDraft, setB2bNotesDraft] = useState('');
  const [showUploadTemplateModal, setShowUploadTemplateModal] = useState(false);
  const [tplTitleDraft, setTplTitleDraft] = useState('');
  const [tplVersionDraft, setTplVersionDraft] = useState('FORM-B2B-RM-v4.3');
  const [tplSummaryDraft, setTplSummaryDraft] = useState('');

  // Pillar 4 Modal: Edit Manual Bot Views Royalti jika Admin ingin koreksi tambahan
  const [editingRoyalty, setEditingRoyalty] = useState<AuthorRoyaltyTrafficRecord | null>(null);
  const [botDeductDraft, setBotDeductDraft] = useState<number>(0);

  // Pratinjau GAMBAR langsung di dalam Dashboard Admin
  const [previewImageFile, setPreviewImageFile] = useState<AdminSupportingFile | null>(null);
  const [imageZoom, setImageZoom] = useState<number>(100);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab') as AdminCenterTab | null;
    if (tabParam && VALID_TABS.includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, []);

  const showToast = (msg: string) => {
    setActionFeedback(msg);
    setTimeout(() => {
      setActionFeedback((prev) => (prev === msg ? null : prev));
    }, 5500);
  };

  const stats = useMemo(() => {
    const pendingUpgrades = upgrades.filter(
      (u) => u.status === 'pending_review' || u.status === 'need_revision',
    ).length;
    const activeComplaints = complaints.filter(
      (c) => c.status === 'open' || c.status === 'in_mediation' || c.status === 'escalated_legal',
    ).length;
    const moderatorEscalations = complaints.filter(
      (c) => c.sourceType === 'moderator_escalation' && c.status !== 'resolved',
    ).length;
    const resolvedComplaints = complaints.filter((c) => c.status === 'resolved').length;
    const retentionAlerts =
      legalDocs.filter((l) => l.retentionAlertStatus !== 'ok').length +
      upgrades.filter((u) => u.retentionAlertStatus !== 'ok').length;
    const pendingB2BFleet = b2bRentals.filter((b) => b.status !== 'approved').length;
    const heldEscrows = escrowGuards.filter((e) => e.payoutStatus === 'held_investigation').length;
    const pendingRoyalties = royaltyTraffic.filter((r) => r.auditStatus === 'pending_filter').length;

    return {
      totalUpgrades: upgrades.length,
      pendingUpgrades,
      totalComplaints: complaints.length,
      activeComplaints,
      moderatorEscalations,
      resolvedComplaints,
      totalLegalDocs: legalDocs.length,
      retentionAlerts,
      totalB2BFleet: b2bRentals.length,
      pendingB2BFleet,
      heldEscrows,
      pendingRoyalties,
      auditCount: auditTrail.length,
    };
  }, [upgrades, complaints, legalDocs, b2bRentals, escrowGuards, royaltyTraffic, auditTrail]);

  const filteredUpgrades = useMemo(() => {
    if (!searchTerm.trim()) return upgrades;
    const q = searchTerm.toLowerCase();
    return upgrades.filter((u) =>
      `${u.memberName} ${u.proposedBusinessName} ${u.region} ${u.commodityFocus} ${u.ktpNumber} ${u.npwpNumber} ${u.assignedAdminStaff}`
        .toLowerCase()
        .includes(q),
    );
  }, [upgrades, searchTerm]);

  const filteredComplaints = useMemo(() => {
    if (!searchTerm.trim()) return complaints;
    const q = searchTerm.toLowerCase();
    return complaints.filter((c) =>
      `${c.ticketCode} ${c.reporterName} ${c.reportedPartyName} ${c.subject} ${c.category} ${c.assignedAdminStaff}`
        .toLowerCase()
        .includes(q),
    );
  }, [complaints, searchTerm]);

  const filteredLegalDocs = useMemo(() => {
    if (!searchTerm.trim()) return legalDocs;
    const q = searchTerm.toLowerCase();
    return legalDocs.filter((l) =>
      `${l.partnerName} ${l.contractNumber} ${l.region} ${l.partnerRole} ${l.assignedAdminStaff}`
        .toLowerCase()
        .includes(q),
    );
  }, [legalDocs, searchTerm]);

  const filteredB2B = useMemo(() => {
    if (!searchTerm.trim()) return b2bRentals;
    const q = searchTerm.toLowerCase();
    return b2bRentals.filter((b) =>
      `${b.referenceCode} ${b.partnerName} ${b.title} ${b.vehiclePlate ?? ''} ${b.region}`
        .toLowerCase()
        .includes(q),
    );
  }, [b2bRentals, searchTerm]);

  const filteredAuditTrail = useMemo(() => {
    if (!searchTerm.trim()) return auditTrail;
    const q = searchTerm.toLowerCase();
    return auditTrail.filter((a) =>
      `${a.adminStaff} ${a.category} ${a.targetEntity} ${a.actionLabel} ${a.reason}`
        .toLowerCase()
        .includes(q),
    );
  }, [auditTrail, searchTerm]);

  function openImagePreviewInDashboard(file: AdminSupportingFile) {
    setPreviewImageFile(file);
    setImageZoom(100);
  }

  // ── PILLAR 1 HANDLERS ──
  function openUpgradeModal(item: MemberUpgradeApplication) {
    setSelectedUpgrade(item);
    setUpgradeNoteDraft(item.adminNotes);
  }

  function handleSaveUpgradeDecision(status: ApplicationStatus) {
    if (!selectedUpgrade) return;
    const noteText =
      upgradeNoteDraft.trim() ||
      (status === 'approved'
        ? `Disetujui oleh ${activeAdminStaff} menjadi ${selectedUpgrade.targetRole.toUpperCase()} resmi.`
        : status === 'need_revision'
          ? 'Diminta melengkapi/memperbaiki berkas pendukung (Pending Revision) tanpa membatalkan pendaftaran.'
          : status === 'suspended'
            ? 'Akun & toko dibekukan sementara oleh Role Admin sambil menunggu audit kepatuhan.'
            : status === 'blacklisted'
              ? 'NIK & NPWP dimasukkan ke Daftar Hitam permanen platform agar tidak dapat mendaftar ulang.'
              : 'Pengajuan ditolak karena dokumen tidak memenuhi syarat legalitas.');

    updateUpgradeApplication(
      {
        ...selectedUpgrade,
        status,
        adminNotes: noteText,
        isBlacklistedNikNpwp:
          status === 'blacklisted' ? true : selectedUpgrade.isBlacklistedNikNpwp,
        blacklistReason: status === 'blacklisted' ? noteText : selectedUpgrade.blacklistReason,
        suspendedReason: status === 'suspended' ? noteText : selectedUpgrade.suspendedReason,
        approvedAt: status === 'approved' ? 'Baru saja' : selectedUpgrade.approvedAt,
        approvedBy: status === 'approved' ? activeAdminStaff : selectedUpgrade.approvedBy,
      },
      {
        actionLabel:
          status === 'approved'
            ? 'Setujui Pengajuan KYB'
            : status === 'need_revision'
              ? 'Minta Revisi Berkas (Pending Revision)'
              : status === 'suspended'
                ? 'Bekukan Akun / Toko Sementara (Suspend)'
                : status === 'blacklisted'
                  ? 'Blokir Permanen & Blacklist NIK/NPWP'
                  : 'Tolak Pengajuan KYB',
        reason: noteText,
      },
    );
    showToast(`Status ${selectedUpgrade.proposedBusinessName} diperbarui ke "${status}" & tercatat di Audit Trail.`);
    setSelectedUpgrade(null);
  }

  function handleUndoApproval(item: MemberUpgradeApplication) {
    if (item.hasTransactions) {
      showToast(
        `Ditolak sistem: ${item.proposedBusinessName} sudah memiliki transaksi berjalan. Gunakan "Bekukan (Suspend)" bukan Undo Approval.`,
      );
      return;
    }
    updateUpgradeApplication(
      {
        ...item,
        status: 'pending_review',
        adminNotes: `Undo Approval dilakukan oleh ${activeAdminStaff}: persetujuan dibatalkan sebelum ada transaksi untuk verifikasi ulang.`,
      },
      {
        actionLabel: 'Undo Approval (Batalkan Persetujuan)',
        reason: 'Pembatalan keputusan Setujui Cepat sebelum mitra memiliki transaksi pertama.',
      },
    );
    showToast(`Undo Approval berhasil: ${item.proposedBusinessName} dikembalikan ke antrean Verifikasi Admin.`);
  }

  function handleReassignUpgradeStaff(item: MemberUpgradeApplication, nextStaff: string) {
    if (nextStaff === item.assignedAdminStaff) return;
    updateUpgradeApplication(
      {
        ...item,
        assignedAdminStaff: nextStaff,
      },
      {
        actionLabel: `Pengalihan Antrean KYB → ${nextStaff}`,
        reason: `Dialihkan dari ${item.assignedAdminStaff} ke ${nextStaff}`,
      },
    );
    showToast(`Antrean ${item.proposedBusinessName} dialihkan ke ${nextStaff}.`);
  }

  // ── PILLAR 2 HANDLERS ──
  function openComplaintModal(item: AdminComplaintTicket) {
    setSelectedComplaint(item);
    setComplaintDecisionDraft(item.resolutionDecision);
    setSplitTypeDraft(item.splitDecisionType || 'none');
    setRefundBuyerDraft(item.refundBuyerAmountRp || 0);
    setForceActionDraft(item.forceOrderAction || 'none');
    setHoldEscrowDraft(item.escrowHoldActive);
  }

  function handleSaveComplaintDecision(status: ComplaintStatus) {
    if (!selectedComplaint) return;
    const totalEscrow = selectedComplaint.escrowAmountRp;
    let refundRp = 0;
    let releaseRp = 0;

    if (splitTypeDraft === 'full_refund') {
      refundRp = totalEscrow;
      releaseRp = 0;
    } else if (splitTypeDraft === 'partial_split') {
      refundRp = Math.min(Math.max(0, refundBuyerDraft), totalEscrow);
      releaseRp = Math.max(0, totalEscrow - refundRp);
    } else if (splitTypeDraft === 'release_to_seller') {
      refundRp = 0;
      releaseRp = totalEscrow;
    }

    const decisionNote =
      complaintDecisionDraft.trim() ||
      `Eksekusi Admin (${activeAdminStaff}): Split=${splitTypeDraft}, Force=${forceActionDraft}, Hold=${holdEscrowDraft ? 'Ya' : 'Tidak'}.`;

    updateComplaintTicket(
      {
        ...selectedComplaint,
        status,
        splitDecisionType: splitTypeDraft,
        refundBuyerAmountRp: refundRp,
        releaseSellerAmountRp: releaseRp,
        forceOrderAction: forceActionDraft,
        escrowHoldActive: holdEscrowDraft,
        resolutionDecision: decisionNote,
      },
      {
        actionLabel: `Mediasi & Eksekusi (${status})`,
        reason: decisionNote,
      },
    );
    showToast(`Keputusan mediasi ${selectedComplaint.ticketCode} disimpan & dicatat di Audit Trail.`);
    setSelectedComplaint(null);
  }

  function handleQuickForceOrder(ticket: AdminComplaintTicket, action: ForceOrderActionType) {
    const isComplete = action === 'force_completed';
    const nextSplit: SplitDecisionType = isComplete ? 'release_to_seller' : 'full_refund';
    const reasonText = isComplete
      ? `Force Complete Order dieksekusi oleh ${activeAdminStaff}: SLA terlampaui, dana ${formatRupiah(ticket.escrowAmountRp)} diteruskan ke Penjual.`
      : `Force Cancel Order dieksekusi oleh ${activeAdminStaff}: pesanan dibatalkan paksa, dana ${formatRupiah(ticket.escrowAmountRp)} dikembalikan penuh ke Pembeli.`;

    updateComplaintTicket(
      {
        ...ticket,
        status: 'resolved',
        forceOrderAction: action,
        splitDecisionType: nextSplit,
        refundBuyerAmountRp: isComplete ? 0 : ticket.escrowAmountRp,
        releaseSellerAmountRp: isComplete ? ticket.escrowAmountRp : 0,
        escrowHoldActive: false,
        resolutionDecision: reasonText,
      },
      {
        actionLabel: isComplete ? 'Force Complete Order' : 'Force Cancel Order',
        reason: reasonText,
      },
    );
    showToast(`${isComplete ? 'Force Complete' : 'Force Cancel'} pada ${ticket.ticketCode} berhasil dieksekusi.`);
  }

  function handleReassignComplaintStaff(ticket: AdminComplaintTicket, nextStaff: string) {
    if (nextStaff === ticket.assignedAdminStaff) return;
    updateComplaintTicket(
      {
        ...ticket,
        assignedAdminStaff: nextStaff,
      },
      {
        actionLabel: `Alihkan Tiket Sengketa → ${nextStaff}`,
        reason: `Dialihkan dari ${ticket.assignedAdminStaff} ke ${nextStaff}`,
      },
    );
    showToast(`Tiket ${ticket.ticketCode} dialihkan ke ${nextStaff}.`);
  }

  // ── PILLAR 1 + 4 LEGAL DOCS & 2-YEAR RETENTION HANDLERS ──
  function handleSend2YearRetentionReminder(doc: PartnerLegalDocumentRecord) {
    updateLegalDocRecord(
      {
        ...doc,
        retentionReminderSentAt: 'Baru saja oleh ' + activeAdminStaff,
        notes: `${doc.notes} [Pengingat Pembaruan Data & Alamat 2-Tahunan telah dikirim ke mitra]`,
      },
      {
        actionLabel: 'Kirim Pengingat Pembaruan Berkala (Siklus 2 Tahun)',
        reason: `Pengingat pembaruan data & alamat siklus 2 tahun dikirim kepada ${doc.partnerName}.`,
      },
    );
    showToast(`Pengingat pembaruan 2 tahun dikirim ke ${doc.partnerName}.`);
  }

  function handleMark2YearRenewed(doc: PartnerLegalDocumentRecord) {
    updateLegalDocRecord(
      {
        ...doc,
        retentionAlertStatus: 'ok',
        dataRetentionDueAt: '11 Nov 2028 (Terbarui Siklus 2 Tahun)',
        adminStatus: 'verified',
        lastVerifiedAt: 'Hari ini (' + activeAdminStaff + ')',
        notes: 'Data legalitas, alamat gudang/toko, dan izin edar telah diperbarui untuk siklus 2 tahun berikutnya.',
      },
      {
        actionLabel: 'Konfirmasi Pembaruan Data Siklus 2 Tahun',
        reason: 'Mitra telah memvalidasi ulang alamat dan sertifikat berlaku 2 tahun ke depan.',
      },
    );
    showToast(`Siklus retensi 2 tahun ${doc.partnerName} berhasil diperbarui.`);
  }

  function handleToggleLegalHoldPayout(doc: PartnerLegalDocumentRecord) {
    const nextHold = !doc.escrowHoldActive;
    updateLegalDocRecord(
      {
        ...doc,
        escrowHoldActive: nextHold,
      },
      {
        actionLabel: nextHold
          ? 'Aktifkan Hold Payout dari Panel Legalitas'
          : 'Lepas Hold Payout dari Panel Legalitas',
        reason: nextHold
          ? `Pencairan Escrow ${doc.partnerName} ditahan sementara selama audit dokumen legalitas.`
          : `Audit legalitas ${doc.partnerName} selesai, pencairan Escrow dibuka kembali.`,
      },
    );
    showToast(
      nextHold
        ? `Hold Payout diaktifkan untuk ${doc.partnerName}.`
        : `Hold Payout dilepas untuk ${doc.partnerName}.`,
    );
  }

  // ── PILLAR 3: B2B & FLEET RENTAL HANDLERS ──
  function openB2BModal(record: B2BAndRentalRecord) {
    setSelectedB2B(record);
    setCustomFeeDraft(record.customFeePercent);
    setAdditionalFeeDraft(record.additionalServiceFeeRp);
    setFeeReasonDraft(record.feeOverrideReason);
    setB2bNotesDraft(record.adminNotes);
  }

  function handleSaveB2BGovernance(nextStatus: B2BAndRentalRecord['status']) {
    if (!selectedB2B) return;
    if (
      nextStatus === 'approved' &&
      selectedB2B.governanceType === 'fleet_rental' &&
      (selectedB2B.stnkStatus === 'expired' || selectedB2B.kirStatus === 'expired')
    ) {
      showToast(
        'Diblokir sistem: Sewa Armada tidak boleh disetujui apabila STNK atau Buku Uji KIR berstatus KEDALUWARSA.',
      );
      return;
    }

    updateB2BAndRental(
      {
        ...selectedB2B,
        status: nextStatus,
        customFeePercent: customFeeDraft,
        additionalServiceFeeRp: additionalFeeDraft,
        feeOverrideReason: feeReasonDraft.trim() || selectedB2B.feeOverrideReason,
        feeOverrideLocked: nextStatus === 'approved' ? true : selectedB2B.feeOverrideLocked,
        checkboxApprovalLog: {
          ...selectedB2B.checkboxApprovalLog,
          verifiedByAdmin:
            nextStatus === 'approved' ? true : selectedB2B.checkboxApprovalLog.verifiedByAdmin,
        },
        adminNotes: b2bNotesDraft.trim() || selectedB2B.adminNotes,
      },
      {
        actionLabel:
          selectedB2B.governanceType === 'fleet_rental'
            ? `Validasi Kelayakan Armada (STNK/KIR) → ${nextStatus}`
            : `Keputusan Tata Kelola B2B & Custom Fee (${customFeeDraft}%) → ${nextStatus}`,
        reason: b2bNotesDraft.trim() || feeReasonDraft,
      },
    );
    showToast(`Rekaman ${selectedB2B.referenceCode} disimpan dengan status "${nextStatus}".`);
    setSelectedB2B(null);
  }

  function handleSaveNewTemplatePdf(e: React.FormEvent) {
    e.preventDefault();
    if (!tplTitleDraft.trim()) return;
    const ver = tplVersionDraft.trim() || 'FORM-B2B-RM-v4.3';
    const docId = `doc-tpl-${Date.now()}`;
    const newTpl: B2BTemplateDocument = {
      id: `tpl-${Date.now()}`,
      title: tplTitleDraft.trim(),
      version: ver,
      updatedAt: 'Hari ini (Baru Diunggah)',
      updatedBy: activeAdminStaff,
      pdfFile: {
        id: docId,
        label: `${tplTitleDraft.trim()}.pdf`,
        fileName: `${ver.replace(/[^a-zA-Z0-9._-]/g, '_')}.pdf`,
        fileType: 'pdf',
        fileSize: '580 KB',
        documentNumber: ver,
        issuer: `Role Admin (${activeAdminStaff})`,
        issuedDate: 'Hari ini',
        validUntil: 'Berlaku Aktif',
        applicantOrOwner: 'Seluruh Mitra B2B & Penyewa Armada',
        businessName: 'Racik Media Nusantara',
        address: 'Platform Nasional',
        verificationMatchSummary:
          tplSummaryDraft.trim() ||
          'Draf formulir bantuan PDF terbaru telah diunggah oleh Role Admin untuk persetujuan digital Checkbox Approval.',
        isDataMatching: true,
        pdfSections: [
          {
            heading: 'I. DRAF FORMULIR BANTUAN & KESEPAKATAN DIGITAL B2B',
            content: [
              `Judul Dokumen  : ${tplTitleDraft.trim()}`,
              `Versi Resmi    : ${ver}`,
              `Diunggah Oleh  : ${activeAdminStaff}`,
              `Ringkasan Isi  : ${tplSummaryDraft.trim() || 'Ketentuan persetujuan digital tanpa tanda tangan basah.'}`,
            ],
          },
        ],
      },
    };
    addOrUpdateB2BTemplate(newTpl);
    setTplTitleDraft('');
    setTplSummaryDraft('');
    setShowUploadTemplateModal(false);
    showToast(`Draf formulir PDF "${ver}" berhasil diunggah dan tercatat di Audit Trail.`);
  }

  // ── PILLAR 4: ESCROW & ROYALTY TRAFFIC HANDLERS ──
  function handleToggleEscrowGuard(record: PartnerEscrowGuardRecord) {
    const nextStatus =
      record.payoutStatus === 'held_investigation' ? 'normal' : 'held_investigation';
    updateEscrowGuard(
      {
        ...record,
        payoutStatus: nextStatus,
        holdReason:
          nextStatus === 'held_investigation'
            ? `Hold Payout diaktifkan oleh ${activeAdminStaff} untuk pengamanan investigasi komplain / audit.`
            : `Hold Payout dilepas oleh ${activeAdminStaff} — dana siap dicairkan sesuai jadwal Escrow.`,
        updatedAt: 'Baru saja',
        updatedBy: activeAdminStaff,
      },
      {
        actionLabel:
          nextStatus === 'held_investigation'
            ? 'Aktifkan Hold Payout Mitra'
            : 'Lepas Hold Payout Mitra',
      },
    );
    showToast(
      nextStatus === 'held_investigation'
        ? `Pencairan ${record.partnerName} ditahan (Hold Payout).`
        : `Pencairan ${record.partnerName} dibuka kembali.`,
    );
  }

  function handleApproveBotFilteredRoyalty(item: AuthorRoyaltyTrafficRecord, customBotCount?: number) {
    const botDeducted =
      typeof customBotCount === 'number'
        ? Math.min(Math.max(0, customBotCount), item.rawViews)
        : item.botFlaggedViews;
    const validViews = Math.max(0, item.rawViews - botDeducted);
    const recalculatedRoyalty = Math.round((validViews / 1000) * item.ratePerThousandViewsRp);

    updateRoyaltyTraffic(
      {
        ...item,
        botFlaggedViews: botDeducted,
        validViews,
        estimatedRoyaltyRp: recalculatedRoyalty,
        auditStatus: 'bot_deducted_approved',
        reviewedBy: activeAdminStaff,
        reviewedAt: 'Baru saja',
        botDetectionNote: `${botDeducted.toLocaleString('id-ID')} hit terindikasi bot dipotong oleh ${activeAdminStaff}. ${validViews.toLocaleString('id-ID')} valid views diteruskan ke pencairan royalti.`,
      },
      {
        actionLabel: 'Filter Bot Views & Setujui Royalti Valid',
        reason: `Memotong ${botDeducted.toLocaleString('id-ID')} views bot → sisa ${validViews.toLocaleString('id-ID')} valid views (${formatRupiah(recalculatedRoyalty)}).`,
      },
    );
    showToast(
      `Trafik royalti "${item.articleTitle}" dibersihkan (${botDeducted.toLocaleString('id-ID')} hit bot dipotong).`,
    );
    setEditingRoyalty(null);
  }

  function handleHoldRoyaltyAudit(item: AuthorRoyaltyTrafficRecord) {
    updateRoyaltyTraffic(
      {
        ...item,
        auditStatus: 'held_audit',
        reviewedBy: activeAdminStaff,
        reviewedAt: 'Baru saja',
      },
      {
        actionLabel: 'Tahan Pencairan Royalti (Audit Trafik Anomali)',
        reason: 'Trafik anomali ditahan sementara menunggu investigasi lebih lanjut.',
      },
    );
    showToast(`Pencairan royalti "${item.articleTitle}" ditahan sementara.`);
  }

  /**
   * Render tombol berkas pendukung:
   * - Gambar (`image`) -> Klik membuka pratinjau langsung di dalam Dashboard Admin
   * - PDF (`pdf`)      -> Klik membuka Tab Baru terisolasi (`/admin/document-viewer/[docId]`)
   */
  function renderSupportingFileButton(file: AdminSupportingFile) {
    if (file.fileType === 'image') {
      return (
        <button
          key={file.id}
          type="button"
          onClick={() => openImagePreviewInDashboard(file)}
          className="inline-flex items-center gap-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 border border-sky-200 px-3 py-1.5 text-[11px] font-bold text-sky-900 shadow-sm transition"
          title="Klik untuk melihat gambar langsung di Dashboard Admin"
        >
          <ImageIcon className="h-3.5 w-3.5 text-sky-600 shrink-0" />
          <span>{file.label}</span>
          <span className="rounded-md bg-sky-600 px-1.5 py-0.5 text-[9px] font-extrabold uppercase text-white">
            Gambar • Dashboard
          </span>
        </button>
      );
    }

    return (
      <a
        key={file.id}
        href={`/admin/document-viewer/${encodeURIComponent(file.id)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 px-3 py-1.5 text-[11px] font-bold text-amber-950 shadow-sm transition"
        title="Klik untuk membuka dan memeriksa isi PDF di Tab Baru"
      >
        <FileText className="h-3.5 w-3.5 text-rose-600 shrink-0" />
        <span>{file.label}</span>
        <span className="inline-flex items-center gap-0.5 rounded-md bg-rose-600 px-1.5 py-0.5 text-[9px] font-extrabold uppercase text-white">
          PDF • Tab Baru <ExternalLink className="h-2.5 w-2.5" />
        </span>
      </a>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8 py-8">
      <Suspense fallback={null}>
        <AdminTabQuerySync onSyncTab={setActiveTab} />
      </Suspense>
      {/* Toast Notifikasi Aksi Admin */}
      {actionFeedback && (
        <div className="fixed bottom-5 right-5 z-[160] max-w-md rounded-2xl border border-emerald-300 bg-slate-950 px-4 py-3 text-xs font-bold text-white shadow-2xl flex items-center gap-2.5">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span className="leading-snug">{actionFeedback}</span>
        </div>
      )}

      {/* ── HERO DASHBOARD ROLE ADMIN — Animasi CSS Slow, Kontras Tinggi, 5 Pilar Kendali ── */}
      <div className="dashboard-hero-slow relative isolate overflow-hidden rounded-2xl border border-violet-300/60 p-6 sm:p-7 text-white shadow-xl">
        <div
          aria-hidden="true"
          className="dashboard-hero-orb-a pointer-events-none absolute -left-16 -top-20 -z-10 h-72 w-72 rounded-full bg-violet-400/30 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="dashboard-hero-orb-b pointer-events-none absolute -bottom-24 right-8 -z-10 h-80 w-80 rounded-full bg-emerald-400/30 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="dashboard-hero-grid-drift pointer-events-none absolute inset-0 -z-10 opacity-20"
        />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 lg:items-center gap-6">
          <div className="lg:col-span-7 min-w-0 space-y-3">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white leading-tight drop-shadow-sm">
              Pusat Administrasi Mitra, Mediasi Sengketa, B2B Armada, Pengaman Dana &amp; Audit Trail
            </h1>

            <p className="text-xs sm:text-sm text-white/95 leading-relaxed">
              Role <strong className="text-amber-200">Admin</strong> mengendalikan penuh siklus hidup akun &amp; blacklist NIK/NPWP, eksekusi <strong className="text-white underline decoration-amber-400/80 underline-offset-2">Split Decision &amp; Force Order, Eskalasi Moderator, validasi B2B + STNK/KIR armada, Hold Payout &amp; Filter Bot Royalti</strong>, hingga <strong className="text-emerald-300">Audit Trail Permanen &amp; Undo Approval</strong>.
            </p>
          </div>

          <div className="lg:col-span-5 min-w-0 flex flex-col gap-2.5 w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setActiveTab('upgrades')}
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border-2 border-white bg-white hover:bg-violet-50 px-3 py-2.5 text-xs font-extrabold text-slate-900 shadow-md transition text-center leading-snug"
              >
                <UserCheck className="h-4 w-4 text-violet-700 shrink-0" />
                <span>KYB &amp; Siklus Akun ({stats.pendingUpgrades})</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('complaints')}
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border-2 border-white bg-white hover:bg-violet-50 px-3 py-2.5 text-xs font-extrabold text-slate-900 shadow-md transition text-center leading-snug"
              >
                <Scale className="h-4 w-4 text-rose-600 shrink-0" />
                <span>Sengketa &amp; Eskalasi ({stats.activeComplaints})</span>
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setActiveTab('b2b_fleet')}
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 px-3 py-2.5 text-xs font-extrabold text-white shadow-lg transition text-center leading-snug"
              >
                <Truck className="h-4 w-4 shrink-0" />
                <span>B2B &amp; Armada KIR ({stats.pendingB2BFleet})</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('escrow_royalty')}
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 px-3 py-2.5 text-xs font-extrabold text-slate-950 shadow-lg transition text-center leading-snug"
              >
                <Wallet className="h-4 w-4 shrink-0" />
                <span>Hold Escrow ({stats.heldEscrows}) • Royalti ({stats.pendingRoyalties})</span>
              </button>
            </div>
          </div>
        </div>

        {/* Baris Keterangan Statistik Administrasi 5 Pilar */}
        <div className="relative z-10 mt-6 border-t border-white/25 pt-5 grid grid-cols-2 sm:grid-cols-6 gap-y-4 sm:gap-y-0 sm:divide-x sm:divide-white/25">
          <button
            type="button"
            onClick={() => setActiveTab('upgrades')}
            className="flex flex-col items-center justify-center px-2 text-center transition hover:opacity-90"
          >
            <p className="text-[11px] sm:text-xs font-bold text-white whitespace-nowrap">
              Antrean KYB &amp; Blacklist
            </p>
            <p className="mt-1 text-xl sm:text-2xl font-black text-amber-300">
              {stats.pendingUpgrades} <span className="text-xs font-bold text-white/80">/ {blacklistedNikSet.length} Blok</span>
            </p>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('complaints')}
            className="flex flex-col items-center justify-center px-2 text-center transition hover:opacity-90"
          >
            <p className="text-[11px] sm:text-xs font-bold text-white whitespace-nowrap">
              Eskalasi Moderator
            </p>
            <p className="mt-1 text-xl sm:text-2xl font-black text-rose-300">
              {stats.moderatorEscalations}
            </p>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('legality')}
            className="flex flex-col items-center justify-center px-2 text-center transition hover:opacity-90"
          >
            <p className="text-[11px] sm:text-xs font-bold text-white whitespace-nowrap">
              Alert Retensi 2 Thn
            </p>
            <p className="mt-1 text-xl sm:text-2xl font-black text-amber-200">
              {stats.retentionAlerts}
            </p>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('b2b_fleet')}
            className="flex flex-col items-center justify-center px-2 text-center transition hover:opacity-90"
          >
            <p className="text-[11px] sm:text-xs font-bold text-white whitespace-nowrap">
              B2B &amp; Armada STNK/KIR
            </p>
            <p className="mt-1 text-xl sm:text-2xl font-black text-emerald-300">
              {stats.totalB2BFleet}
            </p>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('escrow_royalty')}
            className="flex flex-col items-center justify-center px-2 text-center transition hover:opacity-90"
          >
            <p className="text-[11px] sm:text-xs font-bold text-white whitespace-nowrap">
              Escrow Held / Bot
            </p>
            <p className="mt-1 text-xl sm:text-2xl font-black text-sky-200">
              {stats.heldEscrows} / {stats.pendingRoyalties}
            </p>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('audit_trail')}
            className="flex flex-col items-center justify-center px-2 text-center transition hover:opacity-90"
          >
            <p className="text-[11px] sm:text-xs font-bold text-white whitespace-nowrap">
              Log Audit Permanen
            </p>
            <p className="mt-1 text-xl sm:text-2xl font-black text-white">
              {stats.auditCount}
            </p>
          </button>
        </div>
      </div>

      {/* ── FILTER BAR, PEMILIH IDENTITAS STAF ADMIN & TAB 5 PILAR ── */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari nama mitra, NIK/NPWP, tiket komplain/eskalasi, plat armada, atau log audit..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-2 text-xs focus:border-violet-500 focus:bg-white focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Identitas Staf Admin Aktif untuk Pencatatan Audit Trail */}
            <div className="flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-1.5">
              <UserCog className="h-4 w-4 text-indigo-700 shrink-0" />
              <span className="text-[11px] font-bold text-indigo-950">Staf Aktif:</span>
              <select
                value={activeAdminStaff}
                onChange={(e) => setActiveAdminStaff(e.target.value)}
                className="bg-transparent text-xs font-extrabold text-indigo-900 focus:outline-none"
              >
                {ADMIN_STAFF_LIST.map((staff) => (
                  <option key={staff} value={staff}>
                    {staff}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={() => {
                resetAdminStore();
                showToast('Data simulasi 5 pilar Role Admin telah dikembalikan ke awal.');
              }}
              className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600 transition"
              title="Kembalikan data contoh administrasi"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset Data
            </button>
          </div>
        </div>

        {/* Tab Navigasi Administrasi Lengkap */}
        <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-3">
          {[
            { id: 'all', label: 'Semua Kendali Admin' },
            {
              id: 'upgrades',
              label: `1. Siklus Akun, KYB & Blacklist (${stats.totalUpgrades})`,
            },
            {
              id: 'complaints',
              label: `2. Sengketa, Eskalasi & Force Order (${stats.totalComplaints})`,
            },
            {
              id: 'legality',
              label: `3. Legalitas & Retensi 2 Tahun (${stats.totalLegalDocs})`,
            },
            {
              id: 'b2b_fleet',
              label: `4. B2B, Checkbox & Armada KIR (${stats.totalB2BFleet})`,
            },
            {
              id: 'escrow_royalty',
              label: `5. Hold Escrow & Bot Royalti (${escrowGuards.length + royaltyTraffic.length})`,
            },
            {
              id: 'audit_trail',
              label: `6. Audit Trail Permanen (${stats.auditCount})`,
            },
          ].map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as AdminCenterTab)}
                className={`rounded-xl px-3.5 py-2 text-xs font-bold transition ${active
                    ? 'bg-violet-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════════
          PILAR 1: KENDALI SIKLUS HIDUP AKUN & KYB (REVISI, SUSPEND, BLACKLIST, UNDO APPROVAL, RE-ASSIGN)
         ════════════════════════════════════════════════════════════════════════ */}
      {(activeTab === 'all' || activeTab === 'upgrades') && (
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-violet-600" />
                Pilar 1 — Kendali Siklus Hidup Akun &amp; KYB (Revisi, Suspend, Blacklist NIK/NPWP &amp; Undo Approval)
              </h2>
              <p className="text-xs text-slate-500">
                Kelola status dinamis mitra, batalkan &quot;Setujui Cepat&quot; (Undo Approval) jika belum bertransaksi, bekukan toko, atau blokir NIK/NPWP bermasalah.
              </p>
            </div>
          </div>

          {/* Pita Daftar Hitam NIK/NPWP Aktif */}
          {blacklistedNikSet.length > 0 && (
            <div className="rounded-2xl border border-rose-300 bg-rose-50/80 p-4 space-y-2">
              <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-rose-900">
                <Ban className="h-4 w-4 text-rose-600" />
                Daftar Hitam NIK &amp; NPWP Terblokir Otomatis ({blacklistedNikSet.length} Entitas)
              </div>
              <div className="flex flex-wrap gap-2">
                {blacklistedNikSet.map((blk) => (
                  <div
                    key={blk.id}
                    className="rounded-xl border border-rose-200 bg-white px-3 py-2 text-[11px] text-rose-950 shadow-sm"
                  >
                    <span className="font-bold">{blk.name}</span> — NIK:{' '}
                    <code className="font-mono font-bold text-rose-700">{blk.nik}</code> • NPWP:{' '}
                    <code className="font-mono font-bold text-rose-700">{blk.npwp}</code>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4">
            {filteredUpgrades.map((item) => {
              const isSeller = item.targetRole === 'seller';
              const isService = item.targetRole === 'service_provider';
              return (
                <div
                  key={item.id}
                  className={`rounded-2xl border bg-white p-5 shadow-sm transition flex flex-col lg:flex-row lg:items-start justify-between gap-4 ${item.status === 'blacklisted'
                      ? 'border-rose-300 bg-rose-50/20'
                      : item.status === 'suspended'
                        ? 'border-orange-300 bg-orange-50/20'
                        : 'border-slate-200 hover:border-violet-300'
                    }`}
                >
                  <div className="space-y-3 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-3 py-0.5 text-[11px] font-extrabold uppercase tracking-wider border ${isSeller
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : isService
                              ? 'bg-sky-50 text-sky-800 border-sky-200'
                              : 'bg-cyan-50 text-cyan-800 border-cyan-200'
                          }`}
                      >
                        {isSeller ? (
                          <Store className="h-3 w-3" />
                        ) : isService ? (
                          <UserCheck className="h-3 w-3" />
                        ) : (
                          <Truck className="h-3 w-3" />
                        )}
                        {isSeller
                          ? 'Seller (Penjual)'
                          : isService
                            ? 'Penyedia Jasa Ahli'
                            : 'Distributor Regional'}
                      </span>

                      {item.status === 'pending_review' && (
                        <span className="rounded-full bg-violet-100 text-violet-800 border border-violet-200 px-2.5 py-0.5 text-[11px] font-bold">
                          Menunggu Verifikasi Admin
                        </span>
                      )}
                      {item.status === 'need_revision' && (
                        <span className="rounded-full bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-0.5 text-[11px] font-bold">
                          Pending Revision (Minta Revisi Berkas)
                        </span>
                      )}
                      {item.status === 'approved' && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-bold">
                          <CheckCircle2 className="h-3 w-3" /> Disetujui &amp; Aktif
                        </span>
                      )}
                      {item.status === 'suspended' && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 text-orange-900 border border-orange-300 px-2.5 py-0.5 text-[11px] font-bold">
                          <PauseCircle className="h-3 w-3" /> Dibekukan Sementara (Suspended)
                        </span>
                      )}
                      {item.status === 'blacklisted' && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-600 text-white px-2.5 py-0.5 text-[11px] font-extrabold">
                          <Ban className="h-3 w-3" /> Blacklist Permanen (NIK &amp; NPWP Diblokir)
                        </span>
                      )}
                      {item.status === 'rejected' && (
                        <span className="rounded-full bg-rose-100 text-rose-800 border border-rose-200 px-2.5 py-0.5 text-[11px] font-bold">
                          Ditolak Administrasi
                        </span>
                      )}

                      {item.retentionAlertStatus !== 'ok' && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-300 px-2.5 py-0.5 text-[10px] font-extrabold text-amber-900">
                          <CalendarClock className="h-3 w-3 text-amber-600" />
                          Retensi 2 Tahun: {item.dataRetentionDueAt}
                        </span>
                      )}

                      <span className="text-xs text-slate-400">• {item.submittedAt}</span>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-slate-900">
                        {item.proposedBusinessName}{' '}
                        <span className="text-xs font-medium text-slate-500">
                          (Pemohon: {item.memberName})
                        </span>
                      </h3>
                      <p className="text-xs text-slate-600 mt-0.5">
                        <strong>Komoditas:</strong> {item.commodityFocus} •{' '}
                        <strong>Wilayah:</strong> {item.region} •{' '}
                        <strong>Status Transaksi:</strong>{' '}
                        {item.hasTransactions ? 'Sudah Ada Transaksi' : 'Belum Ada Transaksi (Bisa Undo Approval)'}
                      </p>
                    </div>

                    {/* Ringkasan NIK, NPWP, NIB & Retensi 2 Tahun */}
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 rounded-xl bg-slate-50 p-3 border border-slate-100 text-xs">
                      <div>
                        <span className="text-[10px] font-bold uppercase text-slate-400 block">
                          NIK KTP Penanggung Jawab
                        </span>
                        <span className="font-semibold text-slate-800">{item.ktpNumber}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase text-slate-400 block">
                          NPWP Administrasi
                        </span>
                        <span className="font-semibold text-slate-800">{item.npwpNumber}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase text-slate-400 block">
                          Nomor Induk Berusaha
                        </span>
                        <span className="font-semibold text-emerald-700">{item.nibNumber}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase text-slate-400 block">
                          Jatuh Tempo Retensi (2 Thn)
                        </span>
                        <span className="font-semibold text-indigo-800">{item.dataRetentionDueAt}</span>
                      </div>
                    </div>

                    {/* Berkas Pendukung */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">
                        Berkas Pendukung (Gambar langsung di Dashboard • PDF buka di Tab Baru):
                      </span>
                      <div className="flex flex-wrap items-center gap-2">
                        {(item.supportingFiles ?? []).map((file) =>
                          renderSupportingFileButton(file),
                        )}
                      </div>
                    </div>

                    {/* Pengalihan Antrean PIC Admin (Ticket Re-assignment) */}
                    <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-violet-50/60 border border-violet-100 px-3 py-2 text-xs">
                      <p className="text-slate-600">
                        <strong className="text-violet-900">Catatan Admin:</strong> {item.adminNotes}
                      </p>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <ArrowRightLeft className="h-3.5 w-3.5 text-violet-600" />
                        <span className="text-[11px] font-bold text-violet-900">PIC:</span>
                        <select
                          value={item.assignedAdminStaff}
                          onChange={(e) => handleReassignUpgradeStaff(item, e.target.value)}
                          className="rounded-lg border border-violet-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-800 focus:border-violet-500 focus:outline-none"
                          title="Pengalihan Antrean (Ticket Re-assignment)"
                        >
                          {ADMIN_STAFF_LIST.map((staff) => (
                            <option key={staff} value={staff}>
                              {staff}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Tombol Aksi Siklus Akun & Pengaman Setujui Cepat */}
                  <div className="flex flex-row flex-wrap lg:flex-col gap-2 shrink-0 lg:w-52">
                    <button
                      type="button"
                      onClick={() => openUpgradeModal(item)}
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-violet-600 hover:bg-violet-700 px-3.5 py-2.5 text-xs font-bold text-white shadow-sm transition"
                    >
                      <ClipboardCheck className="h-4 w-4" />
                      Periksa &amp; Kelola Status
                    </button>

                    {(item.status === 'pending_review' || item.status === 'need_revision') && (
                      <button
                        type="button"
                        onClick={() =>
                          updateUpgradeApplication(
                            {
                              ...item,
                              status: 'approved',
                              approvedAt: 'Baru saja',
                              approvedBy: activeAdminStaff,
                              adminNotes: `Disetujui Cepat oleh ${activeAdminStaff} menjadi ${item.targetRole.toUpperCase()} resmi.`,
                            },
                            {
                              actionLabel: 'Setujui Cepat (Quick Approve)',
                              reason: 'Verifikasi cepat dokumen memenuhi syarat KYB.',
                            },
                          )
                        }
                        className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 px-3.5 py-2 text-xs font-bold text-emerald-800 transition"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Setujui Cepat
                      </button>
                    )}

                    {/* Pillar 5: Undo Approval apabila mitra belum melakukan transaksi */}
                    {item.status === 'approved' && (
                      <button
                        type="button"
                        onClick={() => handleUndoApproval(item)}
                        className={`inline-flex items-center justify-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-bold transition ${item.hasTransactions
                            ? 'border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed'
                            : 'border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900'
                          }`}
                        title={
                          item.hasTransactions
                            ? 'Mitra sudah bertransaksi — tidak dapat Undo Approval'
                            : 'Batalkan persetujuan yang tidak sengaja terklik (mitra belum bertransaksi)'
                        }
                      >
                        <Undo2 className="h-3.5 w-3.5" />
                        Undo Approval
                      </button>
                    )}

                    {/* Suspend / Aktifkan Ulang Cepat */}
                    {item.status === 'suspended' ? (
                      <button
                        type="button"
                        onClick={() =>
                          updateUpgradeApplication(
                            {
                              ...item,
                              status: 'approved',
                              adminNotes: `Pembekuan dibuka kembali oleh ${activeAdminStaff}.`,
                            },
                            {
                              actionLabel: 'Cabut Pembekuan (Un-Suspend)',
                              reason: 'Mitra telah menyelesaikan evaluasi administrasi.',
                            },
                          )
                        }
                        className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 px-3.5 py-2 text-xs font-bold text-emerald-800 transition"
                      >
                        <Unlock className="h-3.5 w-3.5" />
                        Cabut Pembekuan
                      </button>
                    ) : (
                      item.status !== 'blacklisted' && (
                        <button
                          type="button"
                          onClick={() =>
                            updateUpgradeApplication(
                              {
                                ...item,
                                status: 'suspended',
                                suspendedReason: `Dibekukan sementara oleh ${activeAdminStaff}.`,
                                adminNotes: `Toko/akun dibekukan sementara oleh ${activeAdminStaff} untuk audit.`,
                              },
                              {
                                actionLabel: 'Bekukan Sementara (Suspend)',
                                reason: 'Pembekuan operasional sementara oleh Role Admin.',
                              },
                            )
                          }
                          className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-orange-300 bg-orange-50 hover:bg-orange-100 px-3.5 py-2 text-xs font-bold text-orange-900 transition"
                        >
                          <PauseCircle className="h-3.5 w-3.5" />
                          Bekukan (Suspend)
                        </button>
                      )
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ════════════════════════════════════════════════════════════════════════
          PILAR 2: EKSEKUSI SENGKETA, ESKALASI MODERATOR, SPLIT DECISION & FORCE ORDER
         ════════════════════════════════════════════════════════════════════════ */}
      {(activeTab === 'all' || activeTab === 'complaints') && (
        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <Scale className="h-5 w-5 text-rose-600" />
              Pilar 2 — Eksekusi Sengketa, Inbox Eskalasi Moderator, Split Decision &amp; Force Order
            </h2>
            <p className="text-xs text-slate-500">
              Terima laporan pelanggaran dari Moderator, eksekusi Full/Partial Refund atau Release Dana Escrow, serta lakukan Force Complete / Force Cancel pesanan macet.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {filteredComplaints.map((ticket) => {
              const isModeratorEscalation = ticket.sourceType === 'moderator_escalation';
              return (
                <div
                  key={ticket.id}
                  className={`rounded-2xl border bg-white p-5 shadow-sm transition flex flex-col lg:flex-row lg:items-start justify-between gap-4 ${isModeratorEscalation
                      ? 'border-rose-300 bg-rose-50/20 hover:border-rose-400'
                      : 'border-slate-200 hover:border-rose-300'
                    }`}
                >
                  <div className="space-y-2.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-lg bg-slate-900 px-2.5 py-0.5 text-[11px] font-extrabold text-white">
                        {ticket.ticketCode}
                      </span>
                      {isModeratorEscalation ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-600 text-white px-3 py-0.5 text-[11px] font-extrabold">
                          <ShieldAlert className="h-3 w-3" /> Jalur Eskalasi Moderator
                        </span>
                      ) : (
                        <span className="rounded-full bg-rose-50 text-rose-800 border border-rose-200 px-3 py-0.5 text-[11px] font-bold">
                          {ticket.category}
                        </span>
                      )}

                      {ticket.status === 'open' && (
                        <span className="rounded-full bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-0.5 text-[11px] font-extrabold">
                          Laporan Baru Masuk
                        </span>
                      )}
                      {ticket.status === 'in_mediation' && (
                        <span className="rounded-full bg-violet-100 text-violet-900 border border-violet-300 px-2.5 py-0.5 text-[11px] font-extrabold">
                          Sedang Dimediasi Admin
                        </span>
                      )}
                      {ticket.status === 'resolved' && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-extrabold">
                          <CheckCircle2 className="h-3 w-3" /> Selesai (Resolved)
                        </span>
                      )}
                      {ticket.status === 'escalated_legal' && (
                        <span className="rounded-full bg-rose-100 text-rose-800 border border-rose-300 px-2.5 py-0.5 text-[11px] font-extrabold">
                          Tindak Lanjut Level Akun / Legal
                        </span>
                      )}

                      {ticket.escrowHoldActive && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500 text-slate-950 px-2.5 py-0.5 text-[10px] font-extrabold uppercase">
                          <Lock className="h-3 w-3" /> Hold Payout Aktif
                        </span>
                      )}

                      <span className="text-xs text-slate-400">
                        • Ref: {ticket.orderOrContractRef} ({ticket.createdAt})
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900">{ticket.subject}</h3>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 rounded-xl bg-slate-50 p-3 border border-slate-100 text-xs">
                      <div>
                        <span className="text-[10px] font-bold uppercase text-slate-400 block">
                          Pelapor
                        </span>
                        <span className="font-bold text-slate-800">{ticket.reporterName}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase text-slate-400 block">
                          Pihak Terlapor / Mitra
                        </span>
                        <span className="font-bold text-slate-800">{ticket.reportedPartyName}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase text-slate-400 block">
                          Dana Escrow &amp; Keputusan Split
                        </span>
                        <span className="font-bold text-indigo-800">
                          {ticket.escrowAmountRp > 0
                            ? `${formatRupiah(ticket.escrowAmountRp)}`
                            : 'Audit Non-Transaksi'}
                          {ticket.splitDecisionType !== 'none' && (
                            <span className="block text-[11px] text-emerald-700">
                              {ticket.splitDecisionType === 'full_refund' && 'Full Refund 100% Pembeli'}
                              {ticket.splitDecisionType === 'partial_split' &&
                                `Split: Pembeli ${formatRupiah(ticket.refundBuyerAmountRp)} / Penjual ${formatRupiah(ticket.releaseSellerAmountRp)}`}
                              {ticket.splitDecisionType === 'release_to_seller' &&
                                'Release 100% ke Penjual'}
                            </span>
                          )}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      <strong>Kronologi:</strong> {ticket.chronology}
                    </p>

                    {(ticket.supportingFiles ?? []).length > 0 && (
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        {(ticket.supportingFiles ?? []).map((file) =>
                          renderSupportingFileButton(file),
                        )}
                      </div>
                    )}

                    <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-emerald-200 bg-emerald-50/70 px-3.5 py-2 text-xs text-emerald-950">
                      <div>
                        <strong>Keputusan Admin:</strong> {ticket.resolutionDecision}
                        {ticket.forceOrderAction !== 'none' && (
                          <span className="ml-2 rounded-md bg-slate-900 px-2 py-0.5 text-[10px] font-extrabold text-white uppercase">
                            {ticket.forceOrderAction === 'force_completed'
                              ? 'Force Completed'
                              : 'Force Cancelled'}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <ArrowRightLeft className="h-3.5 w-3.5 text-emerald-800" />
                        <select
                          value={ticket.assignedAdminStaff}
                          onChange={(e) => handleReassignComplaintStaff(ticket, e.target.value)}
                          className="rounded-lg border border-emerald-300 bg-white px-2 py-1 text-[11px] font-semibold text-slate-800 focus:outline-none"
                          title="Alihkan Tiket ke Staf Admin Lain"
                        >
                          {ADMIN_STAFF_LIST.map((staff) => (
                            <option key={staff} value={staff}>
                              {staff}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Tombol Eksekusi Sengketa, Split Decision, Force Action & Hold Payout */}
                  <div className="flex flex-row flex-wrap lg:flex-col gap-2 shrink-0 lg:w-56">
                    <button
                      type="button"
                      onClick={() => openComplaintModal(ticket)}
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 px-3.5 py-2.5 text-xs font-bold text-white shadow-sm transition"
                    >
                      <Split className="h-4 w-4" />
                      Split Decision &amp; Mediasi
                    </button>

                    {ticket.status !== 'resolved' && ticket.escrowAmountRp > 0 && (
                      <div className="grid grid-cols-2 lg:grid-cols-1 gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleQuickForceOrder(ticket, 'force_completed')}
                          className="inline-flex items-center justify-center gap-1 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 px-3 py-2 text-[11px] font-bold text-emerald-800 transition"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Force Complete Order
                        </button>
                        <button
                          type="button"
                          onClick={() => handleQuickForceOrder(ticket, 'force_cancelled')}
                          className="inline-flex items-center justify-center gap-1 rounded-xl border border-rose-300 bg-rose-50 hover:bg-rose-100 px-3 py-2 text-[11px] font-bold text-rose-800 transition"
                        >
                          <Ban className="h-3.5 w-3.5" />
                          Force Cancel &amp; Refund
                        </button>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        updateComplaintTicket(
                          {
                            ...ticket,
                            escrowHoldActive: !ticket.escrowHoldActive,
                          },
                          {
                            actionLabel: !ticket.escrowHoldActive
                              ? 'Aktifkan Hold Payout pada Tiket Sengketa'
                              : 'Lepas Hold Payout pada Tiket Sengketa',
                            reason: `Toggle Hold Payout dari kartu ${ticket.ticketCode}`,
                          },
                        )
                      }
                      className={`inline-flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-[11px] font-bold transition ${ticket.escrowHoldActive
                          ? 'border-amber-400 bg-amber-100 text-amber-950 hover:bg-amber-200'
                          : 'border-slate-300 bg-slate-50 text-slate-700 hover:bg-slate-100'
                        }`}
                    >
                      {ticket.escrowHoldActive ? (
                        <>
                          <Unlock className="h-3.5 w-3.5" /> Lepas Hold Payout
                        </>
                      ) : (
                        <>
                          <Lock className="h-3.5 w-3.5" /> Tahan Dana (Hold)
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ════════════════════════════════════════════════════════════════════════
          DOKUMEN LEGALITAS & PENGINGAT PEMBARUAN BERKALA (SIKLUS 2 TAHUN)
         ════════════════════════════════════════════════════════════════════════ */}
      {(activeTab === 'all' || activeTab === 'legality') && (
        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <FileCheck2 className="h-5 w-5 text-emerald-600" />
              Arsip Legalitas Mitra &amp; Pengingat Pembaruan Berkala (Data Retention 2 Tahun)
            </h2>
            <p className="text-xs text-slate-500">
              Lacak masa berlaku NIB, MoU, izin edar, serta siklus pembaruan data &amp; alamat gudang setiap 2 tahun agar database tetap akurat.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {filteredLegalDocs.map((doc) => (
              <div
                key={doc.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                <div className="space-y-2.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-slate-100 text-slate-800 border border-slate-300 px-3 py-0.5 text-[11px] font-extrabold uppercase">
                      Mitra {doc.partnerRole === 'seller' ? 'Seller' : 'Distributor'}
                    </span>
                    <span className="rounded-lg bg-indigo-50 text-indigo-800 border border-indigo-200 px-2.5 py-0.5 text-[11px] font-bold">
                      {doc.contractNumber}
                    </span>
                    {doc.adminStatus === 'verified' ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-bold">
                        <BadgeCheck className="h-3.5 w-3.5" /> Legalitas Sah
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-0.5 text-[11px] font-bold">
                        <AlertTriangle className="h-3.5 w-3.5" /> Audit Pembaruan Berkas
                      </span>
                    )}

                    {/* Status Siklus Retensi 2 Tahun */}
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-extrabold border ${doc.retentionAlertStatus === 'overdue'
                          ? 'bg-rose-100 text-rose-900 border-rose-300'
                          : doc.retentionAlertStatus === 'due_soon'
                            ? 'bg-amber-100 text-amber-900 border-amber-300'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                    >
                      <CalendarClock className="h-3 w-3" />
                      Siklus 2 Thn: {doc.dataRetentionDueAt}
                    </span>

                    {doc.escrowHoldActive && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-rose-600 text-white px-2.5 py-0.5 text-[10px] font-extrabold">
                        <Lock className="h-3 w-3" /> Payout Ditahan
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-slate-900">
                    {doc.partnerName}{' '}
                    <span className="text-xs font-medium text-slate-500">({doc.region})</span>
                  </h3>

                  {(doc.supportingFiles ?? []).length > 0 && (
                    <div className="flex flex-wrap items-center gap-2">
                      {(doc.supportingFiles ?? []).map((file) =>
                        renderSupportingFileButton(file),
                      )}
                    </div>
                  )}

                  <p className="text-xs text-slate-500">
                    <strong>Catatan:</strong> {doc.notes} •{' '}
                    <span className="text-slate-400">Terakhir diperiksa: {doc.lastVerifiedAt}</span>
                    {doc.retentionReminderSentAt && (
                      <span className="ml-2 text-indigo-700 font-semibold">
                        • Pengingat dikirim: {doc.retentionReminderSentAt}
                      </span>
                    )}
                  </p>
                </div>

                <div className="flex flex-row flex-wrap lg:flex-col gap-2 shrink-0 lg:w-56">
                  {doc.retentionAlertStatus !== 'ok' && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleSend2YearRetentionReminder(doc)}
                        className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 px-3.5 py-2 text-xs font-bold text-amber-950 transition"
                      >
                        <CalendarClock className="h-3.5 w-3.5" />
                        Kirim Pengingat 2 Tahunan
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMark2YearRenewed(doc)}
                        className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-3.5 py-2 text-xs font-bold text-white shadow-sm transition"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Konfirmasi Data Diperbarui
                      </button>
                    </>
                  )}
                  <button
                    type="button"
                    onClick={() => handleToggleLegalHoldPayout(doc)}
                    className={`inline-flex items-center justify-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-bold transition ${doc.escrowHoldActive
                        ? 'border-amber-400 bg-amber-100 text-amber-950'
                        : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                  >
                    {doc.escrowHoldActive ? (
                      <>
                        <Unlock className="h-3.5 w-3.5" /> Lepas Hold Payout
                      </>
                    ) : (
                      <>
                        <Lock className="h-3.5 w-3.5" /> Hold Payout Audit
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ════════════════════════════════════════════════════════════════════════
          PILAR 3: TATA KELOLA DOKUMEN B2B, CHECKBOX APPROVAL, CUSTOM FEE & SEWA ARMADA (STNK/KIR)
         ════════════════════════════════════════════════════════════════════════ */}
      {(activeTab === 'all' || activeTab === 'b2b_fleet') && (
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <Truck className="h-5 w-5 text-cyan-600" />
                Pilar 3 — Tata Kelola Dokumen B2B, Checkbox Approval, Tarif Khusus &amp; Kelayakan Armada (STNK/KIR)
              </h2>
              <p className="text-xs text-slate-500">
                Kelola draf formulir PDF, verifikasi persetujuan digital tanpa tanda tangan basah, kunci Custom Fee Override (di luar 5%), dan validasi STNK/KIR armada pickup.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowUploadTemplateModal(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition shrink-0"
            >
              <FileUp className="h-4 w-4 text-emerald-400" />
              Unggah Draf Formulir PDF Terbaru
            </button>
          </div>

          {/* Manajemen Draf Formulir PDF Bantuan */}
          <div className="rounded-2xl border border-indigo-200 bg-indigo-50/50 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-950">
                Manajemen Dokumen Bantuan Resmi (Draf PDF untuk Checkbox Approval Digital)
              </span>
              <span className="text-[11px] font-semibold text-indigo-700">
                {b2bTemplates.length} Template Aktif
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {b2bTemplates.map((tpl) => (
                <div
                  key={tpl.id}
                  className="rounded-xl border border-indigo-200 bg-white p-3.5 flex flex-col justify-between gap-2.5 shadow-sm"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="rounded-md bg-indigo-900 px-2 py-0.5 font-mono text-[10px] font-bold text-white">
                        {tpl.version}
                      </span>
                      <span className="text-[11px] text-slate-400">Diperbarui: {tpl.updatedAt}</span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 mt-1.5">{tpl.title}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">PIC: {tpl.updatedBy}</p>
                  </div>
                  <div>{renderSupportingFileButton(tpl.pdfFile)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Daftar Kasus B2B & Validasi Sewa Armada */}
          <div className="grid grid-cols-1 gap-4">
            {filteredB2B.map((rec) => {
              const isFleet = rec.governanceType === 'fleet_rental';
              const hasExpiredVehicleDoc =
                isFleet && (rec.stnkStatus === 'expired' || rec.kirStatus === 'expired');

              return (
                <div
                  key={rec.id}
                  className={`rounded-2xl border bg-white p-5 shadow-sm flex flex-col lg:flex-row lg:items-start justify-between gap-4 ${hasExpiredVehicleDoc ? 'border-rose-300 bg-rose-50/20' : 'border-slate-200'
                    }`}
                >
                  <div className="space-y-3 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-lg bg-slate-900 px-2.5 py-0.5 text-[11px] font-extrabold text-white">
                        {rec.referenceCode}
                      </span>
                      <span
                        className={`rounded-full px-3 py-0.5 text-[11px] font-extrabold border ${isFleet
                            ? 'bg-cyan-50 text-cyan-900 border-cyan-200'
                            : 'bg-indigo-50 text-indigo-900 border-indigo-200'
                          }`}
                      >
                        {isFleet ? 'Sewa Armada Pickup (STNK/KIR)' : 'Kontrak B2B & Tarif Khusus'}
                      </span>

                      {rec.status === 'approved' && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-bold">
                          <CheckCircle2 className="h-3 w-3" /> Disetujui &amp; Aktif
                        </span>
                      )}
                      {rec.status === 'pending_review' && (
                        <span className="rounded-full bg-violet-100 text-violet-800 border border-violet-200 px-2.5 py-0.5 text-[11px] font-bold">
                          Menunggu Validasi Admin
                        </span>
                      )}
                      {rec.status === 'need_revision' && (
                        <span className="rounded-full bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-0.5 text-[11px] font-bold">
                          Wajib Perbarui KIR / Berkas
                        </span>
                      )}

                      <span className="text-xs text-slate-400">• {rec.submittedAt}</span>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-slate-900">{rec.title}</h3>
                      <p className="text-xs text-slate-600">
                        <strong>Mitra:</strong> {rec.partnerName} • <strong>Wilayah:</strong> {rec.region}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      {/* Kotak Checkbox Approval Log Digital */}
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                            Checkbox Approval Log (Tanpa TTD Basah)
                          </span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${rec.checkboxApprovalLog.verifiedByAdmin
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-900'
                              }`}
                          >
                            {rec.checkboxApprovalLog.verifiedByAdmin
                              ? 'Log Terverifikasi Sah'
                              : 'Menunggu Verifikasi Log'}
                          </span>
                        </div>
                        <p className="font-bold text-slate-900">
                          {rec.checkboxApprovalLog.approvedByName}
                        </p>
                        <p className="text-[11px] text-slate-600">
                          Waktu: {rec.checkboxApprovalLog.approvedAt} • IP:{' '}
                          <code className="font-mono">{rec.checkboxApprovalLog.ipAddress}</code>
                        </p>
                        <p className="text-[11px] text-slate-500 italic">
                          &ldquo;{rec.checkboxApprovalLog.agreementText}&rdquo;
                        </p>
                      </div>

                      {/* Kotak Custom Fee Override / Validasi STNK & KIR Armada */}
                      {isFleet ? (
                        <div
                          className={`rounded-xl border p-3 space-y-1.5 ${hasExpiredVehicleDoc
                              ? 'border-rose-300 bg-rose-50/70'
                              : 'border-emerald-200 bg-emerald-50/50'
                            }`}
                        >
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-600 block">
                            Validasi Kelayakan Armada Pickup ({rec.vehiclePlate})
                          </span>
                          <p className="font-bold text-slate-900">{rec.vehicleType}</p>
                          <div className="flex flex-wrap gap-2 text-[11px]">
                            <span
                              className={`rounded-md px-2 py-0.5 font-bold ${rec.stnkStatus === 'active'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-rose-600 text-white'
                                }`}
                            >
                              STNK: {rec.stnkStatus === 'active' ? `Aktif (${rec.stnkExpiry})` : 'KEDALUWARSA'}
                            </span>
                            <span
                              className={`rounded-md px-2 py-0.5 font-bold ${rec.kirStatus === 'active'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-rose-600 text-white'
                                }`}
                            >
                              Uji KIR: {rec.kirStatus === 'active' ? `Aktif (${rec.kirExpiry})` : `KEDALUWARSA (${rec.kirExpiry})`}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="rounded-xl border border-indigo-200 bg-indigo-50/40 p-3 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-800">
                              Custom Fee Override (Tarif Standar 5%)
                            </span>
                            <span className="rounded-full bg-indigo-900 text-white px-2 py-0.5 text-[10px] font-bold">
                              {rec.feeOverrideLocked ? 'Tarif Terkunci' : 'Draft Penyesuaian'}
                            </span>
                          </div>
                          <p className="text-sm font-black text-indigo-950">
                            Komisi Disepakati: {rec.customFeePercent}%{' '}
                            <span className="text-xs font-semibold text-slate-600">
                              + Biaya Layanan {formatRupiah(rec.additionalServiceFeeRp)}
                            </span>
                          </p>
                          <p className="text-[11px] text-slate-600">{rec.feeOverrideReason}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {rec.supportingFiles.map((file) => renderSupportingFileButton(file))}
                    </div>
                  </div>

                  <div className="flex flex-row lg:flex-col gap-2 shrink-0 lg:w-52">
                    <button
                      type="button"
                      onClick={() => openB2BModal(rec)}
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-3.5 py-2.5 text-xs font-bold text-white shadow-sm transition"
                    >
                      <Percent className="h-4 w-4" />
                      {isFleet
                        ? 'Validasi STNK/KIR & Log'
                        : 'Atur Custom Fee & Log'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ════════════════════════════════════════════════════════════════════════
          PILAR 4: PENGAMANAN DANA ESCROW (HOLD PAYOUT) & VALIDASI TRAFIK ROYALTI (BOT FILTER)
         ════════════════════════════════════════════════════════════════════════ */}
      {(activeTab === 'all' || activeTab === 'escrow_royalty') && (
        <section className="space-y-5">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <Wallet className="h-5 w-5 text-amber-600" />
              Pilar 4 — Pengamanan Dana (Hold Payout Escrow) &amp; Validasi Trafik Royalti Penulis
            </h2>
            <p className="text-xs text-slate-500">
              Tahan sementara pencairan dana mitra yang sedang diselidiki, dan bersihkan views bot artikel sebelum antrean royalti diserahkan ke staf keuangan.
            </p>
          </div>

          {/* 4A. Kontrol Hold Payout Escrow Mitra */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <Lock className="h-4 w-4 text-amber-600" />
              Pengaman Arus Pencairan Escrow Mitra (Operasional Admin)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {escrowGuards.map((esc) => {
                const isHeld = esc.payoutStatus === 'held_investigation';
                return (
                  <div
                    key={esc.id}
                    className={`rounded-xl border p-4 flex flex-col justify-between gap-3 ${isHeld ? 'border-amber-300 bg-amber-50/60' : 'border-slate-200 bg-slate-50/70'
                      }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-extrabold text-slate-900">
                          {esc.partnerName}
                        </span>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase ${isHeld
                              ? 'bg-rose-600 text-white'
                              : 'bg-emerald-100 text-emerald-800'
                            }`}
                        >
                          {isHeld ? 'Payout Ditahan (Hold)' : 'Pencairan Normal'}
                        </span>
                      </div>
                      <p className="text-base font-black text-slate-900">
                        {formatRupiah(esc.escrowBalanceRp)}{' '}
                        <span className="text-[11px] font-medium text-slate-500">
                          ({esc.pendingInvoiceCount} invoice berjalan)
                        </span>
                      </p>
                      <p className="text-[11px] text-slate-600">{esc.holdReason}</p>
                      <p className="text-[10px] text-slate-400">
                        Diperbarui: {esc.updatedAt} • {esc.updatedBy}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleEscrowGuard(esc)}
                      className={`inline-flex items-center justify-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition ${isHeld
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          : 'border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-800'
                        }`}
                    >
                      {isHeld ? (
                        <>
                          <Unlock className="h-3.5 w-3.5" /> Lepas Hold Payout (Buka Pencairan)
                        </>
                      ) : (
                        <>
                          <Lock className="h-3.5 w-3.5" /> Tahan Pencairan (Hold Payout)
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 4B. Validasi Trafik Royalti Penulis (Filter Bot) */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <Bot className="h-4 w-4 text-indigo-600" />
              Validasi Trafik Royalti Penulis (Potong Indikasi Trafik Bot Sebelum Antrean Keuangan)
            </h3>
            <div className="space-y-3">
              {royaltyTraffic.map((roy) => (
                <div
                  key={roy.id}
                  className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-md bg-slate-900 px-2 py-0.5 text-[10px] font-bold text-white">
                        {roy.periodLabel}
                      </span>
                      {roy.auditStatus === 'pending_filter' && (
                        <span className="rounded-full bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-0.5 text-[11px] font-bold">
                          Perlu Filter Views Bot
                        </span>
                      )}
                      {roy.auditStatus === 'bot_deducted_approved' && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-bold">
                          <CheckCircle2 className="h-3 w-3" /> Valid Views Disetujui
                        </span>
                      )}
                      {roy.auditStatus === 'held_audit' && (
                        <span className="rounded-full bg-rose-100 text-rose-800 border border-rose-200 px-2.5 py-0.5 text-[11px] font-bold">
                          Ditahan untuk Audit Anomali
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm font-bold text-slate-900">
                      {roy.articleTitle}{' '}
                      <span className="text-xs font-normal text-slate-500">— {roy.authorName}</span>
                    </h4>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      <div className="rounded-lg bg-white border border-slate-200 p-2">
                        <span className="text-[10px] text-slate-400 block font-bold uppercase">
                          Total Hit Mentah
                        </span>
                        <span className="font-bold text-slate-800">
                          {roy.rawViews.toLocaleString('id-ID')} views
                        </span>
                      </div>
                      <div className="rounded-lg bg-rose-50 border border-rose-200 p-2">
                        <span className="text-[10px] text-rose-700 block font-bold uppercase">
                          Terindikasi Bot
                        </span>
                        <span className="font-extrabold text-rose-700">
                          -{roy.botFlaggedViews.toLocaleString('id-ID')} views
                        </span>
                      </div>
                      <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-2">
                        <span className="text-[10px] text-emerald-700 block font-bold uppercase">
                          Valid Views Bersih
                        </span>
                        <span className="font-extrabold text-emerald-800">
                          {roy.validViews.toLocaleString('id-ID')} views
                        </span>
                      </div>
                      <div className="rounded-lg bg-indigo-50 border border-indigo-200 p-2">
                        <span className="text-[10px] text-indigo-700 block font-bold uppercase">
                          Estimasi Royalti Sah
                        </span>
                        <span className="font-black text-indigo-900">
                          {formatRupiah(roy.estimatedRoyaltyRp)}
                        </span>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-600">{roy.botDetectionNote}</p>
                  </div>

                  <div className="flex flex-row flex-wrap lg:flex-col gap-2 shrink-0 lg:w-52">
                    <button
                      type="button"
                      onClick={() => handleApproveBotFilteredRoyalty(roy)}
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-3.5 py-2 text-xs font-bold text-white shadow-sm transition"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Potong Bot &amp; Loloskan Royalti
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingRoyalty(roy);
                        setBotDeductDraft(roy.botFlaggedViews);
                      }}
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-indigo-300 bg-indigo-50 hover:bg-indigo-100 px-3.5 py-2 text-xs font-bold text-indigo-900 transition"
                    >
                      <Bot className="h-3.5 w-3.5" />
                      Koreksi Jumlah Bot Manual
                    </button>
                    <button
                      type="button"
                      onClick={() => handleHoldRoyaltyAudit(roy)}
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-rose-300 bg-rose-50 hover:bg-rose-100 px-3.5 py-2 text-xs font-bold text-rose-800 transition"
                    >
                      <Lock className="h-3.5 w-3.5" />
                      Tahan (Audit Anomali)
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ════════════════════════════════════════════════════════════════════════
          PILAR 5: LOG RIWAYAT PERMANEN (IMMUTABLE AUDIT TRAIL)
         ════════════════════════════════════════════════════════════════════════ */}
      {(activeTab === 'all' || activeTab === 'audit_trail') && (
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <History className="h-5 w-5 text-slate-800" />
                Pilar 5 — Log Riwayat Permanen (Immutable Audit Trail)
              </h2>
              <p className="text-xs text-slate-500">
                Merekam otomatis setiap perubahan status, identitas staf Admin pelaksana, waktu eksekusi, dan alasan untuk mencegah penyalahgunaan wewenang (tidak dapat dihapus).
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-3 py-1 text-[11px] font-bold text-emerald-300">
              <Lock className="h-3 w-3" /> Read-Only • Append-Only Log
            </span>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 text-white text-[11px] uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Waktu (WIB)</th>
                    <th className="px-4 py-3">Staf Admin</th>
                    <th className="px-4 py-3">Kategori &amp; Aksi</th>
                    <th className="px-4 py-3">Entitas Target</th>
                    <th className="px-4 py-3">Sebelum → Sesudah</th>
                    <th className="px-4 py-3">Alasan Eksekusi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAuditTrail.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                        {log.timestamp}
                      </td>
                      <td className="px-4 py-3 font-bold text-indigo-900 whitespace-nowrap">
                        {log.adminStaff}
                      </td>
                      <td className="px-4 py-3">
                        <span className="block text-[10px] font-extrabold uppercase text-slate-400">
                          {log.category}
                        </span>
                        <span className="font-bold text-slate-900">{log.actionLabel}</span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-800">
                        {log.targetEntity}
                      </td>
                      <td className="px-4 py-3 text-[11px]">
                        <span className="text-slate-500">{log.previousState}</span>{' '}
                        <span className="font-bold text-slate-900">→</span>{' '}
                        <span className="font-bold text-emerald-700">{log.newState}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-600 max-w-xs">{log.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* ════════════════════════════════════════════════════════════════════════
          MODAL PILAR 1: KELOLA SIKLUS AKUN KYB (REVISI, SUSPEND, BLACKLIST, APPROVE)
         ════════════════════════════════════════════════════════════════════════ */}
      {selectedUpgrade && (
        <div
          className="fixed inset-0 z-[130] flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-sm"
          onClick={() => setSelectedUpgrade(null)}
        >
          <div
            className="w-full max-w-2xl rounded-2xl border border-violet-200 bg-white shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-violet-900 via-indigo-900 to-slate-900 px-6 py-4 text-white">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-300">
                Pilar 1 — Kendali Siklus Hidup Akun &amp; Blacklist NIK/NPWP
              </span>
              <h3 className="text-base sm:text-lg font-bold mt-0.5">
                {selectedUpgrade.proposedBusinessName} ({selectedUpgrade.memberName})
              </h3>
            </div>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto text-xs text-slate-700">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-xl bg-slate-50 p-4 border border-slate-200">
                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-400">NIK KTP &amp; NPWP</p>
                  <p className="font-bold text-slate-900">{selectedUpgrade.ktpNumber}</p>
                  <p className="text-slate-600">NPWP: {selectedUpgrade.npwpNumber}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-400">NIB &amp; Siklus Retensi</p>
                  <p className="font-bold text-emerald-700">{selectedUpgrade.nibNumber}</p>
                  <p className="text-indigo-700">Retensi 2 Thn: {selectedUpgrade.dataRetentionDueAt}</p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-[10px] font-bold uppercase text-slate-400">Alamat Usaha</p>
                  <p className="font-semibold">{selectedUpgrade.warehouseOrStoreAddress}</p>
                </div>
              </div>

              <div className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-4 space-y-2">
                <p className="text-xs font-extrabold text-indigo-950">
                  Cek Berkas Pendukung (Gambar di Dashboard • PDF di Tab Baru):
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  {(selectedUpgrade.supportingFiles ?? []).map((file) =>
                    renderSupportingFileButton(file),
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Alasan / Catatan Resmi Admin (Tercatat di Audit Trail Permanen):
                </label>
                <textarea
                  rows={3}
                  value={upgradeNoteDraft}
                  onChange={(e) => setUpgradeNoteDraft(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-3 text-xs focus:border-violet-600 focus:outline-none"
                  placeholder="Tuliskan hasil pemeriksaan berkas, alasan minta revisi, atau dasar pembekuan/blacklist NIK & NPWP..."
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 bg-slate-50 px-6 py-4">
              <button
                type="button"
                onClick={() => setSelectedUpgrade(null)}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100"
              >
                Tutup
              </button>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleSaveUpgradeDecision('need_revision')}
                  className="rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 px-3 py-2 text-xs font-bold text-amber-900"
                >
                  Minta Revisi (Pending Revision)
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveUpgradeDecision('suspended')}
                  className="rounded-xl border border-orange-300 bg-orange-50 hover:bg-orange-100 px-3 py-2 text-xs font-bold text-orange-900"
                >
                  Bekukan (Suspend)
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveUpgradeDecision('blacklisted')}
                  className="rounded-xl bg-rose-700 hover:bg-rose-800 px-3 py-2 text-xs font-bold text-white"
                >
                  Blacklist NIK &amp; NPWP
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveUpgradeDecision('approved')}
                  className="rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 py-2 text-xs font-bold text-white shadow-sm"
                >
                  Setujui Aktif
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════
          MODAL PILAR 2: SPLIT DECISION, FORCE ORDER & HOLD ESCROW SENGKETA
         ════════════════════════════════════════════════════════════════════════ */}
      {selectedComplaint && (
        <div
          className="fixed inset-0 z-[130] flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-sm"
          onClick={() => setSelectedComplaint(null)}
        >
          <div
            className="w-full max-w-2xl rounded-2xl border border-rose-200 bg-white shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-rose-900 via-slate-900 to-indigo-950 px-6 py-4 text-white">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-300">
                Pilar 2 — Keputusan Mediasi Ganda (Split Decision) &amp; Force Order
              </span>
              <h3 className="text-base sm:text-lg font-bold mt-0.5">
                {selectedComplaint.ticketCode} — {selectedComplaint.subject}
              </h3>
            </div>

            <div className="p-6 space-y-4 max-h-[72vh] overflow-y-auto text-xs text-slate-700">
              <div className="rounded-xl bg-slate-50 p-4 border border-slate-200 space-y-1.5">
                <p>
                  <strong>Pelapor:</strong> {selectedComplaint.reporterName} →{' '}
                  <strong>Terlapor:</strong> {selectedComplaint.reportedPartyName}
                </p>
                <p>
                  <strong>Nilai Dana di Rekening Bersama (Escrow):</strong>{' '}
                  <span className="font-black text-indigo-900">
                    {formatRupiah(selectedComplaint.escrowAmountRp)}
                  </span>
                </p>
              </div>

              {/* Pilih Keputusan Finansial Split Decision */}
              <div className="rounded-xl border border-rose-200 bg-rose-50/40 p-4 space-y-3">
                <p className="font-extrabold text-rose-950">
                  1. Keputusan Alokasi Dana Escrow (Split Decision):
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'full_refund', label: 'Full Refund (100% Pembeli)' },
                    { id: 'partial_split', label: 'Partial Refund / Split' },
                    { id: 'release_to_seller', label: 'Release (100% Penjual)' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        const mode = opt.id as SplitDecisionType;
                        setSplitTypeDraft(mode);
                        if (mode === 'full_refund') {
                          setRefundBuyerDraft(selectedComplaint.escrowAmountRp);
                        } else if (mode === 'release_to_seller') {
                          setRefundBuyerDraft(0);
                        } else if (mode === 'partial_split' && refundBuyerDraft === 0) {
                          setRefundBuyerDraft(Math.round(selectedComplaint.escrowAmountRp / 2));
                        }
                      }}
                      className={`rounded-xl border px-3 py-2 text-[11px] font-bold transition ${splitTypeDraft === opt.id
                          ? 'border-rose-600 bg-rose-600 text-white'
                          : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                {splitTypeDraft === 'partial_split' && selectedComplaint.escrowAmountRp > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Nominal Refund ke Pembeli (Rp):
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={selectedComplaint.escrowAmountRp}
                        value={refundBuyerDraft}
                        onChange={(e) => setRefundBuyerDraft(Number(e.target.value) || 0)}
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold"
                      />
                    </div>
                    <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-2.5 flex flex-col justify-center">
                      <span className="text-[10px] font-bold uppercase text-emerald-700">
                        Sisa Diteruskan ke Penjual:
                      </span>
                      <span className="text-sm font-black text-emerald-900">
                        {formatRupiah(
                          Math.max(0, selectedComplaint.escrowAmountRp - refundBuyerDraft),
                        )}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Intervensi Pesanan Macet & Hold Payout */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-xl border border-slate-200 p-3 space-y-1.5">
                  <label className="block text-[11px] font-extrabold text-slate-800">
                    2. Intervensi Pesanan Macet (Force Action):
                  </label>
                  <select
                    value={forceActionDraft}
                    onChange={(e) => setForceActionDraft(e.target.value as ForceOrderActionType)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold"
                  >
                    <option value="none">Tidak Ada Force Action</option>
                    <option value="force_completed">Force Complete Order (Selesaikan Paksa)</option>
                    <option value="force_cancelled">Force Cancel Order (Batalkan Paksa)</option>
                  </select>
                </div>

                <label className="rounded-xl border border-amber-300 bg-amber-50/70 p-3 flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={holdEscrowDraft}
                    onChange={(e) => setHoldEscrowDraft(e.target.checked)}
                    className="h-4 w-4 accent-amber-600"
                  />
                  <div>
                    <span className="block font-extrabold text-amber-950">
                      Aktifkan Hold Payout Escrow
                    </span>
                    <span className="text-[11px] text-amber-800">
                      Tahan pencairan dana mitra selama investigasi / audit berjalan.
                    </span>
                  </div>
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Catatan Putusan Mediasi Resmi (Tercatat di Audit Trail):
                </label>
                <textarea
                  rows={3}
                  value={complaintDecisionDraft}
                  onChange={(e) => setComplaintDecisionDraft(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-3 text-xs focus:border-rose-600 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 bg-slate-50 px-6 py-4">
              <button
                type="button"
                onClick={() => setSelectedComplaint(null)}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100"
              >
                Batal
              </button>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleSaveComplaintDecision('in_mediation')}
                  className="rounded-xl border border-violet-300 bg-violet-50 hover:bg-violet-100 px-3.5 py-2 text-xs font-bold text-violet-900"
                >
                  Simpan Status Mediasi
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveComplaintDecision('escalated_legal')}
                  className="rounded-xl border border-rose-300 bg-rose-50 hover:bg-rose-100 px-3.5 py-2 text-xs font-bold text-rose-800"
                >
                  Tindak Lanjut Level Akun
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveComplaintDecision('resolved')}
                  className="rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 py-2 text-xs font-bold text-white shadow-sm"
                >
                  Eksekusi &amp; Selesaikan (Resolved)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════
          MODAL PILAR 3: CUSTOM FEE OVERRIDE, CHECKBOX APPROVAL LOG & STNK/KIR
         ════════════════════════════════════════════════════════════════════════ */}
      {selectedB2B && (
        <div
          className="fixed inset-0 z-[130] flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-sm"
          onClick={() => setSelectedB2B(null)}
        >
          <div
            className="w-full max-w-2xl rounded-2xl border border-indigo-200 bg-white shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-cyan-950 px-6 py-4 text-white">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-300">
                Pilar 3 — Tata Kelola B2B &amp; Validasi Armada Pickup
              </span>
              <h3 className="text-base sm:text-lg font-bold mt-0.5">
                {selectedB2B.referenceCode} — {selectedB2B.partnerName}
              </h3>
            </div>

            <div className="p-6 space-y-4 max-h-[72vh] overflow-y-auto text-xs text-slate-700">
              {/* Custom Fee Override */}
              <div className="rounded-xl border border-indigo-200 bg-indigo-50/40 p-4 space-y-3">
                <p className="font-extrabold text-indigo-950">
                  Penyesuaian Tarif Khusus / Custom Fee Override (Standar Platform: 5%):
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Potongan Komisi Khusus (%):
                    </label>
                    <input
                      type="number"
                      step="0.25"
                      min={0}
                      max={25}
                      value={customFeeDraft}
                      onChange={(e) => setCustomFeeDraft(Number(e.target.value) || 0)}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Biaya Layanan Tambahan B2B (Rp):
                    </label>
                    <input
                      type="number"
                      min={0}
                      step={25000}
                      value={additionalFeeDraft}
                      onChange={(e) => setAdditionalFeeDraft(Number(e.target.value) || 0)}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Alasan Penguncian Tarif Khusus:
                  </label>
                  <input
                    type="text"
                    value={feeReasonDraft}
                    onChange={(e) => setFeeReasonDraft(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs"
                  />
                </div>
              </div>

              {selectedB2B.governanceType === 'fleet_rental' && (
                <div className="rounded-xl border border-cyan-200 bg-cyan-50/50 p-4 space-y-1.5">
                  <p className="font-extrabold text-cyan-950">
                    Hasil Cek Legalitas Kendaraan ({selectedB2B.vehiclePlate}):
                  </p>
                  <p>
                    • <strong>STNK:</strong> {selectedB2B.stnkNumber} ({selectedB2B.stnkStatus === 'active' ? 'AKTIF s/d ' + selectedB2B.stnkExpiry : 'KEDALUWARSA'})
                  </p>
                  <p>
                    • <strong>Uji KIR:</strong> {selectedB2B.kirNumber} ({selectedB2B.kirStatus === 'active' ? 'AKTIF s/d ' + selectedB2B.kirExpiry : 'KEDALUWARSA — ' + selectedB2B.kirExpiry})
                  </p>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Catatan Keputusan Admin (B2B / Kelayakan Armada):
                </label>
                <textarea
                  rows={3}
                  value={b2bNotesDraft}
                  onChange={(e) => setB2bNotesDraft(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-3 text-xs focus:border-indigo-600 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 bg-slate-50 px-6 py-4">
              <button
                type="button"
                onClick={() => setSelectedB2B(null)}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100"
              >
                Batal
              </button>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleSaveB2BGovernance('need_revision')}
                  className="rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 px-3.5 py-2 text-xs font-bold text-amber-900"
                >
                  Minta Revisi / Perbarui KIR
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveB2BGovernance('approved')}
                  className="rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 py-2 text-xs font-bold text-white shadow-sm"
                >
                  Verifikasi Log, Kunci Tarif &amp; Setujui
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════
          MODAL UNGGAH DRAF FORMULIR PDF B2B BARU
         ════════════════════════════════════════════════════════════════════════ */}
      {showUploadTemplateModal && (
        <div
          className="fixed inset-0 z-[130] flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-sm"
          onClick={() => setShowUploadTemplateModal(false)}
        >
          <form
            onSubmit={handleSaveNewTemplatePdf}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden"
          >
            <div className="bg-slate-900 px-6 py-4 text-white">
              <h3 className="text-base font-bold">
                Unggah Draf Formulir PDF Bantuan Terbaru (Role Admin)
              </h3>
            </div>
            <div className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Judul Formulir Bantuan / Perjanjian B2B:
                </label>
                <input
                  type="text"
                  required
                  value={tplTitleDraft}
                  onChange={(e) => setTplTitleDraft(e.target.value)}
                  placeholder="Misal: Formulir Sewa Gudang & Cold Storage B2B"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-800 mb-1">Kode Versi Dokumen:</label>
                <input
                  type="text"
                  required
                  value={tplVersionDraft}
                  onChange={(e) => setTplVersionDraft(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 font-mono"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Ringkasan Klausul Persetujuan Digital (Checkbox Approval):
                </label>
                <textarea
                  rows={3}
                  value={tplSummaryDraft}
                  onChange={(e) => setTplSummaryDraft(e.target.value)}
                  placeholder="Isi klausul persetujuan elektronik tanpa tanda tangan basah..."
                  className="w-full rounded-xl border border-slate-300 p-3"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-slate-200 bg-slate-50 px-6 py-4">
              <button
                type="button"
                onClick={() => setShowUploadTemplateModal(false)}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700"
              >
                Batal
              </button>
              <button
                type="submit"
                className="rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 py-2 text-xs font-bold text-white"
              >
                Simpan &amp; Terbitkan Template PDF
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════
          MODAL KOREKSI MANUAL VIEWS BOT ROYALTI PENULIS
         ════════════════════════════════════════════════════════════════════════ */}
      {editingRoyalty && (
        <div
          className="fixed inset-0 z-[130] flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-sm"
          onClick={() => setEditingRoyalty(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-indigo-200 bg-white shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-indigo-950 px-6 py-4 text-white">
              <h3 className="text-sm font-bold">
                Koreksi Pemotongan Views Bot — {editingRoyalty.authorName}
              </h3>
            </div>
            <div className="p-6 space-y-4 text-xs">
              <p className="font-bold text-slate-800">{editingRoyalty.articleTitle}</p>
              <p className="text-slate-600">
                Total Views Mentah:{' '}
                <strong>{editingRoyalty.rawViews.toLocaleString('id-ID')}</strong>
              </p>
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Jumlah Views Terindikasi Bot yang Dipotong:
                </label>
                <input
                  type="number"
                  min={0}
                  max={editingRoyalty.rawViews}
                  value={botDeductDraft}
                  onChange={(e) => setBotDeductDraft(Number(e.target.value) || 0)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 font-bold"
                />
              </div>
              <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3">
                <p className="font-bold text-emerald-900">
                  Valid Views Bersih:{' '}
                  {Math.max(0, editingRoyalty.rawViews - botDeductDraft).toLocaleString('id-ID')}{' '}
                  views
                </p>
                <p className="text-emerald-800 mt-0.5">
                  Estimasi Royalti Baru:{' '}
                  {formatRupiah(
                    (Math.max(0, editingRoyalty.rawViews - botDeductDraft) / 1000) *
                    editingRoyalty.ratePerThousandViewsRp,
                  )}
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-slate-200 bg-slate-50 px-6 py-4">
              <button
                type="button"
                onClick={() => setEditingRoyalty(null)}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => handleApproveBotFilteredRoyalty(editingRoyalty, botDeductDraft)}
                className="rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 py-2 text-xs font-bold text-white"
              >
                Terapkan Potongan &amp; Setujui Royalti
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL PRATINJAU GAMBAR BERKAS PENDUKUNG (TETAP DI DALAM DASHBOARD ADMIN) ── */}
      {previewImageFile && (
        <div
          className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm"
          onClick={() => setPreviewImageFile(null)}
        >
          <div
            className="w-full max-w-4xl rounded-2xl border border-sky-300 bg-white shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-sky-900 via-slate-900 to-indigo-950 px-6 py-4 text-white">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-500/20 border border-sky-400/40 text-sky-300">
                  <Eye className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-sky-400 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-950">
                      Pratinjau Gambar di Dashboard Admin
                    </span>
                    <span className="text-xs text-sky-200 font-mono">
                      {previewImageFile.fileName} ({previewImageFile.fileSize})
                    </span>
                  </div>
                  <h3 className="text-base font-bold mt-0.5">{previewImageFile.label}</h3>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 rounded-xl bg-white/10 border border-white/20 p-1">
                  <button
                    type="button"
                    onClick={() => setImageZoom((z) => Math.max(80, z - 15))}
                    className="rounded-lg px-2 py-1 text-xs font-bold text-white hover:bg-white/20"
                    title="Perkecil gambar"
                  >
                    <ZoomOut className="h-3.5 w-3.5" />
                  </button>
                  <span className="px-2 text-xs font-extrabold">{imageZoom}%</span>
                  <button
                    type="button"
                    onClick={() => setImageZoom((z) => Math.min(145, z + 15))}
                    className="rounded-lg px-2 py-1 text-xs font-bold text-white hover:bg-white/20"
                    title="Perbesar gambar"
                  >
                    <ZoomIn className="h-3.5 w-3.5" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setPreviewImageFile(null)}
                  className="inline-flex items-center gap-1 rounded-xl bg-rose-600 hover:bg-rose-700 px-3 py-2 text-xs font-bold text-white transition"
                >
                  <X className="h-4 w-4" />
                  Tutup Gambar
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 max-h-[78vh] overflow-y-auto">
              <div className="lg:col-span-7 bg-slate-900 flex flex-col items-center justify-center p-6 overflow-hidden">
                <div className="overflow-auto max-h-[55vh] w-full flex items-center justify-center rounded-xl border border-slate-700 bg-slate-950 p-3">
                  <img
                    src={
                      previewImageFile.imageUrl ||
                      'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1000&q=80'
                    }
                    alt={previewImageFile.label}
                    style={{
                      transform: `scale(${imageZoom / 100})`,
                      transformOrigin: 'center center',
                    }}
                    className="max-h-[48vh] w-auto object-contain rounded-lg transition-transform duration-150"
                  />
                </div>
                {previewImageFile.imageCaption && (
                  <p className="mt-3 text-center text-xs text-slate-300 leading-relaxed">
                    {previewImageFile.imageCaption}
                  </p>
                )}
              </div>

              <div className="lg:col-span-5 p-6 space-y-4 bg-white text-xs text-slate-700">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <span className="font-extrabold uppercase tracking-wider text-slate-500 text-[11px]">
                    Data Pemeriksaan Berkas Gambar
                  </span>
                  {previewImageFile.isDataMatching ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-bold">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Sesuai Pengajuan
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-0.5 text-[11px] font-bold">
                      <AlertTriangle className="h-3.5 w-3.5" /> Perlu Dicek Ulang
                    </span>
                  )}
                </div>

                <div className="space-y-2.5 rounded-xl bg-slate-50 p-4 border border-slate-200">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">
                      Nomor Identitas / Referensi
                    </span>
                    <span className="font-mono font-bold text-slate-900">
                      {previewImageFile.documentNumber}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">
                      Nama Pemohon / Pihak Terkait
                    </span>
                    <span className="font-bold text-slate-900">
                      {previewImageFile.applicantOrOwner}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">
                      Unit Usaha / Transaksi
                    </span>
                    <span className="font-semibold text-slate-800">
                      {previewImageFile.businessName}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">
                      Lokasi Terdaftar
                    </span>
                    <span className="font-semibold text-slate-700">
                      {previewImageFile.address}
                    </span>
                  </div>
                </div>

                <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 space-y-1.5">
                  <p className="font-extrabold text-emerald-950 flex items-center gap-1.5">
                    <BadgeCheck className="h-4 w-4 text-emerald-700" />
                    Hasil Cek Kesesuaian Visual:
                  </p>
                  <p className="text-emerald-900 leading-relaxed">
                    {previewImageFile.verificationMatchSummary}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setPreviewImageFile(null)}
                  className="w-full rounded-xl bg-slate-900 hover:bg-slate-800 py-2.5 px-4 text-xs font-bold text-white transition"
                >
                  Selesai Memeriksa Gambar (Tetap di Dashboard Admin)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
