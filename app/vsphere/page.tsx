import { NessusAcademy } from '../nessus/nessus-academy';
export const metadata = {
  title: 'VMware vSphere System Administration | CloudSeam Tech',
  description: 'Beginner-friendly ESXi and vCenter administration with attributed official screenshots, concise guided steps, checks and recovery notes.',
};
export default function VsphereClass() {
  return <NessusAcademy courseId="vsphere-administration" />;
}
