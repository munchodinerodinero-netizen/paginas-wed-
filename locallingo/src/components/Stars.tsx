export function Stars({ value }: { value: number }) {
  const full = Math.round(value);
  return (
    <span className="stars" aria-label={`${value}/5`}>
      {"★".repeat(full)}
      <span style={{ color: "#d0d5dd" }}>{"★".repeat(5 - full)}</span>
    </span>
  );
}
