// Configuration presence only. Never outputs values or makes a connection claim.
import release from '../config/lab-link-release.json' with { type: 'json' };
const required = [
  'SUPABASE_URL',
  'SUPABASE_PUBLISHABLE_KEY',
  'SUPABASE_SECRET_KEY',
  'LAB_LINK_SITE_ORIGIN',
];
let missing = 0;
for (const name of required) {
  const present = Boolean(process.env[name]);
  console.log(`${present ? 'Present' : 'Missing'}: ${name}`);
  if (!present) missing++;
}
console.log(
  `Live API gate: ${process.env.LAB_LINK_ENABLED === 'true' ? 'enabled' : 'disabled'}`,
);
console.log(
  `Owner release gate: ${process.env.LAB_LINK_RELEASE_APPROVED === 'true' ? 'approved' : 'not approved'}`,
);
console.log(`Checker manifest: ${release.status}`);
console.log(
  'Presence is not proof of valid credentials, installed migration, SMTP delivery, signed package or VM connectivity. Follow docs/lab-link-setup.md.',
);
process.exitCode = missing ? 2 : 0;
