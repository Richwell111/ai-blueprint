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
    <div className="@container aspect-[1.414/1] w-full rounded-3xl border-[0.6cqw] border-cert-frame bg-cert-bg p-[2.4cqw] shadow-2xl shadow-black/40">
      <div className="relative h-full rounded-2xl border-[0.25cqw] border-cert-border p-[0.4cqw]">
        <div className="pointer-events-none absolute inset-[0.6cqw] rounded-xl border-[0.08cqw] border-cert-border-inner" />
        <CornerFlourish className="top-[1.2cqw] left-[1.2cqw]" />
        <CornerFlourish className="top-[1.2cqw] right-[1.2cqw] -scale-x-100" />
        <CornerFlourish className="bottom-[1.2cqw] left-[1.2cqw] -scale-y-100" />
        <CornerFlourish className="right-[1.2cqw] bottom-[1.2cqw] -scale-x-100 -scale-y-100" />
        <div className="relative flex h-full flex-col items-center justify-between gap-[1.6cqw] px-[8cqw] py-[4cqw] text-center font-sans text-cert-ink">
          <div>
            <h1 className="font-serif text-[4cqw] leading-[1.1] font-semibold tracking-tight">
              Certificate
            </h1>
            <p className="font-serif text-[1.8cqw] text-cert-ink-muted">
              of Completion
            </p>
          </div>

          <p className="text-[1cqw] font-semibold tracking-[0.2em] text-cert-ink-muted uppercase">
            This is to certify that
          </p>

          <h2 className="border-b-[0.1cqw] border-cert-border-inner px-[2.4cqw] pb-[0.6cqw] text-[2.6cqw] font-bold tracking-wide uppercase">
            {recipientName}
          </h2>

          <p className="max-w-[70cqw] text-[1.3cqw] text-cert-ink-muted">
            Has completed the following {organizationName} course:
            <br />
            <span className="font-semibold text-cert-ink">{courseTitle}</span>
          </p>

          <div className="mt-[1.2cqw] flex items-center gap-[4cqw]">
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
      className={`pointer-events-none absolute h-[2.2cqw] w-[2.2cqw] fill-cert-border ${className}`}
    >
      <circle cx="7" cy="7" r="6" />
      <circle cx="18" cy="4" r="3.5" />
      <circle cx="4" cy="18" r="3.5" />
    </svg>
  );
}

function FooterItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-[10cqw] text-center">
      <div className="border-b-[0.1cqw] border-cert-ink-muted pb-[0.3cqw] text-[1.3cqw] font-semibold text-cert-ink">
        {value}
      </div>
      <div className="pt-[0.3cqw] text-[0.85cqw] tracking-[0.15em] text-cert-ink-muted uppercase">
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
        className="h-[4cqw] w-[4cqw] rounded-full border-[0.1cqw] border-cert-border object-cover"
      />
    );
  }
  return (
    <div className="flex h-[4cqw] w-[4cqw] flex-col items-center justify-center gap-[0.3cqw] rounded-full bg-cert-border">
      <span className="h-[0.5cqw] w-[0.5cqw] rounded-full bg-cert-bg" />
      <div className="flex gap-[0.3cqw]">
        <span className="h-[0.5cqw] w-[0.5cqw] rounded-full bg-cert-bg" />
        <span className="h-[0.5cqw] w-[0.5cqw] rounded-full bg-cert-bg" />
      </div>
    </div>
  );
}
