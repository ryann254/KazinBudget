import type { ReactNode } from "react";

type ValidatedFieldProps = {
  label: string;
  error?: string;
  shake?: boolean;
  children: ReactNode;
};

export function ValidatedField({
  label,
  error,
  shake,
  children,
}: ValidatedFieldProps) {
  return (
    <div className={shake ? "animate-shake" : undefined}>
      <label
        className="block text-xs font-extrabold uppercase mb-2"
        style={{
          fontFamily: "'Work Sans', sans-serif",
          letterSpacing: "0.15em",
        }}
      >
        {label}
      </label>
      {children}
      {error ? (
        <p
          role="alert"
          className="mt-1 text-xs font-bold"
          style={{
            color: "#E63946",
            fontFamily: "'Work Sans', sans-serif",
            letterSpacing: "0.02em",
          }}
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}
