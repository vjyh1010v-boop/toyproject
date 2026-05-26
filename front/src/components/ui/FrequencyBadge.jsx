import "./FrequencyBadge.css";

export default function FrequencyBadge({ level = "low", children }) {
  return <span className={`frequency-badge ${level}`}>{children}</span>;
}
