import Image from 'next/image';

export default function Loading() {
  return (
    <div className="fixed inset-0 z-9999 grid place-items-center bg-white">
      <Image
        src="/images/Prime.gif"
        alt="Loading"
        width={140}
        height={140}
        priority
        unoptimized
      />
    </div>
  );
}

