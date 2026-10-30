/* Vendor artwork is served locally and kept in its supplied proportions. */
/* oxlint-disable next/no-img-element */
import { brandForCourse } from '../lib/course-brands';
export function CourseBrand({ id }: { id: string }) {
  if (id === 'pki-certificate-management')
    return (
      <span className="vendor-course-mark is-pair">
        <img
          src="/vendor-logos/microsoft.svg"
          alt="Microsoft technology"
          width="32"
          height="32"
          loading="lazy"
        />
        <img
          src="/vendor-logos/nginx.svg"
          alt="NGINX technology"
          width="32"
          height="32"
          loading="lazy"
        />
      </span>
    );
  const brand = brandForCourse(id);
  return brand ? (
    <span className="vendor-course-mark">
      <img
        src={`/vendor-logos/${brand.id}.svg`}
        alt={`${brand.name} technology`}
        width="76"
        height="36"
        loading="lazy"
      />
    </span>
  ) : null;
}
