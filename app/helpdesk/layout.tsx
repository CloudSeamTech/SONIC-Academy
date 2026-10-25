import type { Metadata } from 'next';
export const metadata: Metadata = {
  title: 'SONIC-Academy | Private IIS Help Desk',
  description:
    'Build, protect and recover osTicket on Windows Server 2019 with IIS, PHP and MariaDB at helpdesk.lab.example.test.',
};
export default function HelpdeskLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
