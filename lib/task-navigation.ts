import splunkNavigation from '../content/teaching/splunk-navigation.json' with { type: 'json' };
import pkiNavigation from '../content/teaching/pki-navigation.json' with { type: 'json' };
import vsphereNavigation from '../content/teaching/vsphere-navigation.json' with { type: 'json' };
export type StepResource = {
  title: string;
  where?: string;
  why?: string;
  links?: { title: string; url: string }[];
  path?: string[];
  needs?: string;
  reviewedOn?: string;
};

/** Authored routes only. Never infer a vendor menu or version from a keyword. */
export const taskNavigation: Record<
  string,
  StepResource & { actions?: string[] }
> = {
  ...vsphereNavigation,
  ...pkiNavigation,
  ...splunkNavigation,
  'vsphere-install:1': {
    title: 'Download the installer, then choose the installation disk',
    where:
      'Your Windows workstation browser → Broadcom Support Portal; then the disposable ESXi server console',
    why: 'The ISO must match your hardware; installation replaces data on the chosen disk.',
    needs:
      'A Broadcom account. Use the standalone free route or your entitled product; free ESXi cannot join vCenter.',
    reviewedOn: '2026-10-31',
    path: [
      'Broadcom Support Portal',
      'My Downloads',
      'Free Software Downloads available HERE',
      'VMware vSphere Hypervisor',
    ],
    links: [
      {
        title: 'Open Broadcom Support Portal',
        url: 'https://support.broadcom.com/',
      },
      {
        title: 'Free ESXi download route and license limits',
        url: 'https://knowledge.broadcom.com/external/article/399823',
      },
      {
        title: 'Entitled downloads and OEM images',
        url: 'https://knowledge.broadcom.com/external/article/366685',
      },
      {
        title: 'VMware hardware compatibility guide',
        url: 'https://compatibilityguide.broadcom.com/',
      },
    ],
    actions: [
      'On your Windows workstation, open https://support.broadcom.com/ and sign in to your Broadcom account.',
      'For standalone free practice, select My Downloads in the left menu, then select Free Software Downloads available HERE.',
      'In the free-download search, type VMware vSphere Hypervisor. Open the matching product. Broadcom documents ESXi 8.0 Update 3e, build 24677879, for this route; this is the lesson baseline, not a claim that it is the newest release.',
      'Read the download terms. If you accept them, select I agree to the Terms and Conditions, then download the ISO to your workstation. An ISO is the installation-disc image.',
      'If using an entitled enterprise installer instead, return to My Downloads → your VMware vSphere product → major version 8 → VMware vSphere Hypervisor (ESXi) → View Group. Use the version selector to match your approved lab plan.',
      'For an OEM installer, open Custom ISOs in that download group and select the image for your server maker and approved ESXi release. Check the server model, network adapter (NIC), and storage controller in the linked compatibility guide before installing.',
      'If the download page publishes a SHA-256 checksum, open Downloads in File Explorer, right-click the ISO → Copy as path. Open PowerShell and type Get-FileHash followed by a space, the quoted ISO path, and -Algorithm SHA256. Compare every hash character with the publisher value. Stop if they differ; never invent a missing checksum.',
      'Open the disposable server’s console. Attach the ISO using that server’s virtual-media control, or use its approved installation USB. Boot from that media. Physical-server boot keys vary by manufacturer; use the server’s documented boot menu.',
      'At the ESXi installer welcome screen, press Enter to continue. Read the license screen and press F11 only if you are authorized to accept it.',
      'On Select a Disk to Install or Upgrade, use the arrow keys to highlight the disk from your lab plan. Compare its model, capacity, and identifier before pressing Enter.',
      'If you see unexpected existing data or an upgrade/preserve choice, stop before confirming. Do not choose another disk or erase data to get past the warning.',
    ],
  },
  'vsphere-install:2': {
    title: 'Finish installation and check the first boot',
    where:
      'Disposable ESXi server → installer console → Direct Console User Interface (DCUI)',
    why: 'A successful first boot confirms the server can start from its own installation disk.',
    needs:
      'The verified installation disk from Step 1. Set the password privately on the server console.',
    path: [
      'Select keyboard layout',
      'Enter a root password',
      'Confirm Install',
      'Reboot',
      'DCUI',
    ],
    links: [
      {
        title: 'ESXi 8 installation documentation',
        url: 'https://techdocs.broadcom.com/us/en/vmware-cis/vsphere/vsphere/8-0.html',
      },
      {
        title: 'Cisco ESXi 8 console installation walkthrough',
        url: 'https://www.cisco.com/c/en/us/support/docs/servers-unified-computing/vmware-esxi-cisco-ucs/222224-install-or-upgrade-to-esxi-8-x-on-ucs-c2.html',
      },
    ],
    actions: [
      'On Select a keyboard layout, highlight your keyboard layout with the arrow keys and press Enter.',
      'On Enter a root password, type and confirm a strong password privately, then press Enter. The root account is the host administrator.',
      'At Confirm Install, read the selected disk and warning again. Press F11 only when this is the planned disposable installation disk.',
      'Wait for Installation Complete. Disconnect the installation ISO or USB before pressing Enter to reboot, so the host does not start the installer again.',
      'After restart, look for the yellow-and-grey Direct Console User Interface (DCUI). Record the displayed ESXi version and build in your notes; do not save the password.',
      'If the installer returns, check the boot-media connection and boot order. Stop if the host cannot boot from its own disk; a displayed management address alone does not prove network access.',
    ],
  },
};

