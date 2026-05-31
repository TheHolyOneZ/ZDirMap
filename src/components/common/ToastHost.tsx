import { AnimatePresence, motion } from "motion/react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { useStore } from "../../store";

export default function ToastHost() {
  const toasts = useStore((s) => s.toasts);
  const remove = useStore((s) => s.removeToast);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => {
          const Icon =
            t.type === "success" ? CheckCircle2 :
            t.type === "error" || t.type === "warning" ? AlertCircle :
            Info;
          const accent =
            t.type === "success" ? "var(--color-success)" :
            t.type === "error" ? "var(--color-error)" :
            t.type === "warning" ? "var(--color-warning)" :
            "var(--color-accent-3)";
          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 10, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.96 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              className="glass pointer-events-auto flex items-center gap-2.5 pl-3 pr-2 py-2 min-w-[240px] max-w-[360px]"
              style={{ borderLeft: `2px solid ${accent}` }}
            >
              <Icon size={14} style={{ color: accent }} />
              <span className="text-[12px] flex-1" style={{ color: "var(--color-text)" }}>{t.message}</span>
              <button
                onClick={() => remove(t.id)}
                className="w-5 h-5 rounded-md flex items-center justify-center cursor-default"
                style={{ color: "var(--color-text-subtle)" }}
              >
                <X size={11} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
