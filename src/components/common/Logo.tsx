import iconUrl from "../../assets/icon.png";

export default function Logo({ size = 18 }: { size?: number }) {
  return (
    <img
      src={iconUrl}
      width={size}
      height={size}
      alt="ZDirMap"
      style={{ display: "block", borderRadius: Math.round(size * 0.22) }}
      draggable={false}
    />
  );
}
