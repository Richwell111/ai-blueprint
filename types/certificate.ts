export interface CertificateData {
  recipientName: string;
  courseTitle: string;
  /** The organization or company issuing the course, e.g. "Traversy Media". */
  organizationName: string;
  /** Pre-formatted display string; date-picker/formatting logic lands in feature 8. */
  date: string;
  instructorName: string;
  /** Data URL; undefined renders the placeholder logo mark. */
  logoUrl?: string;
}
