import { BlackBorderCertificate } from "@/components/certificate/BlackBorderCertificate";
import type { CertificateData } from "@/types/certificate";

const EMPTY_DATA: CertificateData = {
  recipientName: "",
  courseTitle: "",
  organizationName: "",
  date: "",
  instructorName: "",
};

function parseCertificateData(raw: string | undefined): CertificateData {
  if (!raw) return EMPTY_DATA;
  return JSON.parse(raw) as CertificateData;
}

export default async function CertificatePrintPage({
  searchParams,
}: {
  searchParams: Promise<{ data?: string }>;
}) {
  const { data } = await searchParams;
  const certificateData = parseCertificateData(data);

  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div data-certificate-export className="w-[1400px]">
        <BlackBorderCertificate data={certificateData} />
      </div>
    </div>
  );
}
