import { CertificateBuilder } from "@/components/certificate/CertificateBuilder";

export default function Home() {
  return (
    <main className="min-h-screen bg-bg p-8">
      <div className="mx-auto w-full max-w-5xl">
        <CertificateBuilder />
      </div>
    </main>
  );
}
