# VMware vSphere training plan

Access route: walkthrough / standalone ESXi / authorized vCenter or hosted lab
Date, owner and permitted change window:
Actual product, version, build and license edition (never include license keys):
Authorized installation-media source and compatibility checks:

## Identity and management
Host name / reserved IP / mask / gateway:
Private forward and reverse DNS:
Approved NTP source:
Management vmnic / MAC / port group / VLAN / vmk:
Console or out-of-band recovery route:
vCenter identity and sizing, only if available:

## Storage
Boot device stable ID and capacity:
Separate blank disposable device stable ID and capacity:
Existing datastores that MUST remain intact:
Practice datastore / type / backing / intended hosts / headroom:
Optional NFS server / export / version / authorized host addresses:

## Guest network and servers
Isolated switch: vSwitch-LAB-Isolated; no uplink; same-host test only
Port group: LAB-Isolated; untagged VLAN 0 for this isolated exercise
Test guest names and unique private addresses:
Guest OS, authorized ISO, checksum, CPU/RAM/disk sizing:
Service test and expected response:

## Recovery
Known-good configuration and independent backup location:
Restore evidence and owner:
Stop conditions and rollback steps:
Unsupported or walkthrough-only tasks:

Never put passwords, private keys, tokens or license strings in this worksheet.
