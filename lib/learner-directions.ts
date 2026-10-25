/** Clarify existing instructions without rewriting commands, file paths or addresses. */
export function learnerActions(text: string): string[] {
  const sentences = text
    .split(/\n+|(?<=[.!?])\s+(?=[A-Z])/)
    .map((x) => x.trim())
    .filter(Boolean);
  const expanded = sentences.flatMap((sentence) => {
    const route = sentence.match(
      /^(Open|Choose|Select|Click|Go to)\s+(.+?)([.!]?)$/i,
    );
    if (
      !route ||
      !route[2].includes(' → ') ||
      /https?:|[\\/]|\b(run|enter|type|set|paste|then)\b/i.test(route[2])
    )
      return [sentence];
    const parts = route[2].split(' → ');
    if (parts.some((p) => p.length > 90 || !p.trim())) return [sentence];
    return [
      `${route[1]} ${parts[0]}.`,
      ...parts.slice(1).map((p) => `Choose ${p.replace(/[.!]$/, '')}.`),
    ];
  });
  const grouped: string[] = [];
  const instruction =
    /^(?:open|choose|select|click|go to|type|enter|press|run|paste|copy|save|record|write|check|confirm|use|keep|leave|remove|add|set|start|stop|install|create|restart|reboot|shut|wait|compare|repeat|turn|grant|test|review|read|find|close|enable|disable|right-click|double-click|look|do not|don't|never|on |inside |in |for a fresh|if |when |before |after )/i;
  for (const line of expanded) {
    // An explanation stays with its action; it does not earn another step number.
    if (grouped.length && !instruction.test(line))
      grouped[grouped.length - 1] += ' ' + line;
    else grouped.push(line);
  }
  return grouped;
}
export function workspaceDirections(where: string, action = ''): string {
  where = where.split(/,?\s+unless\b/i)[0];
  const context = `${where} ${action}`;
  const machine =
    action.match(
      /^(?:On|Inside|In|Sign into|Sign in to)\s+(?:the\s+)?(DEST-DC01|AZ-DC01|AZ-SQL01|DC0[12]|APP0[12]|IIS-DMZ01|SQL0[12]|MECM01|WSUS01|FW01|PROXY01|TEST01|CLIENT01)\b/i,
    )?.[1] ||
    where.match(
      /\b(?:DEST-DC01|AZ-DC01|AZ-SQL01|DC0[12]|APP0[12]|IIS-DMZ01|SQL0[12]|MECM01|WSUS01|FW01|PROXY01|TEST01|CLIENT01)\b/,
    )?.[0];
  const cloud =
    /Azure|Bastion|private RDP/i.test(where) ||
    /^(AZ-|APP02$)/i.test(machine ?? '');
  const guest = machine
    ? cloud
      ? `In Azure portal, open Virtual machines → ${machine} → Connect. Use the private access method set up in the earlier network lesson, then sign in to that VM. `
      : `In VMware Workstation Pro, double-click ${machine} in Library to open its screen. Sign in to that practice VM. `
    : '';
  if (/AlmaLinux.*Terminal.*then.*Windows.*PowerShell/i.test(where))
    return 'Start in the AlmaLinux VM’s Terminal for the Linux check below. Then switch to your Windows host, open Start → Windows PowerShell and use the SSH command there. Compare the host-key fingerprint before accepting a new connection.';
  if (/AlmaLinux.*installer|Windows Setup|Windows installer/i.test(where))
    return `In VMware Library, open ${machine ?? 'the new AlmaLinux VM'} to view its installer console. Stay in the operating-system installer and follow the named setup screen below. There is no installed desktop or user sign-in yet.`;
  if (/GNOME Settings/i.test(where))
    return 'Inside the AlmaLinux VM desktop, open the system menu at the top right → Settings. Choose the page named below. If a command is also shown, open Activities → Terminal inside the same VM for that check.';
  if (/GNOME Files/i.test(where))
    return 'Inside the AlmaLinux VM, click Activities, type Files and open it. Start at Home in the left sidebar. Use the folder or drive named below; press Ctrl+L to type a path. Open Terminal only for a separately shown command.';
  if (/GNOME Disks/i.test(where))
    return 'Inside the AlmaLinux VM, click Activities, type Disks and open it. Select the drive named in the step and compare its model, size and serial before any change. Do not choose Format unless the step specifically uses a new empty practice disk.';
  if (/Steam app/i.test(where))
    return 'Inside the AlmaLinux desktop, click Activities, type Steam and open it. Use Steam’s own menu or Settings page named below; these clicks do not go into Terminal.';
  if (/notebook|paper|planning|diagram|your notes|lab notes/i.test(where))
    return 'Use your lab notes on your own computer. This is a planning step; nothing is installed or changed yet.';
  if (/Run Command|RunCommand|RunShellScript|RunPowerShellScript/i.test(where))
    return 'On your Windows host, open https://portal.azure.com → Virtual machines and select the VM named in this lesson. Open Run command and choose the script type named in the step. Paste the block into that portal box and select Run. It executes on the selected Azure VM, not on your Windows host.';
  if (/Nessus.*InstallShield/i.test(where))
    return 'Open the Windows Server practice VM’s VMware console and sign in there. Inside that guest, open the folder where you saved the Nessus installer and run it. Stay in the InstallShield wizard for the selections below; the web console comes after installation.';
  if (
    /Nessus|:8834/i.test(where) &&
    !/terminal|bash|PowerShell|InstallShield/i.test(where)
  )
    return 'On your Windows host, open a browser and enter the private HTTPS scanner address recorded during installation, usually port 8834. Sign in to that Nessus web console and use the page named below. The Linux scanner can remain at its text console; you do not need a browser installed on it.';
  if (/sftp.*prompt/i.test(where))
    return 'Return to the file-transfer tab you opened earlier. Its prompt must say sftp>. Paste SFTP commands there, not into PowerShell or Bash.';
  if (/FW01|OPNsense/i.test(where) && /console|installer/i.test(where))
    return 'In VMware Library, double-click FW01 to open the firewall console. Use the text installer or numbered console menu named below; these entries do not go into the Windows PowerShell window.';
  if (/OPNsense|FW01.*(browser|web)|firewall web/i.test(where))
    return 'On your Windows host, open a browser at https://10.50.0.1 and sign in to your practice firewall. Keep its VMware console available for recovery. Use the menu named in the actions below.';
  if (/VMware Workstation|Virtual Network Editor/i.test(where))
    return 'On your real Windows PC, click Start, type VMware Workstation Pro and open it. Use the host menus for VMware settings. When the action asks for a guest console, double-click that VM in Library and work inside its screen. For Virtual Network Editor, open Edit → Virtual Network Editor → Change Settings.';
  if (/Splunk/i.test(where) && !/terminal|bash|shell|PowerShell/i.test(where))
    return 'Open the Splunk Web address you saved in the installation lesson and sign in. Stay in Splunk’s browser window; use the app or menu named below. Splunk Web is separate from this academy page.';
  if (/Windows System Properties/i.test(where))
    return (
      guest +
      'Inside that Windows VM, press Windows+R, type sysdm.cpl and press Enter. Open the Computer Name tab. Choose Change only when the action below asks for a rename or domain change.'
    );
  if (/Windows Network Connections/i.test(where))
    return (
      guest +
      'Inside that Windows VM, press Windows+R, type ncpa.cpl and press Enter. Right-click its Ethernet adapter → Properties → Internet Protocol Version 4 → Properties. Use the values listed in the step, not your physical PC’s network settings.'
    );
  if (/SQL Server Configuration Manager/i.test(where))
    return (
      guest +
      'Inside SQL01, click Start, search SQL Server Configuration Manager and open the tool for your installed SQL version. Expand SQL Server Network Configuration only when the step asks for a protocol change.'
    );
  if (/ADSI Edit/i.test(where))
    return (
      guest +
      'Inside the practice domain controller, press Windows+R, type adsiedit.msc and press Enter. Connect to the Default naming context only when instructed. Check the exact container before changing its permissions.'
    );
  if (/Group Policy Management/i.test(where))
    return (
      guest +
      'Inside the Windows server, open Server Manager → Tools → Group Policy Management. Expand the forest and Domains in the left tree, then select the practice domain named below.'
    );
  if (/Configuration Manager Setup wizard|SQL Server Setup wizard/i.test(where))
    return (
      guest +
      'Open the installer folder or mounted ISO recorded in the download lesson. Run the setup entry named below as administrator. Stay in its wizard and choose the named page; do not open a query window for installer selections.'
    );
  if (/Configuration Manager console/i.test(where))
    return (
      guest +
      'Inside MECM01, click Start, search Configuration Manager Console and open it. Select the workspace named below at the bottom left, then expand the named folders in its navigation tree.'
    );
  if (/Failover Cluster Manager/i.test(where))
    return (
      guest +
      'Inside the Windows server, open Server Manager → Tools → Failover Cluster Manager. Connect to the practice cluster recorded earlier, then select the named node or resource.'
    );
  if (/SSMS|SQL.*(query|editor|studio)|T-SQL/i.test(where))
    return (
      guest +
      'Inside the practice Windows server, click Start, search for SQL Server Management Studio and open it. Connect to the SQL instance recorded in your earlier setup lesson. For SQL statements, click New Query and choose the named practice database before pasting.'
    );
  if (/DNS Manager/i.test(context) && /DNS|DC0|Server Manager/i.test(where))
    return (
      guest +
      'Inside the Windows server, open Server Manager → Tools → DNS. In the left tree, expand the named server and Forward Lookup Zones. Follow the zone and record choices below.'
    );
  if (
    /Active Directory Users|ADUC|dsa\.msc/i.test(context) &&
    /DC0|ADUC|Active Directory/i.test(where)
  )
    return (
      guest +
      'Inside the Windows server, click Start, type Active Directory Users and Computers and open it. Expand your practice domain in the left tree. The actions below name the folder, user or group to select.'
    );
  if (/IIS Manager/i.test(where))
    return (
      guest +
      'Inside the Windows server, click Start, type IIS Manager and open Internet Information Services (IIS) Manager. In Connections on the left, expand the server. Choose Sites or Application Pools only when the step asks for it.'
    );
  if (/Azure.*(portal|browser)|portal\.azure|Azure Portal/i.test(where))
    return 'On your own computer, open https://portal.azure.com in a browser and sign in to your practice subscription. Use the search box at the top to find the service named below. Do not paste portal click instructions into PowerShell.';
  if (/Defender.*(portal|browser)|security\.microsoft/i.test(where))
    return 'Open the Microsoft security portal named in this lesson in your browser. Sign in to the practice tenant and check the tenant name before selecting any device or subscription.';
  if (/PowerShell/i.test(where))
    return (
      guest +
      (machine ? 'Inside that VM, ' : 'On the Windows computer named above, ') +
      'click Start and type Windows PowerShell. ' +
      (/admin|elevated/i.test(where)
        ? 'Right-click Windows PowerShell → Run as administrator → Yes. '
        : 'Open Windows PowerShell in a normal window. ') +
      'Look for a PS prompt. Paste the command block there, then press Enter; copying from this page does not run it.'
    );
  if (/AlmaLinux.*web browser/i.test(where))
    return 'Inside the AlmaLinux VM, open its web browser from Activities and follow the official link named below. When the step asks for Linux commands, open Activities → Terminal in the same VM.';
  if (/SSH|Bash|Linux|Alma|NGINX|terminal/i.test(where))
    return (
      guest +
      (machine
        ? 'If you see a text login, sign in there. If you see a GNOME desktop, click Activities, type Terminal and open it. '
        : 'Return to the Linux console or SSH connection named above. On a GNOME desktop, click Activities, type Terminal and open it. ') +
      'Run hostname to check the machine. Paste Linux commands into that terminal, not into Windows PowerShell. When sudo asks for your password, typing may show no characters; that is normal.'
    );
  if (/Server Manager|Windows Server/i.test(where))
    return (
      guest +
      'Inside that Windows server, click Start and open Server Manager. Use the local server or Tools menu named below. These changes belong to the VM, not to your physical Windows PC.'
    );
  if (/File Explorer|folder|files/i.test(where))
    return (
      guest +
      'Press Windows+E on the Windows computer named above to open File Explorer. Click its address bar, paste the folder path from the step and press Enter.'
    );
  if (/browser|website|web/i.test(where))
    return 'Open a browser on the computer named above. Enter the address given in the step, sign in if asked, and follow the named buttons. This academy page is the guide; it does not configure that application for you.';
  return `Work in ${where.replace(/[.]$/, '')}. Use the named practice machine and app; the instructions below tell you what to select or type there.`;
}