export function stepResource(
  stepId: string,
  fallback: StepResource,
): StepResource {
  const resource = { ...fallback, ...taskNavigation[stepId] };
  if (resource.links)
    resource.links = [
      ...new Map(resource.links.map((link) => [link.url, link])).values(),
    ];
  return resource;
}

export function stepActions(stepId: string, fallback: string[]): string[] {
  return taskNavigation[stepId]?.actions ?? fallback;
}

/** Surface literal public destinations already authored in a task; do not guess URLs. */
export function taskLinks(text: string): { title: string; url: string }[] {
  const links = new Map<string, { title: string; url: string }>();
  for (const match of text.matchAll(/https:\/\/[^\s<>"'`]+/g)) {
    const value = match[0].replace(/[),.;]+$/, '');
    try {
      const url = new URL(value);
      if (url.username || url.password || /[{}$\\]/.test(value)) continue;
      if (
        /^(localhost|\d+(?:\.\d+){3})$/.test(url.hostname) ||
        /^(your[-.]|vcenter$|esxi$|host$|server$)/i.test(url.hostname) ||
        /(?:^|\.)(?:example\.(?:test|com|org)|invalid)$/.test(url.hostname)
      )
        continue;
      links.set(url.href, {
        title: `Open ${url.hostname}${url.pathname === '/' ? '' : url.pathname}`,
        url: url.href,
      });
    } catch {
      /* Placeholder addresses belong in the task, not a guessed external link. */
    }
  }
  return [...links.values()];
}

export const taskScreenshots = [
  {
    stepId: 'vsphere-install:1',
    actionStartsWith: 'For standalone free practice',
    src: '/vsphere-lab/vendor/broadcom-free-downloads.png',
    alt: 'Broadcom My Downloads: My Downloads is selected at left; Free Software Downloads available HERE is highlighted in the main panel.',
    caption:
      'Select My Downloads, then Free Software Downloads available HERE.',
    source: 'https://knowledge.broadcom.com/external/article/399823',
    downloadUrl:
      'https://api-broadcomcms-software.wolkenservicedesk.com/es/attachments/get_attachment_content?uniqueFileId=2185298438350',
  },
  {
    stepId: 'vsphere-install:1',
    actionStartsWith: 'In the free-download search',
    src: '/vsphere-lab/vendor/broadcom-hypervisor-iso.png',
    alt: 'Broadcom product entry VMware vSphere Hypervisor (ESXi ISO) image, filename VMware-VMvisor-Installer-8.0U3e-24677879.x86_64.iso and build 24677879.',
    caption:
      'Match the product name and the lesson baseline: 8.0U3e, build 24677879.',
    source: 'https://knowledge.broadcom.com/external/article/399823',
    downloadUrl:
      'https://api-broadcomcms-software.wolkenservicedesk.com/es/attachments/get_attachment_content?uniqueFileId=2185303660675',
  },
];
