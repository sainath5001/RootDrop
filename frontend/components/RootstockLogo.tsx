import Image from 'next/image';

type RootstockLogoProps = {
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
};

export function RootstockLogo({
  className = 'w-9 h-9 object-contain',
  width = 36,
  height = 36,
  priority = false,
}: RootstockLogoProps) {
  return (
    <Image
      src="/rootstock-logo.png"
      alt="Rootstock"
      width={width}
      height={height}
      className={className}
      priority={priority}
    />
  );
}
