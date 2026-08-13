import type { CertificateData } from "@/types/certificate";

export function BlackBorderCertificate({ data }: { data: CertificateData }) {
  const {
    recipientName,
    courseTitle,
    organizationName,
    date,
    instructorName,
    logoUrl,
  } = data;

  return (
    <div className="aspect-[1.414/1] w-full rounded-2xl border-[6px] border-cert-frame bg-cert-bg p-3 shadow-2xl shadow-black/40 sm:rounded-3xl sm:border-[10px] sm:p-7">
      <div className="relative h-full rounded-xl border-2 border-cert-border p-1 sm:rounded-2xl sm:border-[3px] sm:p-1.5">
        <div className="pointer-events-none absolute inset-1.5 rounded-lg border border-cert-border-inner sm:inset-2 sm:rounded-xl" />
        <CornerFlourish className="top-1 left-1 sm:top-1.5 sm:left-1.5" />
        <CornerFlourish className="top-1 right-1 -scale-x-100 sm:top-1.5 sm:right-1.5" />
        <CornerFlourish className="bottom-1 left-1 -scale-y-100 sm:bottom-1.5 sm:left-1.5" />
        <CornerFlourish className="right-1 bottom-1 -scale-x-100 -scale-y-100 sm:right-1.5 sm:bottom-1.5" />
        <div className="relative flex h-full flex-col items-center justify-center gap-1 px-3 text-center font-sans text-cert-ink sm:gap-4 sm:px-10">
          <div>
            <h1 className="font-serif text-lg font-semibold tracking-tight sm:text-4xl">
              Certificate
            </h1>
            <p className="font-serif text-xs text-cert-ink-muted sm:text-lg">
              of Completion
            </p>
          </div>

          <p className="text-[8px] font-semibold tracking-[0.15em] text-cert-ink-muted uppercase sm:text-xs sm:tracking-[0.2em]">
            This is to certify that
          </p>

          <h2 className="border-b border-cert-border-inner px-2 pb-0.5 text-xs font-bold tracking-wide uppercase sm:px-6 sm:pb-2 sm:text-2xl">
            {recipientName}
          </h2>

          <p className="max-w-md text-[9px] text-cert-ink-muted sm:text-sm">
            Has completed the following {organizationName} course:
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
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className={`pointer-events-none absolute h-3 w-3 fill-cert-border sm:h-5 sm:w-5 ${className}`}
    >
      <circle cx="7" cy="7" r="6" />
      <circle cx="18" cy="4" r="3.5" />
      <circle cx="4" cy="18" r="3.5" />
    </svg>
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
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt=""
        className="h-6 w-6 rounded-full border border-cert-border object-cover sm:h-11 sm:w-11"
      />
    );
  }
  return (
    <div className="flex h-6 w-6 flex-col items-center justify-center gap-0.5 rounded-full bg-cert-border sm:h-11 sm:w-11">
      <span className="h-1 w-1 rounded-full bg-cert-bg sm:h-1.5 sm:w-1.5" />
      <div className="flex gap-0.5 sm:gap-1">
        <span className="h-1 w-1 rounded-full bg-cert-bg sm:h-1.5 sm:w-1.5" />
        <span className="h-1 w-1 rounded-full bg-cert-bg sm:h-1.5 sm:w-1.5" />
      </div>
    </div>
  );
}
