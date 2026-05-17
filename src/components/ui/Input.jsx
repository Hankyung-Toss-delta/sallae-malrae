export default function Input({
  type = "text",
  id,
  name,
  label,
  hint,
  error,
  placeholder = "",
  containerClassName = "",
  className = "",
  ...props
}) {
  const inputId = id ?? name;
  const describedBy = error
    ? `${inputId ?? "input"}-error`
    : hint
      ? `${inputId ?? "input"}-hint`
      : undefined;

  return (
    <div className={`flex w-full flex-col gap-2 ${containerClassName}`}>
      {label && (
        <label htmlFor={inputId} className="text-sm font-semibold text-black">
          {label}
        </label>
      )}

      <input
        id={inputId}
        name={name}
        type={type}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        className={`
          w-full rounded-xl border px-5 py-3 text-sm outline-none transition-colors
          placeholder:text-gray-400
          ${
            error
              ? "border-[#D96C6C] focus:border-[#D96C6C]"
              : "border-gray-300 focus:border-[#8EAA92]"
          }
          ${className}
        `}
        {...props}
      />

      {hint && !error && (
        <p id={`${inputId ?? "input"}-hint`} className="text-xs text-gray-500">
          {hint}
        </p>
      )}

      {error && (
        <p id={`${inputId ?? "input"}-error`} className="text-xs text-[#D96C6C]">
          {error}
        </p>
      )}
    </div>
  );
}
