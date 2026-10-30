import { NessusAcademy } from '../nessus/nessus-academy';
export const metadata = {
  title: 'Learn Azure Bicep from the First Line | CloudSeam Tech',
  description:
    'Beginner Bicep course: annotated code, real compiler practice, ARM JSON, modules, private networks and multi-server plans.',
};
export default function BicepClass() {
  return <NessusAcademy courseId="bicep-foundations" />;
}
