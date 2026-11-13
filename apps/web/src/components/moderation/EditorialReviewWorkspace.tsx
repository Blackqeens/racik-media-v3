'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  ArrowLeft,
  Bold,
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Copy,
  ExternalLink,
  Eye,
  FileEdit,
  Globe,
  GripHorizontal,
  Heading2,
  Image as ImageIcon,
  ImagePlus,
  Italic,
  Layers,
  List,
  ListOrdered,
  PackageSearch,
  Quote,
  Replace,
  RotateCcw,
  Search,
  Send,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Trash2,
  Type,
  Undo2,
  Upload,
  Wand2,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import {
  EditorialArchiveItem,
  analyzeWritingAndImage,
} from '@/lib/editorial-archive';
import { createModeratorEscalationToAdmin } from '@/lib/admin-administration-store';

export interface EditorialReviewWorkspaceProps {
  item: EditorialArchiveItem;
  allArchiveItems?: EditorialArchiveItem[];
  canPublishHomepage?: boolean;
  isFullPage?: boolean;
  backHref?: string;
  onClose?: () => void;
  onSave: (updated: EditorialArchiveItem) => void;
  onSelectArchiveItem?: (target: EditorialArchiveItem) => void;
}

const ROLE_LABELS: Record<string, string> = {
  author: 'Penulis (Naungan Moderator)',
  member: 'Member / Kontributor',
  seller: 'Mitra Seller',
  distributor: 'Mitra Distributor',
  service_provider: 'Penyedia Jasa',
};

const ROLE_FILTER_OPTIONS = [
  { id: 'all', label: 'Semua Role' },
  { id: 'author', label: 'Author' },
  { id: 'member', label: 'Member' },
  { id: 'seller', label: 'Seller' },
  { id: 'distributor', label: 'Distributor' },
  { id: 'service_provider', label: 'Penyedia Jasa' },
];

const ENTITY_LABELS: Record<string, { label: string; color: string }> = {
  article: {
    label: 'Artikel & Jurnal',
    color: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  },
  event: {
    label: 'Agenda Event & Pelatihan',
    color: 'bg-sky-100 text-sky-800 border-sky-300',
  },
  product_description: {
    label: 'Deskripsi Produk Seller / Distributor',
    color: 'bg-amber-100 text-amber-800 border-amber-300',
  },
};

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&q=80';

const THEME_GALLERY_DEFAULTS: Record<string, string[]> = {
  article: [
    'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&q=80',
    'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800&q=80',
    'https://images.unsplash.com/photo-1509099836639-18ba1795216d?w=800&q=80',
    'https://images.unsplash.com/photo-1444858291040-58f756a3bdd6?w=800&q=80',
  ],
  event: [
    'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=800&q=80',
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80',
    'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&q=80',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
  ],
  product_description: [
    'https://images.unsplash.com/photo-1610889556528-9a770e32642f?w=800&q=80',
    'https://images.unsplash.com/photo-1571115177098-24ec42ed204d?w=800&q=80',
    'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=800&q=80',
    'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800&q=80',
  ],
};

function buildInitialGallery(item: EditorialArchiveItem): string[] {
  const collected: string[] = [];
  if (item.image?.trim()) collected.push(item.image.trim());
  for (const img of item.images ?? []) {
    if (img?.trim() && !collected.includes(img.trim())) {
      collected.push(img.trim());
    }
  }
  const defaults = THEME_GALLERY_DEFAULTS[item.entityType] ?? THEME_GALLERY_DEFAULTS.article;
  for (const url of defaults) {
    if (collected.length >= 4) break;
    if (!collected.includes(url)) collected.push(url);
  }
  return collected;
}

const FONT_FAMILY_OPTIONS: {
  id: 'sans' | 'serif' | 'georgia' | 'mono';
  label: string;
  cssFamily: string;
}[] = [
  { id: 'sans', label: 'Sans Modern (Inter)', cssFamily: 'Inter, system-ui, sans-serif' },
  { id: 'serif', label: 'Editorial Serif (Lora)', cssFamily: 'Lora, Georgia, serif' },
  { id: 'georgia', label: 'Klasik Surat Kabar (Georgia)', cssFamily: 'Georgia, Times New Roman, serif' },
  { id: 'mono', label: 'Teknis Monospace', cssFamily: 'ui-monospace, SFMono-Regular, monospace' },
];

