import Image from "next/image";

export default function LogoMarquee() {
  const logos = [
    { src: "/logos/next.svg", alt: "Next.js", fit: "contain" },
    { src: "/logos/tailwindcss.svg", alt: "Tailwind CSS", fit: "cover" },
    { src: "/logos/typescripts.svg", alt: "TypeScript", fit: "cover" },
    { src: "/logos/vercel.svg", alt: "Vercel", fit: "contain" },
    { src: "/logos/fastapi.svg", alt: "FastAPI", fit: "contain" },
  ];

  return (
    <div className="flex flex-col items-center justify-center space-y-4 overflow-hidden bg-black lg:pb-24">
      <span className="text-white">Made with</span>
      <div className="flex flex-wrap justify-center items-center gap-8 p-4">
        {logos.map((logo) => (
          <div key={logo.alt} className="w-20 h-8 md:w-32 md:h-12 relative">
            <Image
              src={logo.src || "/placeholder.svg"}
              alt={logo.alt}
              fill
              style={{ objectFit: logo.fit }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}