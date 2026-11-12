"use client";

// A submit button that asks "Are you sure?" first (for deleting).
export function ConfirmButton({ name, value, label, question, className }: { name: string; value: string; label: string; question: string; className: string }) {
  return (
    <button type="submit" name={name} value={value} className={className}
      onClick={(e) => { if (!window.confirm(question)) e.preventDefault(); }}>
      {label}
    </button>
  );
}
