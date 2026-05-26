import "./Button.css";

export default function Button({
  children,
  variant = "primary",
  size = "md",
  icon: Icon,
  className = "",
  ...props
}) {
  return (
    <button
      className={`btn btn-${variant} btn-${size} ${className}`}
      {...props}
    >
      {Icon && <Icon size={16} />}
      {children}
    </button>
  );
}
