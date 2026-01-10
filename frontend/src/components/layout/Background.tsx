interface BackgroundProps {
  image: string;
}

export function Background({ image }: BackgroundProps) {
  return (
    <>
      <div className="fixed inset-0 -z-10 bg-black">
        <img
          src={image}
          alt="background"
          className="w-full h-full object-cover opacity-30 grayscale contrast-125"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
      </div>
      <div className="noise-overlay" />
    </>
  );
}