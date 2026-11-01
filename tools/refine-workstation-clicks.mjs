import fs from 'node:fs';
const path = 'content/migration/migration-lessons.generated.json';
const catalog = JSON.parse(fs.readFileSync(path, 'utf8'));
let changed = 0;
for (const lesson of catalog.lessons) {
  lesson.body = lesson.body.replace(
    /(### Step \d+: ([^\n]+)\n)([\s\S]*?)(?=### Step \d+: |$)/g,
    (whole, header, title, body) => {
      if (!/\*\*WORKSPACE\*\*[^\n]*VMware Workstation Pro/.test(body))
        return whole;
      const original = body.match(/\*\*DO\*\* ([\s\S]*?)(?=\n\n\*\*)/)?.[1];
      let action;
      if (title === 'Choose Typical')
        action =
          'In New Virtual Machine Wizard, select the radio button Typical (recommended). Click Next >. You should now see Guest Operating System Installation.';
      if (title === 'Use manual Windows installation')
        action =
          'On Guest Operating System Installation, select I will install the operating system later. Click Next >. You should now see Select a Guest Operating System. We attach the ISO later so Easy Install does not choose the Windows edition for you.';
      if (title === 'Choose the Server 2019 guest profile')
        action =
          'On Select a Guest Operating System, click Microsoft Windows. Click the Version drop-down arrow. Select Windows Server 2019 from the list. Click Next > to reach Name the Virtual Machine. If that profile is absent, stop and check your Workstation version; do not guess a different OS.';
      if (title === 'Name the VM') {
        const name = original?.match(/Enter ([A-Z0-9-]+) as/)?.[1];
        if (name)
          action = `On Name the Virtual Machine, click Virtual machine name, press Ctrl+A, and type ${name}. Click Browse beside Location and select your dedicated lab folder on a drive with enough free space. Click OK in the folder chooser. Check the name and location, then click Next >. The next page is Specify Disk Capacity. This name labels the VMware library entry; it does not rename Windows.`;
      }
      if (title === 'Create a new virtual disk') {
        const capacity = original?.match(
          /(?:size to|type) (\d+) (?:GB|in)/,
        )?.[1];
        if (capacity) {
          action = `On Specify Disk Capacity, click the Maximum disk size (GB) box. Press Ctrl+A and type ${capacity}. If Allocate all disk space now is visible, leave its checkbox clear. Select Split virtual disk into multiple files. Click Next >. The Ready to Create Virtual Machine page should now show the planned ${capacity} GB disk; it is created only when you later click Finish. Splitting files controls how the disk is stored; leaving preallocation off lets it grow as data is written.`;
          body = body.replace(
            /\*\*EXPECT\*\* [^\n]+/,
            `**EXPECT** Ready to Create Virtual Machine shows the planned ${capacity} GB disk. You have not clicked Finish yet.`,
          );
        }
      }
      if (!action) return whole;
      body = body.replace(
        /\*\*DO\*\* [\s\S]*?(?=\n\n\*\*)/,
        `**DO** ${action}`,
      );
      body = body.replace(
        'Do not select the example Windows 7 ISO visible in the reference. We attach your Server 2019 ISO later.',
        'No ISO is selected yet. Attach your approved Server 2019 ISO later in Customize Hardware > CD/DVD.',
      );
      changed++;
      return header + body;
    },
  );
}
fs.writeFileSync(path, JSON.stringify(catalog, null, 2) + '\n');
console.log(
  `Refined ${changed} VMware wizard steps. No screenshots or successful VM results were fabricated.`,
);
