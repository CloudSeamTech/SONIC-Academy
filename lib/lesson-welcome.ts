import migration from '../content/teaching/migration-welcome.json' with { type: 'json' };
import linux from '../content/teaching/linux-welcome.json' with { type: 'json' };
import alma from '../content/teaching/alma-welcome.json' with { type: 'json' };

export type LessonWelcome = {
  welcome: string;
  why: string;
  needs: string[];
  firstMove: string;
  reassurance: string;
};
export const lessonWelcomes: Record<string, LessonWelcome> = {
  ...migration,
  ...linux,
  ...alma,
};
const splitMachines: Record<string, string> = {
  'lab-04': 'DC01',
  'lab-07': 'DC02',
  'lab-06': 'APP01',
  'lab-08': 'DEST-DC01',
  'sql-02': 'SQL01',
};
export function welcomeFor(
  id: string,
  roleOnly = false,
): LessonWelcome | undefined {
  const machine = splitMachines[id.replace(/-(vmware|windows)$/, '')];
  if (machine && roleOnly) {
    const isController = ['lab-04', 'lab-07', 'lab-08'].includes(id);
    return {
      welcome: isController
        ? `Windows is already installed on ${machine}. Now we’ll give this server its directory job, one small step at a time.`
        : `Your ${machine} Windows server is ready. Now we’ll join it to the practice domain${id === 'lab-06' ? ' and set up the test website' : ''}.`,
      why: isController
        ? 'A domain controller keeps the practice network’s user accounts and sign-in information in one place.'
        : 'Joining the domain lets the server use the practice network’s shared sign-in and rules.',
      needs: [
        `Open the prepared ${machine} Windows Server 2019 desktop, not the VMware creation wizard.`,
        'Keep its verified private address, DNS settings and authorized administrator sign-in ready.',
        id === 'lab-04' || id === 'lab-08'
          ? 'Have the planned new forest name beside you. A forest is the directory environment we are about to create.'
          : 'Check that DC01 and lab.example.test DNS are working before joining the server.',
      ],
      firstMove:
        isController && id !== 'lab-07'
          ? 'Open Server Manager on this server and choose Manage → Add Roles and Features.'
          : 'Inside this server, check that your adapter uses the practice domain’s DNS server before joining the domain.',
      reassurance:
        'If you still need to create the VM or install Windows, go back to the two setup lessons just before this one.',
    };
  }
  if (machine && id.endsWith('-vmware'))
    return {
      welcome: `Let’s make a new virtual computer for ${machine}. We’ll set up its memory, disk and network in VMware first. Windows and server roles come in the next lessons.`,
      why: 'A virtual machine lets you practise on a separate computer without replacing the operating system on your own PC.',
      needs: [
        'You’ll work on your Windows PC with VMware Workstation Pro installed.',
        'Have the Windows Server 2019 ISO ready. An ISO is the installer packaged as one file.',
        'Keep your private lab network name and the earlier memory and disk plan beside you.',
      ],
      firstMove:
        'Open VMware Workstation Pro on your own PC. Choose File → New Virtual Machine.',
      reassurance:
        'If VMware opens to an existing VM, leave it alone and use File to start a new one. We’re not changing the old machine.',
    };
  if (machine && id.endsWith('-windows'))
    return {
      welcome: `Your ${machine} virtual computer is ready. Now we’ll install Windows Server 2019 on its empty disk, then give it the name and private address from your lab plan.`,
      why: 'Getting Windows ready first keeps the later domain or application lesson focused on one job.',
      needs: [
        `Use the ${machine} VM you just created in VMware.`,
        `Have the Server 2019 ISO attached and select Desktop Experience so you get the familiar Windows desktop.`,
        'Keep your planned name, address and a private place for the Administrator password nearby.',
      ],
      firstMove: `Open ${machine}’s VMware console and start Windows Setup. Check the VM name before selecting a disk.`,
      reassurance:
        'Only the new VM’s empty disk belongs in this installer. If the disk list is unexpected, stop and compare it with the earlier VM settings.',
    };
  return lessonWelcomes[id];
}
