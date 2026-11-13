'use client';

import React, { useEffect, useState } from 'react';
import {
  ExternalLink,
  FileCheck2,
  Maximize2,
  Minimize2,
  Move,
  X,
} from 'lucide-react';
import { EditorialArchiveItem } from '@/lib/editorial-archive';
import { EditorialReviewWorkspace } from '@/components/moderation/EditorialReviewWorkspace';

interface EditorialReviewModalProps {
  item: EditorialArchiveItem;
  allArchiveItems?: EditorialArchiveItem[];
  canPublishHomepage?: boolean;
  onClose: () => void;
  onSave: (updated: EditorialArchiveItem) => void;
}

const ROLE_LABELS: Record<string, string> = {
  author: 'Penulis (Naungan Moderator)',
  member: 'Member / Kontributor',
  seller: 'Mitra Seller',
  distributor: 'Mitra Distributor',
  service_provider: 'Penyedia Jasa',
};

type ResizeDirection = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';

export function EditorialReviewModal({
  item,
  allArchiveItems = [],
  canPublishHomepage = true,
  onClose,
  onSave,
}: EditorialReviewModalProps) {
  const [activeItem, setActiveItem] = useState<EditorialArchiveItem>(item);
  const [isMaximized, setIsMaximized] = useState(false);
  const [modalRect, setModalRect] = useState({
    x: 0,
    y: 0,
    width: 1080,
    height: 820,
  });

  useEffect(() => {
    setActiveItem(item);
  }, [item]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    setModalRect({
      x: 0,
      y: 0,
      width: Math.min(1140, Math.max(360, vw - 24)),
      height: Math.min(860, Math.max(480, vh - 32)),
    });
  }, []);

  function startDragModal(e: React.MouseEvent) {
    if (isMaximized) return;
    if ((e.target as HTMLElement).closest('button, a')) return;
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    const initX = modalRect.x;
    const initY = modalRect.y;

    function onMouseMove(ev: MouseEvent) {
      setModalRect((prev) => ({
        ...prev,
        x: initX + (ev.clientX - startX),
        y: initY + (ev.clientY - startY),
      }));
    }

    function onMouseUp() {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    }

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }

  function startResizeModal(dir: ResizeDirection, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (isMaximized) setIsMaximized(false);

    const startX = e.clientX;
    const startY = e.clientY;
    const startRect = { ...modalRect };
    const minW = 540;
    const minH = 480;
    const maxW = typeof window !== 'undefined' ? window.innerWidth - 16 : 1600;
    const maxH = typeof window !== 'undefined' ? window.innerHeight - 16 : 1200;

    function onMouseMove(ev: MouseEvent) {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;

      let newW = startRect.width;
      let newH = startRect.height;
      let newX = startRect.x;
      let newY = startRect.y;

      if (dir.includes('e')) {
        newW = Math.min(maxW, Math.max(minW, startRect.width + dx));
        newX = startRect.x + (newW - startRect.width) / 2;
      }
      if (dir.includes('w')) {
        newW = Math.min(maxW, Math.max(minW, startRect.width - dx));
        newX = startRect.x - (newW - startRect.width) / 2;
      }
      if (dir.includes('s')) {
        newH = Math.min(maxH, Math.max(minH, startRect.height + dy));
        newY = startRect.y + (newH - startRect.height) / 2;
      }
      if (dir.includes('n')) {
        newH = Math.min(maxH, Math.max(minH, startRect.height - dy));
        newY = startRect.y - (newH - startRect.height) / 2;
      }

      setModalRect({ x: newX, y: newY, width: newW, height: newH });
    }

    function onMouseUp() {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    }

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/65 p-2 sm:p-4 backdrop-blur-sm overflow-hidden"
      onClick={onClose}
    >
      <div
        style={
          isMaximized
            ? { width: '98vw', height: '96vh', transform: 'translate(0px, 0px)' }
            : {
                width: `${modalRect.width}px`,
                height: `${modalRect.height}px`,
                maxWidth: '98vw',
                maxHeight: '96vh',
                transform: `translate(${modalRect.x}px, ${modalRect.y}px)`,
              }
        }
        className="relative rounded-2xl border-2 border-indigo-200 bg-white shadow-2xl flex flex-col select-none overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {!isMaximized && (
          <>
            <div
              onMouseDown={(e) => startResizeModal('n', e)}
              className="absolute -top-1.5 left-4 right-4 h-3 cursor-ns-resize z-30"
            />
            <div
              onMouseDown={(e) => startResizeModal('s', e)}
              className="absolute -bottom-1.5 left-4 right-4 h-3 cursor-ns-resize z-30"
            />
            <div
              onMouseDown={(e) => startResizeModal('w', e)}
              className="absolute top-4 bottom-4 -left-1.5 w-3 cursor-ew-resize z-30"
            />
            <div
              onMouseDown={(e) => startResizeModal('e', e)}
              className="absolute top-4 bottom-4 -right-1.5 w-3 cursor-ew-resize z-30"
            />
            <div
              onMouseDown={(e) => startResizeModal('se', e)}
              className="absolute -bottom-2 -right-2 w-5 h-5 cursor-nwse-resize z-40"
            />
          </>
        )}

        {/* Header Modal */}
        <div
          onMouseDown={startDragModal}
          className={`flex items-center justify-between gap-3 px-5 py-3.5 text-white shrink-0 ${
            isMaximized ? 'cursor-default' : 'cursor-move'
          } ${
            canPublishHomepage
              ? 'bg-gradient-to-r from-indigo-800 via-indigo-700 to-teal-700'
              : 'bg-gradient-to-r from-emerald-800 via-teal-700 to-slate-800'
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/20">
              <FileCheck2 className="h-5 w-5 text-white" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider">
                  {canPublishHomepage
                    ? 'Otoritas Penuh Moderator Editorial'
                    : 'Mode Edit Kontributor — Diajukan ke Moderator'}
                </span>
                <span className="text-xs text-indigo-100">
                  Pengaju: <strong>{activeItem.submitterName}</strong> (
                  {ROLE_LABELS[activeItem.sourceRole] ?? activeItem.sourceRole})
                </span>
                <span className="hidden md:inline-flex items-center gap-1 rounded-md bg-black/20 px-2 py-0.5 text-[10px] text-white/90">
                  <Move className="h-3 w-3" />
                  Geser &amp; Perbesar Jendela
                </span>
              </div>
              <h3 className="truncate text-sm sm:text-base font-bold mt-0.5">
                {canPublishHomepage
                  ? 'Baca, Sunting Tipografi Naskah, Tinjau 4+ Gambar & Publikasi Homepage'
                  : 'Edit Naskah & Ajukan ke Dashboard Moderator'}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {canPublishHomepage && (
              <a
                href={`/admin/moderation/review/${encodeURIComponent(activeItem.id)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-lg bg-amber-400 hover:bg-amber-300 px-3 py-1.5 text-[11px] font-extrabold text-slate-950 shadow transition"
                title="Buka tampilan penuh di Tab Baru browser untuk menyunting lebih leluasa"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Buka Tab Baru
              </a>
            )}
            <button
              type="button"
              onClick={() => setIsMaximized((v) => !v)}
              className="rounded-lg p-1.5 text-white/85 hover:bg-white/15 hover:text-white transition"
              title={isMaximized ? 'Kembalikan Ukuran Jendela' : 'Perbesar Layar Penuh'}
            >
              {isMaximized ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-white/85 hover:bg-white/15 hover:text-white transition"
              aria-label="Tutup"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <EditorialReviewWorkspace
          item={activeItem}
          allArchiveItems={allArchiveItems}
          canPublishHomepage={canPublishHomepage}
          isFullPage={false}
          onClose={onClose}
          onSave={onSave}
          onSelectArchiveItem={(target) => setActiveItem(target)}
        />
      </div>
    </div>
  );
}
