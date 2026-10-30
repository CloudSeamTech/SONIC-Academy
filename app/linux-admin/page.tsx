import { NessusAcademy } from '../nessus/nessus-academy';
export const metadata = {
  title: 'Linux Daily Admin Tasks on RHEL / AlmaLinux 9 | CloudSeam Tech',
  description:
    'Step-by-step daily Linux administration, safe troubleshooting exercises, LVM, services, security, recovery and interview preparation.',
};
export default function LinuxDailyAdminClass() {
  return <NessusAcademy courseId="linux-daily-admin" />;
}
