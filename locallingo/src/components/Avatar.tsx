export function Avatar({ name, url, size = 56 }: { name: string; url?: string | null; size?: number }) {
  const initials = name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
  if (url) return <img className="avatar" src={url} alt={name} width={size} height={size} style={{ width: size, height: size }} />;
  return (
    <div className="avatar" style={{ width: size, height: size, fontSize: size / 2.6 }} aria-hidden>
      {initials}
    </div>
  );
}
