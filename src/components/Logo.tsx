import Image from "next/image";

export function Logo({ size = 32 }: { size?: number }) {
  return (
    <Image
      src="/logo.png"
      alt="VoyageAI logo"
      width={size}
      height={size}
      className="rounded-lg"
      style={{ width: size, height: size }}
      priority
    />
  );
}
