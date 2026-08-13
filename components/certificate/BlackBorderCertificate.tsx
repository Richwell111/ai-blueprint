import type { CertificateData } from "@/types/certificate";

export function BlackBorderCertificate({ data }: { data: CertificateData }) {
  const { recipientName, courseTitle, date, instructorName, logoUrl } = data;

  return (
    <div className="aspect-[1.414/1] w-full bg-cert-bg p-7 shadow-2xl shadow-black/40">
      <div className="relative h-full rounded-3xl border-[3px] border-cert-border p-1.5">
        <div className="pointer-events-none absolute inset-2 rounded-2xl border border-cert-border-inner" />
        <CornerFlourish className="top-1.5 left-1.5" />
        <CornerFlourish className="top-1.5 right-1.5 -scale-x-100" />
        <CornerFlourish className="bottom-1.5 left-1.5 -scale-y-100" />
        <CornerFlourish className="bottom-1.5 right-1.5 -scale-x-100 -scale-y-100" />
        <div className="relative flex h-full flex-col items-center justify-center gap-4 px-10 text-center font-sans text-cert-ink">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Certificate</h1>
            <p className="text-lg text-cert-ink-muted">of Completion</p>
          </div>

          <p className="text-xs font-semibold tracking-[0.2em] text-cert-ink-muted uppercase">
            This is to certify that
          </p>

          <h2 className="border-b border-cert-border-inner px-6 pb-2 text-2xl font-bold tracking-wide uppercase">
            {recipientName}
          </h2>

          <p className="max-w-md text-sm text-cert-ink-muted">
            Has successfully completed the course:
            <br />
            <span className="font-semibold text-cert-ink">{courseTitle}</span>
          </p>

          <div className="mt-4 flex items-center gap-10">
            <FooterItem label="Instructor" value={instructorName} />
            <LogoMark src={logoUrl} />
            <FooterItem label="Date" value={date} />
          </div>
        </div>
      </div>
    </div>
  );
}

function CornerFlourish({ className }: { className: string }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute h-4 w-4 rounded-tr-full rounded-bl-full bg-cert-border ${className}`}
    />
  );
}

function FooterItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-28 text-center">
      <div className="border-b border-cert-ink-muted pb-1 text-sm font-semibold text-cert-ink">
        {value}
      </div>
      <div className="pt-1 text-[10px] tracking-[0.15em] text-cert-ink-muted uppercase">
        {label}
      </div>
    </div>
  );
}

function LogoMark({ src }: { src?: string }) {
  if (src) {
    // Plain <img>, not next/image: this component is rendered server-side by
    // Puppeteer (features 3-4) and needs to stay a simple, self-contained
    // element rather than depend on Next's image optimization pipeline.
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={src}
        alt=""
        className="h-11 w-11 rounded-full border border-cert-border object-cover"
      />
    );
  }
  return (
    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-cert-border text-xs tracking-widest text-cert-bg">
      •••
    </div>
  );
}
