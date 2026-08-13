import type { CertificateData } from "@/types/certificate";

export function BlackBorderCertificate({ data }: { data: CertificateData }) {
  const { recipientName, courseTitle, date, instructorName, logoUrl } = data;

  return (
    <div className="aspect-[1.414/1] w-full bg-cert-bg p-3 shadow-2xl shadow-black/40 sm:p-7">
      <div className="relative h-full rounded-2xl border-2 border-cert-border p-1 sm:rounded-3xl sm:border-[3px] sm:p-1.5">
        <div className="pointer-events-none absolute inset-1.5 rounded-xl border border-cert-border-inner sm:inset-2 sm:rounded-2xl" />
        <CornerFlourish className="top-1 left-1 sm:top-1.5 sm:left-1.5" />
        <CornerFlourish className="top-1 right-1 -scale-x-100 sm:top-1.5 sm:right-1.5" />
        <CornerFlourish className="bottom-1 left-1 -scale-y-100 sm:bottom-1.5 sm:left-1.5" />
        <CornerFlourish className="right-1 bottom-1 -scale-x-100 -scale-y-100 sm:right-1.5 sm:bottom-1.5" />
        <div className="relative flex h-full flex-col items-center justify-center gap-1 px-3 text-center font-sans text-cert-ink sm:gap-4 sm:px-10">
          <div>
            <h1 className="text-lg font-bold tracking-tight sm:text-4xl">Certificate</h1>
            <p className="text-xs text-cert-ink-muted sm:text-lg">of Completion</p>
          </div>

          <p className="text-[8px] font-semibold tracking-[0.15em] text-cert-ink-muted uppercase sm:text-xs sm:tracking-[0.2em]">
            This is to certify that
          </p>

          <h2 className="border-b border-cert-border-inner px-2 pb-0.5 text-xs font-bold tracking-wide uppercase sm:px-6 sm:pb-2 sm:text-2xl">
            {recipientName}
          </h2>

          <p className="max-w-md text-[9px] text-cert-ink-muted sm:text-sm">
            Has successfully completed the course:
            <br />
            <span className="font-semibold text-cert-ink">{courseTitle}</span>
          </p>

          <div className="mt-1 flex items-center gap-2 sm:mt-4 sm:gap-10">
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
      className={`pointer-events-none absolute h-2.5 w-2.5 rounded-tr-full rounded-bl-full bg-cert-border sm:h-4 sm:w-4 ${className}`}
    />
  );
}

function FooterItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-14 text-center sm:min-w-28">
      <div className="border-b border-cert-ink-muted pb-0.5 text-[9px] font-semibold text-cert-ink sm:pb-1 sm:text-sm">
        {value}
      </div>
      <div className="pt-0.5 text-[6px] tracking-widest text-cert-ink-muted uppercase sm:pt-1 sm:text-[10px] sm:tracking-[0.15em]">
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
        className="h-6 w-6 rounded-full border border-cert-border object-cover sm:h-11 sm:w-11"
      />
    );
  }
  return (
    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-cert-border text-[8px] tracking-widest text-cert-bg sm:h-11 sm:w-11 sm:text-xs">
      •••
    </div>
  );
}