export function EditorialReviewWorkspace({
  item,
  allArchiveItems = [],
  canPublishHomepage = true,
  isFullPage = false,
  backHref = '/admin/moderation',
  onClose,
  onSave,
  onSelectArchiveItem,
}: EditorialReviewWorkspaceProps) {
  const initialGallery = buildInitialGallery(item);
  const [form, setForm] = useState<EditorialArchiveItem>({
    ...item,
    image: item.image || initialGallery[0] || FALLBACK_IMAGE,
    images: initialGallery,
    editorFontFamily: item.editorFontFamily ?? 'sans',
    editorFontSize: item.editorFontSize ?? (isFullPage ? 15 : 14),
    editorTextAlign: item.editorTextAlign ?? 'left',
  });
  const [galleryImages, setGalleryImages] = useState<string[]>(initialGallery);
  const [newImageUrlInput, setNewImageUrlInput] = useState('');
  const [previewImageIndex, setPreviewImageIndex] = useState<number | null>(null);
  const [previewZoom, setPreviewZoom] = useState<number>(100);

  const [validationError, setValidationError] = useState<string | null>(null);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');

  // ── Panel Referensi Lintas Role (Author, Member, Seller, Distributor, Penyedia Jasa) ──
  const [showReferencesPanel, setShowReferencesPanel] = useState<boolean>(isFullPage);
  const [refRoleFilter, setRefRoleFilter] = useState<string>('all');
  const [refSearch, setRefSearch] = useState<string>('');
  const [expandedRefId, setExpandedRefId] = useState<string | null>(null);

  // ── Tool Editing Text State ──
  const [activeTextField, setActiveTextField] = useState<'excerpt' | 'body'>('body');
  const [fontFamily, setFontFamily] = useState<'sans' | 'serif' | 'georgia' | 'mono'>(
    item.editorFontFamily ?? 'sans',
  );
  const [fontSize, setFontSize] = useState<number>(
    item.editorFontSize ?? (isFullPage ? 15 : 14),
  );
  const [lineHeight, setLineHeight] = useState<number>(1.65);
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right' | 'justify'>(
    item.editorTextAlign ?? 'left',
  );
  const [showFindReplace, setShowFindReplace] = useState(false);
  const [findQuery, setFindQuery] = useState('');
  const [replaceQuery, setReplaceQuery] = useState('');
  const [textHistory, setTextHistory] = useState<{ excerpt: string; body: string }[]>([]);
  const [editorToast, setEditorToast] = useState<string | null>(null);

  // ── Tinggi Kolom Excerpt & Body ──
  const MIN_EXCERPT_HEIGHT = 80;
  const MAX_EXCERPT_HEIGHT = 280;
  const MIN_BODY_HEIGHT = 160;
  const MAX_BODY_HEIGHT = 680;
  const MIN_DIFF = 32;

  const [excerptHeight, setExcerptHeight] = useState<number>(isFullPage ? 125 : 100);
  const [bodyHeight, setBodyHeight] = useState<number>(isFullPage ? 340 : 230);

  const excerptRef = useRef<HTMLTextAreaElement | null>(null);
  const bodyRef = useRef<HTMLTextAreaElement | null>(null);
  const fileUploadInputRef = useRef<HTMLInputElement | null>(null);

  // Sinkronkan ulang jika item yang diedit berganti
  useEffect(() => {
    const nextGallery = buildInitialGallery(item);
    setForm({
      ...item,
      image: item.image || nextGallery[0] || FALLBACK_IMAGE,
      images: nextGallery,
      editorFontFamily: item.editorFontFamily ?? 'sans',
      editorFontSize: item.editorFontSize ?? (isFullPage ? 15 : 14),
      editorTextAlign: item.editorTextAlign ?? 'left',
    });
    setGalleryImages(nextGallery);
    setFontFamily(item.editorFontFamily ?? 'sans');
    setFontSize(item.editorFontSize ?? (isFullPage ? 15 : 14));
    setTextAlign(item.editorTextAlign ?? 'left');
    setValidationError(null);
    setSaveSuccessMsg(null);
    setTextHistory([]);
  }, [item.id]);

  useEffect(() => {
    if (!editorToast) return;
    const t = window.setTimeout(() => setEditorToast(null), 2800);
    return () => window.clearTimeout(t);
  }, [editorToast]);

  const activeFontCss =
    FONT_FAMILY_OPTIONS.find((f) => f.id === fontFamily)?.cssFamily ??
    'Inter, system-ui, sans-serif';

  const filteredReferences = useMemo(() => {
    return allArchiveItems.filter((refItem) => {
      if (refItem.id === form.id) return false;
      if (refRoleFilter !== 'all' && refItem.sourceRole !== refRoleFilter) return false;
      if (refSearch.trim()) {
        const q = refSearch.toLowerCase();
        const hay = `${refItem.title} ${refItem.submitterName} ${refItem.categoryLabel} ${refItem.excerpt}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [allArchiveItems, form.id, refRoleFilter, refSearch]);

  function syncFormTypography(
    nextFamily = fontFamily,
    nextSize = fontSize,
    nextAlign = textAlign,
  ) {
    setForm((prev) => ({
      ...prev,
      editorFontFamily: nextFamily,
      editorFontSize: nextSize,
      editorTextAlign: nextAlign,
    }));
  }

  function pushTextHistory() {
    setTextHistory((prev) => [...prev.slice(-14), { excerpt: form.excerpt, body: form.body }]);
  }

  function handleUndoText() {
    if (textHistory.length === 0) return;
    const last = textHistory[textHistory.length - 1];
    setTextHistory((prev) => prev.slice(0, -1));
    setForm((prev) => ({ ...prev, excerpt: last.excerpt, body: last.body }));
    setEditorToast('Perubahan teks dikembalikan ke versi sebelumnya.');
  }

  function applyTextWrapFormat(prefix: string, suffix = '', placeholder = 'teks') {
    const field = activeTextField;
    const el = field === 'excerpt' ? excerptRef.current : bodyRef.current;
    const currentText = field === 'excerpt' ? form.excerpt : form.body;

    pushTextHistory();

    if (!el) {
      const appended = `${currentText}${currentText ? ' ' : ''}${prefix}${placeholder}${suffix}`;
      setForm((prev) => ({ ...prev, [field]: appended }));
      return;
    }

    const start = el.selectionStart ?? currentText.length;
    const end = el.selectionEnd ?? currentText.length;
    const selected = currentText.slice(start, end) || placeholder;
    const nextText =
      currentText.slice(0, start) + prefix + selected + suffix + currentText.slice(end);

    setForm((prev) => ({ ...prev, [field]: nextText }));

    window.requestAnimationFrame(() => {
      el.focus();
      const cursorPos = start + prefix.length + selected.length + suffix.length;
      el.setSelectionRange(cursorPos, cursorPos);
    });
  }

  function applyLinePrefixFormat(linePrefix: string) {
    const field = activeTextField;
    const el = field === 'excerpt' ? excerptRef.current : bodyRef.current;
    const currentText = field === 'excerpt' ? form.excerpt : form.body;

    pushTextHistory();

    if (!el) {
      setForm((prev) => ({
        ...prev,
        [field]: `${currentText}${currentText ? '\n' : ''}${linePrefix}`,
      }));
      return;
    }

    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? start;
    const selected = currentText.slice(start, end);

    if (selected.includes('\n')) {
      const transformed = selected
        .split('\n')
        .map((line, i) =>
          linePrefix === '1. ' ? `${i + 1}. ${line.replace(/^\d+\.\s*/, '')}` : `${linePrefix}${line}`,
        )
        .join('\n');
      const nextText = currentText.slice(0, start) + transformed + currentText.slice(end);
      setForm((prev) => ({ ...prev, [field]: nextText }));
    } else {
      const lineStart = currentText.lastIndexOf('\n', start - 1) + 1;
      const nextText =
        currentText.slice(0, lineStart) + linePrefix + currentText.slice(lineStart);
      setForm((prev) => ({ ...prev, [field]: nextText }));
    }
  }

  function applyCaseTransform(mode: 'sentence' | 'title' | 'upper') {
    const field = activeTextField;
    const el = field === 'excerpt' ? excerptRef.current : bodyRef.current;
    const currentText = field === 'excerpt' ? form.excerpt : form.body;

    pushTextHistory();

    const transform = (str: string) => {
      if (mode === 'upper') return str.toUpperCase();
      if (mode === 'title') {
        return str.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
      }
      return str
        .toLowerCase()
        .replace(/(^\s*\w|[.!?]\s+\w)/g, (c) => c.toUpperCase());
    };

    if (el && el.selectionEnd > el.selectionStart) {
      const start = el.selectionStart;
      const end = el.selectionEnd;
      const nextText =
        currentText.slice(0, start) +
        transform(currentText.slice(start, end)) +
        currentText.slice(end);
      setForm((prev) => ({ ...prev, [field]: nextText }));
    } else {
      setForm((prev) => ({ ...prev, [field]: transform(currentText) }));
    }
    setEditorToast('Kapitalisasi teks berhasil dirapikan.');
  }

  function handleCleanWhitespace() {
    pushTextHistory();
    const clean = (txt: string) =>
      txt
        .replace(/[ \t]{2,}/g, ' ')
        .replace(/\n{3,}/g, '\n\n')
        .replace(/ ,/g, ',')
        .replace(/ \./g, '.')
        .trim();

    setForm((prev) => ({
      ...prev,
      title: clean(prev.title),
      excerpt: clean(prev.excerpt),
      body: clean(prev.body),
    }));
    setEditorToast('Spasi ganda & tanda baca seluruh naskah dirapikan.');
  }

  function handleFindAndReplaceAll() {
    if (!findQuery) return;
    pushTextHistory();
    const escaped = findQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escaped, 'g');
    const total =
      (form.title.match(regex) ?? []).length +
      (form.excerpt.match(regex) ?? []).length +
      (form.body.match(regex) ?? []).length;

    setForm((prev) => ({
      ...prev,
      title: prev.title.replace(regex, replaceQuery),
      excerpt: prev.excerpt.replace(regex, replaceQuery),
      body: prev.body.replace(regex, replaceQuery),
    }));
    setEditorToast(
      total > 0
        ? `Berhasil mengganti ${total} kata "${findQuery}" menjadi "${replaceQuery}".`
        : `Kata "${findQuery}" tidak ditemukan di naskah.`,
    );
  }

  // ── Manajemen Galeri Multi-Gambar ──
  function selectImageForPublish(url: string) {
    setForm((prev) => ({
      ...prev,
      image: url,
      images: galleryImages,
    }));
    setValidationError(null);
    setEditorToast('Gambar dipilih sebagai Sampul Publikasi Utama.');
  }

  function handleAddImageUrl() {
    const trimmed = newImageUrlInput.trim();
    if (!trimmed) return;
    if (
      !trimmed.startsWith('http://') &&
      !trimmed.startsWith('https://') &&
      !trimmed.startsWith('data:image/') &&
      !trimmed.startsWith('/')
    ) {
      setEditorToast('Masukkan URL gambar yang valid (https://... atau upload file lokal).');
      return;
    }
    if (galleryImages.includes(trimmed)) {
      selectImageForPublish(trimmed);
      setNewImageUrlInput('');
      return;
    }
    const nextGallery = [...galleryImages, trimmed];
    setGalleryImages(nextGallery);
    setForm((prev) => ({ ...prev, images: nextGallery }));
    setNewImageUrlInput('');
    setEditorToast(`Gambar ke-${nextGallery.length} berhasil ditambahkan ke daftar peninjauan.`);
  }

  function handleUploadLocalImages(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result !== 'string') return;
        const dataUrl = reader.result;
        setGalleryImages((prev) => {
          if (prev.includes(dataUrl)) return prev;
          const next = [...prev, dataUrl];
          setForm((curr) => ({ ...curr, images: next }));
          return next;
        });
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
    setEditorToast(`${files.length} file gambar lokal ditambahkan untuk diperiksa.`);
  }

  function handleRemoveGalleryImage(indexToRemove: number) {
    if (galleryImages.length <= 1) {
      setEditorToast('Minimal harus ada 1 gambar tersisa untuk konten.');
      return;
    }
    const removedUrl = galleryImages[indexToRemove];
    const nextGallery = galleryImages.filter((_, idx) => idx !== indexToRemove);
    setGalleryImages(nextGallery);
    setForm((prev) => ({
      ...prev,
      image: prev.image === removedUrl ? nextGallery[0] : prev.image,
      images: nextGallery,
    }));
    if (previewImageIndex !== null) {
      setPreviewImageIndex(null);
    }
  }

  // ── Aksi Referensi Lintas Role ──
  function handleCopyReferenceText(refItem: EditorialArchiveItem) {
    const snippet = `${refItem.title}\n\n${refItem.excerpt}\n\n${refItem.body}`;
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(snippet).catch(() => {});
    }
    setEditorToast(`Teks referensi "${refItem.title.slice(0, 28)}..." disalin.`);
  }

  function handleInsertReferenceIntoBody(refItem: EditorialArchiveItem) {
    pushTextHistory();
    const roleName = ROLE_LABELS[refItem.sourceRole] ?? refItem.sourceRole;
    const citation = `\n\n> Referensi (${roleName} — ${refItem.submitterName}): "${refItem.title}"\n${refItem.excerpt}`;
    setForm((prev) => ({
      ...prev,
      body: `${prev.body}${citation}`,
    }));
    setEditorToast(`Referensi dari ${refItem.submitterName} disisipkan ke Isi Lengkap.`);
  }

  // ── Resizer Tinggi Excerpt & Body ──
  function updateExcerptHeightSafe(nextExcerpt: number) {
    const clampedExcerpt = Math.max(
      MIN_EXCERPT_HEIGHT,
      Math.min(MAX_EXCERPT_HEIGHT, nextExcerpt),
    );
    setExcerptHeight(clampedExcerpt);
    setBodyHeight((prevBody) => {
      if (clampedExcerpt + MIN_DIFF > prevBody) {
        return Math.min(MAX_BODY_HEIGHT, clampedExcerpt + MIN_DIFF);
      }
      return prevBody;
    });
  }

  function updateBodyHeightSafe(nextBody: number) {
    const clampedBody = Math.max(MIN_BODY_HEIGHT, Math.min(MAX_BODY_HEIGHT, nextBody));
    setBodyHeight(clampedBody);
    setExcerptHeight((prevExcerpt) => {
      if (prevExcerpt > clampedBody - MIN_DIFF) {
        return Math.max(MIN_EXCERPT_HEIGHT, clampedBody - MIN_DIFF);
      }
      return prevExcerpt;
    });
  }

  function startResizeField(field: 'excerpt' | 'body', e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const startY = e.clientY;
    const startH = field === 'excerpt' ? excerptHeight : bodyHeight;

    function onMouseMove(ev: MouseEvent) {
      const dy = ev.clientY - startY;
      if (field === 'excerpt') {
        updateExcerptHeightSafe(startH + dy);
      } else {
        updateBodyHeightSafe(startH + dy);
      }
    }

    function onMouseUp() {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    }

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }

  const analysis = analyzeWritingAndImage(form);
  const entityMeta = ENTITY_LABELS[form.entityType] ?? ENTITY_LABELS.article;

  function buildPayload(overrides: Partial<EditorialArchiveItem>): EditorialArchiveItem {
    return {
      ...form,
      images: galleryImages,
      editorFontFamily: fontFamily,
      editorFontSize: fontSize,
      editorTextAlign: textAlign,
      ...overrides,
    };
  }

  function handlePublishToHomepage() {
    if (!canPublishHomepage) return;
    if (!form.writingVerified || !form.imageThemeVerified) {
      setValidationError(
        'Harap centang verifikasi Kepatuhan Skema Penulisan dan Kesesuaian Gambar dengan Tema sebelum mempublikasikan ke Homepage.',
      );
      return;
    }
    setValidationError(null);
    const updated = buildPayload({
      status: 'published_homepage',
      publishedToHomepage: true,
      writingVerified: true,
      imageThemeVerified: true,
    });
    setForm(updated);
    onSave(updated);
    setSaveSuccessMsg('Naskah & gambar terpilih berhasil disimpan dan DIPUBLIKASIKAN ke Homepage!');
    if (onClose && !isFullPage) onClose();
  }

  function handleSaveArchiveOnly() {
    setValidationError(null);
    const updated = buildPayload({
      status: 'approved',
      publishedToHomepage: false,
    });
    setForm(updated);
    onSave(updated);
    setSaveSuccessMsg('Editan disimpan di Arsip Moderator (belum ditayangkan di Homepage).');
    if (onClose && !isFullPage) onClose();
  }

  function handleRequestRevision() {
    setValidationError(null);
    const updated = buildPayload({
      status: 'revision_needed',
      publishedToHomepage: false,
    });
    setForm(updated);
    onSave(updated);
    setSaveSuccessMsg('Status diubah menjadi Perlu Revisi Penulisan / Gambar.');
    if (onClose && !isFullPage) onClose();
  }

  function handleEscalateToAdmin() {
    setValidationError(null);
    const reasonText =
      form.moderatorNotes?.trim() ||
      `Pelanggaran hukum/legalitas atau klaim produk terlarang ditemukan Moderator pada naskah "${form.title}" (${form.submitterName}).`;

    const ticket = createModeratorEscalationToAdmin({
      subject: `Eskalasi Moderator: ${form.title}`,
      reportedPartyName: `${form.submitterName} (${ROLE_LABELS[form.sourceRole] ?? form.sourceRole})`,
      reportedPartyRole:
        form.sourceRole === 'seller' || form.sourceRole === 'distributor'
          ? form.sourceRole
          : 'member',
      orderOrContractRef: form.id,
      chronology: `Moderator menahan penayangan konten "${form.title}" dan mengekskalasi kasus ini ke Role Admin untuk penindakan level akun (Hold Payout / Suspend / Blacklist NIK-NPWP). Ringkasan: ${form.excerpt}`,
      moderatorNote: reasonText,
    });

    const updated = buildPayload({
      status: 'revision_needed',
      publishedToHomepage: false,
      moderatorNotes: `[ESKALASI KE ADMIN • ${ticket.ticketCode}] ${reasonText}`,
    });
    setForm(updated);
    onSave(updated);
    setSaveSuccessMsg(
      `Berhasil diekskalasi ke Dashboard Role Admin (${ticket.ticketCode}). Akun terlapor masuk antrean Sengketa & Eskalasi Moderator.`,
    );
  }

  function handleSubmitEditToModerator() {
    if (!form.title.trim() || !form.excerpt.trim() || !form.body.trim()) {
      setValidationError(
        'Judul, ringkasan, dan isi tulisan wajib diisi sebelum diajukan ke Moderator.',
      );
      return;
    }
    setValidationError(null);
    const updated = buildPayload({
      status: 'pending_review',
      publishedToHomepage: false,
      writingVerified: false,
      imageThemeVerified: false,
      moderatorNotes:
        'Telah diedit oleh kontributor/mitra — menunggu analisis tata penulisan & kesesuaian gambar tema di Dashboard Moderator.',
    });
    setForm(updated);
    onSave(updated);
    setSaveSuccessMsg('Editan diajukan ke Dashboard Moderator.');
    if (onClose && !isFullPage) onClose();
  }

  const previewedUrl =
    previewImageIndex !== null ? galleryImages[previewImageIndex] ?? null : null;

  return (
    <div className={isFullPage ? 'flex flex-col min-h-full bg-slate-50' : 'flex flex-col flex-1 min-h-0'}>
      {/* ── BAR KONTROL MODE EDIT vs MODE PREVIEW vs REFERENSI LINTAS ROLE ── */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-indigo-100 bg-slate-50 px-5 py-2.5 shrink-0">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('edit')}
            className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
              activeTab === 'edit'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            <FileEdit className="h-3.5 w-3.5" />
            Mode Edit &amp; Analisis Naskah
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
              activeTab === 'preview'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white text-emerald-800 border border-emerald-300 hover:bg-emerald-50'
            }`}
          >
            <Eye className="h-3.5 w-3.5" />
            Mode Preview Homepage ({galleryImages.length} Gambar)
          </button>

          {allArchiveItems.length > 0 && (
            <button
              type="button"
              onClick={() => setShowReferencesPanel((v) => !v)}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold border transition ${
                showReferencesPanel
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm'
                  : 'bg-white text-amber-900 border-amber-300 hover:bg-amber-50'
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              Referensi Seluruh Role ({filteredReferences.length})
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
          {editorToast && (
            <span className="rounded-full bg-indigo-100 text-indigo-900 px-3 py-0.5 font-bold">
              {editorToast}
            </span>
          )}
          <span
            className={`rounded-full px-2.5 py-0.5 font-bold ${
              analysis.score === 100
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-amber-100 text-amber-800'
            }`}
          >
            Skor Kelayakan: {analysis.score}%
          </span>
          <span className="hidden sm:inline text-slate-400">|</span>
          <span className="hidden sm:inline font-semibold text-slate-600">
            {galleryImages.length} Gambar Terlampir
          </span>
        </div>
      </div>

      {/* Banner Konfirmasi Berhasil Simpan / Publikasi */}
      {saveSuccessMsg && (
        <div className="mx-5 mt-4 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-xs font-bold text-emerald-900 flex flex-wrap items-center justify-between gap-2 shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{saveSuccessMsg}</span>
          </div>
          <Link
            href={backHref}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 text-[11px] font-extrabold text-white transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Kembali ke Dashboard Moderator
          </Link>
        </div>
      )}

      {/* ── BODY WORKSPACE ── */}
      <div className={`flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 select-text ${isFullPage ? 'max-w-[1440px] w-full mx-auto' : ''}`}>
        {/* ── PANEL REFERENSI DARI SELURUH ROLE (AUTHOR, MEMBER, SELLER, DISTRIBUTOR, PENYEDIA JASA) ── */}
        {showReferencesPanel && allArchiveItems.length > 0 && (
          <div className="rounded-2xl border-2 border-amber-200 bg-amber-50/50 p-4 space-y-3 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-amber-200/70 pb-3">
              <div>
                <h3 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-amber-950 flex items-center gap-1.5">
                  <Layers className="h-4 w-4 text-amber-700" />
                  Panel Referensi Naskah &amp; Data dari Seluruh Role ({filteredReferences.length} Arsip)
                </h3>
                <p className="text-[11px] text-amber-900/80 mt-0.5">
                  Gunakan naskah dari role lain (Author, Member, Seller, Distributor, Penyedia Jasa) sebagai bahan perbandingan, salin kutipan, atau klik untuk langsung menyunting item tersebut.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="h-3.5 w-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={refSearch}
                    onChange={(e) => setRefSearch(e.target.value)}
                    placeholder="Cari referensi..."
                    className="rounded-lg border border-amber-300 bg-white pl-8 pr-3 py-1.5 text-xs focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setShowReferencesPanel(false)}
                  className="rounded-lg border border-amber-300 bg-white hover:bg-amber-100 px-2.5 py-1.5 text-xs font-bold text-amber-900"
                >
                  Tutup Referensi
                </button>
              </div>
            </div>

            {/* Filter Role Referensi */}
            <div className="flex flex-wrap items-center gap-1.5">
              {ROLE_FILTER_OPTIONS.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRefRoleFilter(r.id)}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition border ${
                    refRoleFilter === r.id
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-700 border-amber-200 hover:bg-amber-100'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>

            {/* Grid Daftar Kartu Referensi */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-72 overflow-y-auto pr-1">
              {filteredReferences.map((refItem) => {
                const isExpanded = expandedRefId === refItem.id;
                return (
                  <div
                    key={refItem.id}
                    className="rounded-xl border border-amber-200 bg-white p-3 space-y-2 shadow-sm flex flex-col justify-between"
                  >
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center justify-between gap-1">
                        <span className="rounded-full bg-indigo-50 border border-indigo-200 px-2 py-0.5 text-[10px] font-extrabold text-indigo-800">
                          {ROLE_LABELS[refItem.sourceRole] ?? refItem.sourceRole}
                        </span>
                        <span className="text-[10px] text-slate-400 font-semibold">
                          {refItem.categoryLabel}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 line-clamp-2">
                        {refItem.title}
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Oleh: <strong>{refItem.submitterName}</strong>
                      </p>
                      <p
                        className={`text-[11px] text-slate-600 leading-relaxed ${
                          isExpanded ? 'whitespace-pre-wrap' : 'line-clamp-2'
                        }`}
                      >
                        {isExpanded ? `${refItem.excerpt}\n\n${refItem.body}` : refItem.excerpt}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setExpandedRefId(isExpanded ? null : refItem.id)}
                        className="rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-700"
                      >
                        {isExpanded ? 'Ringkas' : 'Baca Penuh'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCopyReferenceText(refItem)}
                        className="inline-flex items-center gap-1 rounded-lg border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 px-2 py-1 text-[10px] font-bold text-indigo-800"
                        title="Salin teks referensi"
                      >
                        <Copy className="h-3 w-3" />
                        Salin
                      </button>
                      <button
                        type="button"
                        onClick={() => handleInsertReferenceIntoBody(refItem)}
                        className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 px-2 py-1 text-[10px] font-bold text-white"
                        title="Sisipkan kutipan referensi ini ke isi naskah yang sedang diedit"
                      >
                        + Sisipkan
                      </button>
                      {onSelectArchiveItem ? (
                        <button
                          type="button"
                          onClick={() => onSelectArchiveItem(refItem)}
                          className="inline-flex items-center gap-1 rounded-lg border border-amber-300 bg-amber-50 hover:bg-amber-100 px-2 py-1 text-[10px] font-bold text-amber-900"
                        >
                          Edit Item Ini
                        </button>
                      ) : (
                        <Link
                          href={`/admin/moderation/review/${encodeURIComponent(refItem.id)}`}
                          className="inline-flex items-center gap-1 rounded-lg border border-amber-300 bg-amber-50 hover:bg-amber-100 px-2 py-1 text-[10px] font-bold text-amber-900"
                        >
                          Buka &amp; Edit →
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'preview' ? (
          /* ══════════════════════════════════════════════════════════════════
           * MODE PREVIEW HOMEPAGE
           * ══════════════════════════════════════════════════════════════════ */
          <div className="space-y-6">
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-0.5">
                <p className="text-xs font-extrabold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                  <Eye className="h-4 w-4 text-emerald-700" />
                  Mode Preview Tayangan Homepage &amp; Galeri Lampiran
                </p>
                <p className="text-xs text-emerald-800">
                  Gambar yang berlabel <strong>&quot;Utama Publikasi&quot;</strong> akan tampil sebagai sampul di Homepage, dengan gaya tipografi ({fontFamily}, {fontSize}px) yang telah Anda atur.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('edit')}
                className="inline-flex items-center gap-1.5 rounded-xl bg-white border border-emerald-300 px-3 py-1.5 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition"
              >
                <FileEdit className="h-3.5 w-3.5" />
                Kembali ke Editor
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-5 space-y-3">
                <p className="text-xs font-extrabold uppercase tracking-wider text-slate-600">
                  1. Simulasi Kartu di Homepage ({entityMeta.label})
                </p>
                <div className="rounded-2xl border border-slate-200 bg-white shadow-md overflow-hidden">
                  <div className="aspect-[16/10] w-full bg-slate-100 relative overflow-hidden">
                    <img
                      src={form.image || FALLBACK_IMAGE}
                      alt={form.title}
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE;
                      }}
                      className="h-full w-full object-cover"
                    />
                    <span className="absolute top-3 left-3 rounded-full bg-emerald-700/90 px-3 py-1 text-[10px] font-bold text-white shadow">
                      {form.categoryLabel || 'Umum'}
                    </span>
                    {form.entityType === 'product_description' && form.badge && (
                      <span className="absolute top-3 right-3 rounded-full bg-amber-500 px-2.5 py-0.5 text-[10px] font-bold text-white shadow">
                        {form.badge}
                      </span>
                    )}
                  </div>
                  <div className="p-4 space-y-2.5" style={{ fontFamily: activeFontCss }}>
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span className="font-semibold text-slate-700">{form.submitterName}</span>
                      <span>{ROLE_LABELS[form.sourceRole] ?? form.sourceRole}</span>
                    </div>
                    <h4 className="text-base font-bold text-slate-900 leading-snug">
                      {form.title || '(Judul belum diisi)'}
                    </h4>
                    <div className="max-h-32 overflow-y-auto rounded-lg bg-slate-50 p-2.5 border border-slate-100">
                      <p
                        style={{
                          fontSize: `${Math.max(12, fontSize - 1)}px`,
                          lineHeight,
                          textAlign,
                        }}
                        className="text-slate-600 whitespace-pre-wrap"
                      >
                        {form.excerpt || '(Ringkasan tayang belum diisi)'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Strip Pilih Cepat dari Semua Gambar Lampiran */}
                <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-2">
                  <p className="text-[11px] font-bold text-slate-700">
                    Ganti Cepat Gambar Sampul Publikasi ({galleryImages.length} Tersedia):
                  </p>
                  <div className="grid grid-cols-4 gap-2">
                    {galleryImages.map((imgUrl, idx) => {
                      const isMain = form.image === imgUrl;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => selectImageForPublish(imgUrl)}
                          className={`relative aspect-square rounded-lg overflow-hidden border-2 transition ${
                            isMain
                              ? 'border-emerald-600 ring-2 ring-emerald-400/50'
                              : 'border-slate-200 hover:border-indigo-400'
                          }`}
                          title={`Pilih Gambar ${idx + 1} untuk Publikasi`}
                        >
                          <img src={imgUrl} alt="" className="h-full w-full object-cover" />
                          {isMain && (
                            <span className="absolute bottom-0 inset-x-0 bg-emerald-600/90 text-[9px] font-extrabold text-white text-center py-0.5">
                              Terpilih
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-7 space-y-2">
                <p className="text-xs font-extrabold uppercase tracking-wider text-slate-600">
                  2. Pratinjau Naskah Lengkap (Font: {fontFamily.toUpperCase()} • {fontSize}px)
                </p>
                <div
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4"
                  style={{ fontFamily: activeFontCss }}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${entityMeta.color}`}
                    >
                      {entityMeta.label}
                    </span>
                    <span className="text-xs text-slate-500">
                      Tema: <strong>{form.categoryLabel}</strong>
                    </span>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-snug">
                    {form.title}
                  </h2>

                  <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-3.5 space-y-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-700 font-sans">
                      Ringkasan / Deskripsi Tayang ({form.excerpt.trim().length} karakter)
                    </span>
                    <p
                      style={{ fontSize: `${fontSize}px`, lineHeight, textAlign }}
                      className="text-slate-800 whitespace-pre-wrap"
                    >
                      {form.excerpt}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-1.5 max-h-[420px] overflow-y-auto">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-600 font-sans">
                      Isi Lengkap Naskah / Deskripsi Detail ({form.body.trim().length} karakter)
                    </span>
                    <p
                      style={{ fontSize: `${fontSize}px`, lineHeight, textAlign }}
                      className="text-slate-800 whitespace-pre-wrap"
                    >
                      {form.body}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ══════════════════════════════════════════════════════════════════
           * MODE EDIT & ANALISIS NASKAH + TOOLBAR SUNTING LENGKAP MODERATOR
           * ══════════════════════════════════════════════════════════════════ */
          <>
            {/* Panel Analisis Otomatis Skema Penulisan & Gambar */}
            <div className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-3.5 space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-indigo-600" />
                  <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-900">
                    Analisis Kepatuhan Skema Penulisan &amp; Galeri Tema
                  </span>
                </div>
                <span
                  className={`rounded-full px-3 py-0.5 text-xs font-bold ${
                    analysis.score === 100
                      ? 'bg-emerald-600 text-white'
                      : 'bg-amber-500 text-white'
                  }`}
                >
                  Skor Teknis: {analysis.score}%
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div
                  className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 font-medium ${
                    analysis.titleValid
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                      : 'border-rose-200 bg-rose-50 text-rose-800'
                  }`}
                >
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>Judul ({form.title.trim().length} kar)</span>
                </div>
                <div
                  className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 font-medium ${
                    analysis.excerptValid
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                      : 'border-rose-200 bg-rose-50 text-rose-800'
                  }`}
                >
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>Ringkasan ({form.excerpt.trim().length} kar)</span>
                </div>
                <div
                  className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 font-medium ${
                    analysis.bodyValid
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                      : 'border-rose-200 bg-rose-50 text-rose-800'
                  }`}
                >
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>Isi Tulisan ({form.body.trim().length} kar)</span>
                </div>
                <div
                  className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 font-medium ${
                    analysis.imageValid
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                      : 'border-rose-200 bg-rose-50 text-rose-800'
                  }`}
                >
                  <ImageIcon className="h-4 w-4 shrink-0" />
                  <span>{galleryImages.length} Gambar (Valid)</span>
                </div>
              </div>
            </div>

            {/* Grid Utama: Kiri Editor + Toolbar Lengkap (7 kolom), Kanan Multi-Gambar 4+ Slot & Checklist (5 kolom) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* ── KOLOM KIRI: EDITOR TEKS LENGKAP ROLE MODERATOR ── */}
              <div className="lg:col-span-7 space-y-4 bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${entityMeta.color}`}
                  >
                    {form.entityType === 'article' && <BookOpen className="h-3.5 w-3.5" />}
                    {form.entityType === 'event' && <Calendar className="h-3.5 w-3.5" />}
                    {form.entityType === 'product_description' && (
                      <PackageSearch className="h-3.5 w-3.5" />
                    )}
                    {entityMeta.label}
                  </span>
                  <span className="text-xs text-gray-500">
                    ID Arsip: <code className="font-mono font-semibold">{form.id}</code>
                  </span>
                </div>

                {/* Judul */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-gray-700">
                      Judul Konten / Publikasi
                    </label>
                    <span className="text-[11px] text-slate-400">
                      {form.title.length} karakter
                    </span>
                  </div>
                  <input
                    type="text"
                    value={form.title}
                    style={{ fontFamily: activeFontCss }}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm sm:text-base font-bold text-gray-900 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Label Tema / Kategori Publikasi
                    </label>
                    <input
                      type="text"
                      value={form.categoryLabel}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          categoryLabel: e.target.value,
                          category: e.target.value,
                        })
                      }
                      className="w-full rounded-xl border border-gray-300 px-3.5 py-2 text-xs font-medium text-gray-800 focus:border-indigo-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Nama Penulis / Toko / Narasumber
                    </label>
                    <input
                      type="text"
                      value={form.submitterName}
                      onChange={(e) => setForm({ ...form, submitterName: e.target.value })}
                      className="w-full rounded-xl border border-gray-300 px-3.5 py-2 text-xs font-medium text-gray-800 focus:border-indigo-600 focus:outline-none"
                    />
                  </div>
                </div>

                {/* ── TOOLBAR EDITING TEXT LENGKAP UNTUK ROLE MODERATOR ── */}
                <div className="rounded-2xl border border-indigo-200 bg-slate-900 text-white p-3 space-y-2.5 shadow-md">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-700 pb-2">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                      <Type className="h-3.5 w-3.5" />
                      Tool Sunting Naskah Moderator
                    </span>
                    <span className="text-[10px] rounded-md bg-slate-800 border border-slate-700 px-2 py-0.5 text-slate-300">
                      Target aktif:{' '}
                      <strong className="text-emerald-300">
                        {activeTextField === 'excerpt' ? 'Ringkasan' : 'Isi Lengkap Naskah'}
                      </strong>
                    </span>
                  </div>

                  {/* Baris 1: Jenis Font, Ukuran Font, Spasi, Perataan */}
                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      value={fontFamily}
                      onChange={(e) => {
                        const next = e.target.value as 'sans' | 'serif' | 'georgia' | 'mono';
                        setFontFamily(next);
                        syncFormTypography(next, fontSize, textAlign);
                      }}
                      title="Pilih Jenis Font Naskah"
                      className="rounded-lg bg-slate-800 border border-slate-700 px-2.5 py-1.5 text-xs font-semibold text-white focus:border-amber-400 focus:outline-none"
                    >
                      {FONT_FAMILY_OPTIONS.map((f) => (
                        <option key={f.id} value={f.id}>
                          Font: {f.label}
                        </option>
                      ))}
                    </select>

                    <div className="inline-flex items-center rounded-lg bg-slate-800 border border-slate-700 overflow-hidden">
                      <button
                        type="button"
                        onClick={() => {
                          const next = Math.max(11, fontSize - 1);
                          setFontSize(next);
                          syncFormTypography(fontFamily, next, textAlign);
                        }}
                        className="px-2 py-1.5 text-xs font-extrabold hover:bg-slate-700 transition"
                        title="Kecilkan ukuran font"
                      >
                        A-
                      </button>
                      <select
                        value={fontSize}
                        onChange={(e) => {
                          const next = Number(e.target.value);
                          setFontSize(next);
                          syncFormTypography(fontFamily, next, textAlign);
                        }}
                        className="bg-slate-900 px-1.5 py-1 text-xs font-extrabold text-amber-300 focus:outline-none"
                        title="Ukuran font (px)"
                      >
                        {[12, 13, 14, 15, 16, 18, 20, 22, 24].map((sz) => (
                          <option key={sz} value={sz}>
                            {sz}px
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => {
                          const next = Math.min(24, fontSize + 1);
                          setFontSize(next);
                          syncFormTypography(fontFamily, next, textAlign);
                        }}
                        className="px-2 py-1.5 text-xs font-extrabold hover:bg-slate-700 transition"
                        title="Besarkan ukuran font"
                      >
                        A+
                      </button>
                    </div>

                    <select
                      value={lineHeight}
                      onChange={(e) => setLineHeight(Number(e.target.value))}
                      title="Jarak Spasi Baris"
                      className="rounded-lg bg-slate-800 border border-slate-700 px-2 py-1.5 text-xs font-semibold text-white focus:outline-none"
                    >
                      <option value={1.4}>Spasi Rapat (1.4)</option>
                      <option value={1.65}>Spasi Standar (1.65)</option>
                      <option value={1.9}>Spasi Lega (1.9)</option>
                    </select>

                    <div className="inline-flex items-center rounded-lg bg-slate-800 border border-slate-700 p-0.5">
                      {[
                        { id: 'left', icon: AlignLeft, label: 'Rata Kiri' },
                        { id: 'center', icon: AlignCenter, label: 'Rata Tengah' },
                        { id: 'right', icon: AlignRight, label: 'Rata Kanan' },
                        { id: 'justify', icon: AlignJustify, label: 'Rata Kiri-Kanan' },
                      ].map((al) => {
                        const Icon = al.icon;
                        const active = textAlign === al.id;
                        return (
                          <button
                            key={al.id}
                            type="button"
                            onClick={() => {
                              const next = al.id as typeof textAlign;
                              setTextAlign(next);
                              syncFormTypography(fontFamily, fontSize, next);
                            }}
                            className={`rounded-md p-1.5 transition ${
                              active
                                ? 'bg-indigo-600 text-white'
                                : 'text-slate-300 hover:bg-slate-700'
                            }`}
                            title={al.label}
                          >
                            <Icon className="h-3.5 w-3.5" />
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Baris 2: Format Teks & Bantu Sunting */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                    <button
                      type="button"
                      onClick={() => applyTextWrapFormat('**', '**', 'teks tebal')}
                      className="rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 px-2 py-1.5 text-xs font-bold inline-flex items-center gap-1"
                      title="Tebalkan teks terpilih"
                    >
                      <Bold className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => applyTextWrapFormat('*', '*', 'teks miring')}
                      className="rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 px-2 py-1.5 text-xs font-bold inline-flex items-center gap-1"
                      title="Miringkan teks terpilih"
                    >
                      <Italic className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => applyLinePrefixFormat('## ')}
                      className="rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 px-2 py-1.5 text-xs font-bold inline-flex items-center gap-1"
                      title="Tambah Subjudul (H2)"
                    >
                      <Heading2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => applyLinePrefixFormat('- ')}
                      className="rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 px-2 py-1.5 text-xs font-bold inline-flex items-center gap-1"
                      title="Daftar Poin (Bullet)"
                    >
                      <List className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => applyLinePrefixFormat('1. ')}
                      className="rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 px-2 py-1.5 text-xs font-bold inline-flex items-center gap-1"
                      title="Daftar Bernomor"
                    >
                      <ListOrdered className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => applyLinePrefixFormat('> ')}
                      className="rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 px-2 py-1.5 text-xs font-bold inline-flex items-center gap-1"
                      title="Tambah Kutipan"
                    >
                      <Quote className="h-3.5 w-3.5" />
                    </button>

                    <span className="h-4 w-px bg-slate-700 mx-0.5" />

                    <button
                      type="button"
                      onClick={() => applyCaseTransform('sentence')}
                      className="rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 px-2 py-1 text-[11px] font-semibold"
                      title="Rapikan Kapitalisasi Kalimat"
                    >
                      Aa Kalimat
                    </button>
                    <button
                      type="button"
                      onClick={() => applyCaseTransform('title')}
                      className="rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 px-2 py-1 text-[11px] font-semibold"
                      title="Huruf Besar di Awal Kata"
                    >
                      Abc Judul
                    </button>
                    <button
                      type="button"
                      onClick={handleCleanWhitespace}
                      className="rounded-lg bg-emerald-700 hover:bg-emerald-600 px-2.5 py-1 text-[11px] font-bold inline-flex items-center gap-1"
                      title="Hapus spasi ganda dan rapikan paragraf otomatis"
                    >
                      <Wand2 className="h-3 w-3" />
                      Rapikan Spasi
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowFindReplace((v) => !v)}
                      className={`rounded-lg px-2.5 py-1 text-[11px] font-bold inline-flex items-center gap-1 border transition ${
                        showFindReplace
                          ? 'bg-amber-400 text-slate-950 border-amber-300'
                          : 'bg-slate-800 hover:bg-slate-700 text-white border-slate-700'
                      }`}
                      title="Cari dan Ganti Kata Salah Ketik"
                    >
                      <Search className="h-3 w-3" />
                      Cari &amp; Ganti
                    </button>
                    <button
                      type="button"
                      disabled={textHistory.length === 0}
                      onClick={handleUndoText}
                      className="rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 border border-slate-700 px-2 py-1 text-[11px] font-semibold inline-flex items-center gap-1"
                      title="Batalkan suntingan teks terakhir"
                    >
                      <Undo2 className="h-3 w-3" />
                      Undo
                    </button>
                  </div>

                  {showFindReplace && (
                    <div className="flex flex-wrap items-center gap-2 rounded-xl bg-slate-800 border border-slate-700 p-2.5 pt-2">
                      <input
                        type="text"
                        value={findQuery}
                        onChange={(e) => setFindQuery(e.target.value)}
                        placeholder="Cari kata (typo)..."
                        className="flex-1 min-w-[130px] rounded-lg bg-slate-900 border border-slate-700 px-2.5 py-1 text-xs text-white focus:border-amber-400 focus:outline-none"
                      />
                      <input
                        type="text"
                        value={replaceQuery}
                        onChange={(e) => setReplaceQuery(e.target.value)}
                        placeholder="Ganti dengan..."
                        className="flex-1 min-w-[130px] rounded-lg bg-slate-900 border border-slate-700 px-2.5 py-1 text-xs text-white focus:border-emerald-400 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleFindAndReplaceAll}
                        className="inline-flex items-center gap-1 rounded-lg bg-amber-400 hover:bg-amber-300 px-3 py-1 text-xs font-extrabold text-slate-950 transition"
                      >
                        <Replace className="h-3.5 w-3.5" />
                        Ganti Semua
                      </button>
                    </div>
                  )}
                </div>

                {/* KOLOM 1: RINGKASAN / EXCERPT */}
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
                    <label className="block text-xs font-bold text-gray-700">
                      Ringkasan / Deskripsi Tayang (Excerpt)
                    </label>
                    <span className="text-[10px] font-medium text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                      Tinggi: {Math.round(excerptHeight)}px (Selalu &lt; Isi Lengkap) &middot; Font {fontSize}px
                    </span>
                  </div>
                  <div className="relative">
                    <textarea
                      ref={excerptRef}
                      onFocus={() => setActiveTextField('excerpt')}
                      style={{
                        height: `${excerptHeight}px`,
                        fontFamily: activeFontCss,
                        fontSize: `${fontSize}px`,
                        lineHeight,
                        textAlign,
                      }}
                      value={form.excerpt}
                      onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                      placeholder="Ringkasan yang menjelaskan inti tulisan/produk..."
                      className="w-full resize-none overflow-y-auto rounded-t-xl border border-gray-300 px-3.5 py-2.5 text-gray-800 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                    <div
                      onMouseDown={(e) => startResizeField('excerpt', e)}
                      title="Tarik ke atas/bawah untuk menggeser ukuran kolom Ringkasan"
                      className="flex items-center justify-center gap-1.5 h-5 rounded-b-xl border border-t-0 border-gray-300 bg-slate-100 hover:bg-indigo-50 cursor-ns-resize text-[10px] font-semibold text-slate-500 hover:text-indigo-700 transition select-none"
                    >
                      <GripHorizontal className="h-3.5 w-3.5" />
                      <span>Geser batas kolom Ringkasan (Maksimal di bawah Isi Lengkap)</span>
                    </div>
                  </div>
                </div>

                {/* KOLOM 2: ISI LENGKAP NASKAH */}
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
                    <label className="block text-xs font-bold text-gray-700">
                      Isi Lengkap Naskah / Deskripsi Detail
                    </label>
                    <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                      Tinggi: {Math.round(bodyHeight)}px (Utama &gt; Ringkasan) &middot; Font {fontSize}px
                    </span>
                  </div>
                  <div className="relative">
                    <textarea
                      ref={bodyRef}
                      onFocus={() => setActiveTextField('body')}
                      style={{
                        height: `${bodyHeight}px`,
                        fontFamily: activeFontCss,
                        fontSize: `${fontSize}px`,
                        lineHeight,
                        textAlign,
                      }}
                      value={form.body}
                      onChange={(e) => setForm({ ...form, body: e.target.value })}
                      placeholder="Isi lengkap tulisan, detail teknis acara, atau spesifikasi deskripsi produk..."
                      className="w-full resize-none overflow-y-auto rounded-t-xl border border-gray-300 px-3.5 py-2.5 text-gray-800 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                    <div
                      onMouseDown={(e) => startResizeField('body', e)}
                      title="Tarik ke atas/bawah untuk memperluas kolom Isi Lengkap"
                      className="flex items-center justify-center gap-1.5 h-5 rounded-b-xl border border-t-0 border-gray-300 bg-slate-100 hover:bg-emerald-50 cursor-ns-resize text-[10px] font-semibold text-slate-500 hover:text-emerald-700 transition select-none"
                    >
                      <GripHorizontal className="h-3.5 w-3.5" />
                      <span>Geser batas kolom Isi Lengkap untuk melihat seluruh deskripsi panjang</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── KOLOM KANAN: GALERI SEMUA GAMBAR (4+ GAMBAR), PREVIEW & CHECKLIST ── */}
              <div className="lg:col-span-5 space-y-4">
                <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <label className="block text-xs font-extrabold text-slate-900">
                        Pemeriksaan Seluruh Gambar ({galleryImages.length} Lampiran)
                      </label>
                      <p className="text-[11px] text-slate-500">
                        Klik <strong>Preview</strong> untuk periksa detail tiap gambar, lalu <strong>Pilih Publik</strong> sesuai tema.
                      </p>
                    </div>
                    <span className="rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-extrabold">
                      Tema: {form.categoryLabel}
                    </span>
                  </div>

                  {/* Grid Galeri Semua Gambar (4+ Gambar) */}
                  <div className="grid grid-cols-2 gap-2.5">
                    {galleryImages.map((imgUrl, idx) => {
                      const isSelectedMain = form.image === imgUrl;
                      return (
                        <div
                          key={`${idx}-${imgUrl.slice(0, 32)}`}
                          className={`group rounded-xl border-2 bg-white overflow-hidden transition shadow-sm ${
                            isSelectedMain
                              ? 'border-emerald-500 ring-2 ring-emerald-400/40'
                              : 'border-slate-200 hover:border-indigo-300'
                          }`}
                        >
                          <div className="aspect-[16/10] bg-slate-200 relative overflow-hidden">
                            <img
                              src={imgUrl || FALLBACK_IMAGE}
                              alt={`Lampiran gambar ${idx + 1}`}
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE;
                              }}
                              className="h-full w-full object-cover"
                            />
                            <span className="absolute top-1.5 left-1.5 rounded-md bg-slate-950/80 px-2 py-0.5 text-[10px] font-bold text-white">
                              #{idx + 1}
                            </span>
                            {isSelectedMain && (
                              <span className="absolute top-1.5 right-1.5 rounded-full bg-emerald-600 px-2 py-0.5 text-[9px] font-extrabold text-white shadow">
                                ✓ Utama Publikasi
                              </span>
                            )}
                            {galleryImages.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveGalleryImage(idx)}
                                title="Hapus gambar ini dari daftar"
                                className="absolute bottom-1.5 right-1.5 rounded-md bg-rose-600/90 hover:bg-rose-700 p-1 text-white opacity-0 group-hover:opacity-100 transition"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            )}
                          </div>

                          <div className="p-2 flex items-center gap-1.5 bg-white">
                            <button
                              type="button"
                              onClick={() => {
                                setPreviewImageIndex(idx);
                                setPreviewZoom(100);
                              }}
                              className="flex-1 inline-flex items-center justify-center gap-1 rounded-lg border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 py-1 text-[10px] font-bold text-indigo-800 transition"
                            >
                              <Eye className="h-3 w-3" />
                              Preview
                            </button>
                            <button
                              type="button"
                              onClick={() => selectImageForPublish(imgUrl)}
                              className={`flex-1 inline-flex items-center justify-center gap-1 rounded-lg py-1 text-[10px] font-extrabold transition ${
                                isSelectedMain
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-slate-900 hover:bg-emerald-600 text-white'
                              }`}
                            >
                              <CheckCircle2 className="h-3 w-3" />
                              {isSelectedMain ? 'Dipilih' : 'Pilih Publik'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Tambah Gambar Baru (Via URL atau Upload File Lokal) */}
                  <div className="rounded-xl border border-dashed border-indigo-300 bg-indigo-50/30 p-3 space-y-2">
                    <span className="text-[11px] font-extrabold text-indigo-950 flex items-center gap-1.5">
                      <ImagePlus className="h-3.5 w-3.5 text-indigo-600" />
                      Tambah Gambar Lagi (URL atau Upload File Gambar)
                    </span>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        value={newImageUrlInput}
                        onChange={(e) => setNewImageUrlInput(e.target.value)}
                        placeholder="Tempel URL gambar (https://...)"
                        className="flex-1 min-w-0 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs focus:border-indigo-500 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleAddImageUrl}
                        className="rounded-lg bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 text-xs font-bold text-white shrink-0 transition"
                      >
                        + Tambah
                      </button>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-1">
                      <input
                        ref={fileUploadInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleUploadLocalImages}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileUploadInputRef.current?.click()}
                        className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 py-1.5 text-[11px] font-bold text-slate-700 transition"
                      >
                        <Upload className="h-3.5 w-3.5 text-indigo-600" />
                        Unggah File Gambar Tambahan dari Perangkat
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Gambar Sampul Utama Terpilih untuk Publikasi:
                    </label>
                    <input
                      type="text"
                      value={form.image}
                      title={form.image}
                      onChange={(e) => setForm({ ...form, image: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-[11px] font-mono text-gray-700 overflow-x-auto focus:border-indigo-600 focus:outline-none"
                    />
                  </div>
                </div>

                {canPublishHomepage ? (
                  <div className="rounded-2xl border-2 border-indigo-200 bg-indigo-50/40 p-4 space-y-3 shadow-sm">
                    <p className="text-xs font-extrabold uppercase tracking-wider text-indigo-950 flex items-center gap-1.5">
                      <ShieldCheck className="h-4 w-4 text-indigo-700" />
                      Keputusan Analisis Moderator
                    </p>

                    <label className="flex items-start gap-2.5 cursor-pointer rounded-xl border border-indigo-100 bg-white p-3 hover:border-indigo-300 transition">
                      <input
                        type="checkbox"
                        checked={form.writingVerified}
                        onChange={(e) => {
                          setForm({ ...form, writingVerified: e.target.checked });
                          setValidationError(null);
                        }}
                        className="mt-0.5 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <div className="text-xs">
                        <p className="font-bold text-gray-900">
                          Analisis Penulisan Benar &amp; Sesuai Skema
                        </p>
                        <p className="text-[11px] text-gray-500 mt-0.5">
                          Naskah telah dibaca dan disunting Moderator, ejaan rapi, dan mematuhi skema penulisan publik.
                        </p>
                      </div>
                    </label>

                    <label className="flex items-start gap-2.5 cursor-pointer rounded-xl border border-indigo-100 bg-white p-3 hover:border-indigo-300 transition">
                      <input
                        type="checkbox"
                        checked={form.imageThemeVerified}
                        onChange={(e) => {
                          setForm({ ...form, imageThemeVerified: e.target.checked });
                          setValidationError(null);
                        }}
                        className="mt-0.5 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <div className="text-xs">
                        <p className="font-bold text-gray-900">
                          Gambar Terpilih Sesuai Tema Konten
                        </p>
                        <p className="text-[11px] text-gray-500 mt-0.5">
                          Dari {galleryImages.length} gambar yang ditinjau, sampul terpilih telah selaras dengan tema &quot;{form.categoryLabel}&quot;.
                        </p>
                      </div>
                    </label>

                    {form.entityType === 'article' && (
                      <label className="flex items-center gap-2.5 cursor-pointer rounded-xl border border-emerald-200 bg-emerald-50/70 p-2.5 text-xs">
                        <input
                          type="checkbox"
                          checked={Boolean(form.isFeatured)}
                          onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                          className="h-4 w-4 rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className="font-bold text-emerald-900">
                          Jadikan Sorotan Utama (Headline Banner) di Homepage
                        </span>
                      </label>
                    )}

                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">
                        Catatan Kurasi Moderator
                      </label>
                      <textarea
                        rows={2}
                        value={form.moderatorNotes ?? ''}
                        onChange={(e) => setForm({ ...form, moderatorNotes: e.target.value })}
                        placeholder="Tulis catatan hasil analisis penulisan atau instruksi revisi..."
                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs overflow-y-auto"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 space-y-2 text-xs text-emerald-950">
                    <p className="font-extrabold uppercase tracking-wider flex items-center gap-1.5 text-emerald-800">
                      <Send className="h-4 w-4" />
                      Alur Pengajuan ke Dashboard Moderator
                    </p>
                    <p className="leading-relaxed">
                      Setelah Anda menekan tombol{' '}
                      <strong>&quot;Simpan Editan &amp; Ajukan ke Dashboard Moderator&quot;</strong>, seluruh perubahan naskah dan {galleryImages.length} gambar masuk ke antrean Moderator sebelum tayang ke Homepage.
                    </p>
                  </div>
                )}

                {validationError && (
                  <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700 flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
                    <span>{validationError}</span>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── LIGHTBOX PREVIEW BESAR TIAP GAMBAR + PILIH JADI GAMBAR PUBLIKASI ── */}
      {previewedUrl && previewImageIndex !== null && (
        <div
          className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-sm"
          onClick={() => setPreviewImageIndex(null)}
        >
          <div
            className="w-full max-w-4xl rounded-2xl border border-indigo-300/60 bg-slate-900 text-white shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-700 bg-slate-950 px-5 py-3.5">
              <div className="flex items-center gap-2.5">
                <span className="rounded-lg bg-indigo-600 px-2.5 py-1 text-xs font-extrabold">
                  Gambar #{previewImageIndex + 1} dari {galleryImages.length}
                </span>
                <span className="text-xs text-slate-300 truncate max-w-[260px] sm:max-w-md">
                  {form.title} — Tema: {form.categoryLabel}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="inline-flex items-center gap-1 rounded-lg bg-slate-800 border border-slate-700 p-1">
                  <button
                    type="button"
                    onClick={() => setPreviewZoom((z) => Math.max(75, z - 15))}
                    className="p-1 text-slate-300 hover:text-white"
                    title="Perkecil"
                  >
                    <ZoomOut className="h-4 w-4" />
                  </button>
                  <span className="px-1.5 text-xs font-bold">{previewZoom}%</span>
                  <button
                    type="button"
                    onClick={() => setPreviewZoom((z) => Math.min(160, z + 15))}
                    className="p-1 text-slate-300 hover:text-white"
                    title="Perbesar"
                  >
                    <ZoomIn className="h-4 w-4" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setPreviewImageIndex(null)}
                  className="inline-flex items-center gap-1 rounded-lg bg-rose-600 hover:bg-rose-700 px-3 py-1.5 text-xs font-bold text-white"
                >
                  <X className="h-4 w-4" />
                  Tutup Preview
                </button>
              </div>
            </div>

            <div className="relative flex items-center justify-center bg-slate-950 p-4 min-h-[340px] max-h-[62vh] overflow-auto">
              <button
                type="button"
                onClick={() =>
                  setPreviewImageIndex((idx) =>
                    idx === null
                      ? 0
                      : (idx - 1 + galleryImages.length) % galleryImages.length,
                  )
                }
                className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-slate-900/80 border border-slate-600 p-2 text-white hover:bg-indigo-600 transition z-10"
                title="Gambar Sebelumnya"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <img
                src={previewedUrl}
                alt={`Preview gambar ${previewImageIndex + 1}`}
                style={{
                  transform: `scale(${previewZoom / 100})`,
                  transformOrigin: 'center center',
                }}
                className="max-h-[54vh] w-auto object-contain rounded-xl transition-transform duration-150"
              />

              <button
                type="button"
                onClick={() =>
                  setPreviewImageIndex((idx) =>
                    idx === null ? 0 : (idx + 1) % galleryImages.length,
                  )
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-slate-900/80 border border-slate-600 p-2 text-white hover:bg-indigo-600 transition z-10"
                title="Gambar Berikutnya"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            <div className="border-t border-slate-800 bg-slate-900 px-5 py-3.5 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 overflow-x-auto">
                {galleryImages.map((thumb, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setPreviewImageIndex(i)}
                    className={`h-11 w-14 rounded-lg overflow-hidden border-2 shrink-0 transition ${
                      i === previewImageIndex
                        ? 'border-amber-400 scale-105'
                        : 'border-slate-700 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={thumb} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => {
                  selectImageForPublish(previewedUrl);
                  setPreviewImageIndex(null);
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 px-4 py-2 text-xs font-extrabold text-white shadow-lg transition"
              >
                <CheckCircle2 className="h-4 w-4" />
                Pilih Gambar #{previewImageIndex + 1} untuk Publikasi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── FOOTER TOMBOL AKSI ── */}
      <div className="border-t border-gray-200 bg-white px-6 py-3.5 shrink-0">
        <div className={`flex flex-wrap items-center justify-between gap-3 ${isFullPage ? 'max-w-[1440px] mx-auto' : ''}`}>
          {canPublishHomepage ? (
            <>
              <div className="flex flex-wrap items-center gap-2">
                {isFullPage && (
                  <Link
                    href={backHref}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-slate-100 hover:bg-slate-200 px-4 py-2 text-xs font-extrabold text-slate-800 transition"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Kembali ke Dashboard Moderator
                  </Link>
                )}
                <button
                  type="button"
                  onClick={handleRequestRevision}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 transition"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Minta Revisi Penulisan / Gambar
                </button>
                <button
                  type="button"
                  onClick={handleEscalateToAdmin}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-rose-600 bg-rose-600 px-3.5 py-2 text-xs font-extrabold text-white shadow-sm hover:bg-rose-700 transition"
                  title="Kirim laporan pelanggaran hukum/izin edar ke Role Admin untuk Hold Payout atau Suspend akun"
                >
                  <ShieldAlert className="h-3.5 w-3.5" />
                  Eskalasi Pelanggaran ke Role Admin
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab(activeTab === 'preview' ? 'edit' : 'preview')}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 px-3.5 py-2 text-xs font-bold text-indigo-700 hover:bg-indigo-100 transition"
                >
                  <Eye className="h-3.5 w-3.5" />
                  {activeTab === 'preview' ? 'Kembali Edit' : 'Mode Preview'}
                </button>
                <button
                  type="button"
                  onClick={handleSaveArchiveOnly}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-gray-300 bg-white px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-100 transition"
                >
                  Simpan di Arsip (Tanpa Tampil di Homepage)
                </button>
                <button
                  type="button"
                  onClick={handlePublishToHomepage}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700 transition"
                >
                  <Globe className="h-4 w-4" />
                  Simpan Editan &amp; Publikasikan ke Homepage
                </button>
              </div>
            </>
          ) : (
            <>
              <span className="text-xs text-gray-500">
                Hak tayang Homepage dikelola penuh oleh <strong>Role Moderator</strong>.
              </span>
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setActiveTab(activeTab === 'preview' ? 'edit' : 'preview')}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 px-3.5 py-2 text-xs font-bold text-indigo-700 hover:bg-indigo-100 transition"
                >
                  <Eye className="h-3.5 w-3.5" />
                  {activeTab === 'preview' ? 'Kembali Edit' : 'Mode Preview'}
                </button>
                {onClose && (
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-100 transition"
                  >
                    Batal
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleSubmitEditToModerator}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700 transition"
                >
                  <Send className="h-4 w-4" />
                  Simpan Editan &amp; Ajukan ke Dashboard Moderator
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

