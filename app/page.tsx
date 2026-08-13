import { BlackBorderCertificate } from "@/components/certificate/BlackBorderCertificate";
import type { CertificateData } from "@/types/certificate";

const placeholderData: CertificateData = {
  recipientName: "Ava Thompson",
  courseTitle: "Advanced React Patterns",
  date: "March 14, 2026",
  instructorName: "Brad Traversy",
};

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-bg p-8">
      <div className="w-full max-w-3xl">
        <BlackBorderCertificate data={placeholderData} />
      </div>
    </main>
  );
}
