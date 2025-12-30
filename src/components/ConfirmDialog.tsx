import React from "react"

interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  message: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({ isOpen, title, message, onConfirm, onCancel }: ConfirmDialogProps) {
  if (!isOpen) return null

  return (
    <div style={styles.overlay} onClick={onCancel}>
      <div style={styles.dialog} onClick={(e) => e.stopPropagation()}>
        <div style={styles.iconContainer}>
          <div style={styles.warningIcon}>⚠️</div>
        </div>
        <h3 style={styles.title}>{title}</h3>
        <p style={styles.message}>{message}</p>
        <div style={styles.buttonRow}>
          <button style={styles.cancelBtn} onClick={onCancel}>
            Cancel
          </button>
          <button style={styles.confirmBtn} onClick={onConfirm}>
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    backdropFilter: "blur(8px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10000,
    animation: "fadeIn 0.2s ease-out",
  },
  dialog: {
    background: "#fff",
    borderRadius: 24,
    padding: "32px 28px 28px",
    maxWidth: 440,
    width: "90%",
    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
    textAlign: "center",
    animation: "slideUp 0.25s ease-out",
  },
  iconContainer: {
    marginBottom: 16,
    display: "flex",
    justifyContent: "center",
  },
  warningIcon: {
    fontSize: 56,
    lineHeight: 1,
  },
  title: {
    margin: 0,
    marginBottom: 12,
    fontSize: 24,
    fontWeight: 700,
    color: "#111",
  },
  message: {
    margin: 0,
    marginBottom: 28,
    fontSize: 16,
    color: "#666",
    lineHeight: 1.5,
  },
  buttonRow: {
    display: "flex",
    gap: 12,
    justifyContent: "center",
  },
  cancelBtn: {
    padding: "14px 32px",
    borderRadius: 14,
    border: "2px solid #ddd",
    background: "#fff",
    color: "#333",
    fontSize: 16,
    fontWeight: 600,
    cursor: "pointer",
    minWidth: 130,
    transition: "all 0.2s ease",
  },
  confirmBtn: {
    padding: "14px 32px",
    borderRadius: 14,
    border: "none",
    background: "#dc2626",
    color: "#fff",
    fontSize: 16,
    fontWeight: 600,
    cursor: "pointer",
    minWidth: 130,
    transition: "all 0.2s ease",
    boxShadow: "0 4px 12px rgba(220, 38, 38, 0.3)",
  },
}