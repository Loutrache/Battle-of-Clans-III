"use client";

type ConfirmModalProps = {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmModal({
  isOpen,
  title,
  message,
  confirmLabel = "Confirmer",
  cancelLabel = "Annuler",
  danger = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4">
      <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#0E2028] p-8 shadow-2xl">
        <p className="font-cinzel text-sm uppercase tracking-[0.3em] text-[#6163FC]">
          Confirmation
        </p>

        <h2 className="font-cormorant mt-4 text-4xl text-white">{title}</h2>

        <p className="font-cormorant mt-4 text-xl leading-relaxed text-white/80">
          {message}
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <button
            onClick={onCancel}
            className="font-cormorant rounded-full border border-white/20 px-6 py-2 text-lg font-semibold text-white transition hover:bg-white/10"
          >
            {cancelLabel}
          </button>

          <button
            onClick={onConfirm}
            className={`font-cormorant rounded-full px-6 py-2 text-lg font-semibold text-white transition ${
              danger
                ? "bg-red-500 hover:bg-red-400"
                : "bg-[#6163FC] hover:bg-[#7B7DFF]"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}