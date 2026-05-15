export default function Card({
  as: Component = "section",
  children,
  className = "",
}) {
  return (
    <Component className={`rounded-2xl bg-white shadow-sm ${className}`}>
      {children}
    </Component>
  );
}
