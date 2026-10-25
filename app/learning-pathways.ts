import {
  splunkCourse,
  dmzCourse,
  mecmCourse,
  wsusCourse,
  landingZoneCourse,
  securityCourse,
  helpdeskCourse,
  maintenanceCourse,
} from '../lib/guided-courses.ts';
import { welcomeFor } from '../lib/lesson-welcome.ts';
import { nessusCourses, nessusCourseHref } from '../lib/nessus-curriculum.ts';
import almaCourse from '../content/alma/desktop-lessons.json' with { type: 'json' };
import { lessons, modules } from './course.ts';
import {
  migrationCurriculum as migrationLessons,
  migrationParts,
} from './migration-curriculum.ts';

export type ConsoleLesson = {
  id: string;
  title: string;
  description: string;
  href: string;
  source:
    | 'linux'
    | 'migration'
    | 'alma'
    | 'nessus'
    | 'azure-lab'
    | 'helpdesk'
    | 'security-lab'
    | 'landing-zone'
    | 'enterprise';
  metadata: string;
  steps: string[];
};
export type LearningPathway = {
  id: string;
  title: string;
  prerequisite: string;
  sections: { title: string; optional?: boolean; lessons: ConsoleLesson[] }[];
};

const titles: Record<string, [string, string]> = {
  'lab-00': [
    'Choose Your Lab',
    'Choose the local lab route and record the hardware and budget you have available.',
  ],
  'lab-01': [
    'Understand the Lab Network',
    'Identify each server and its role in the source and destination environments.',
  ],
  'lab-02': [
    'Prepare Windows Server',
    'Download the required installers and check your workstation resources.',
  ],
  'lab-03': [
    'Build a Private Lab Network',
    'Create the isolated VMnet2 host-only network for your Windows lab servers.',
  ],
  'lab-04': [
    'Set Up Active Directory and DNS on DC01',
    'Install Windows Server on DC01, configure its address, and create lab.example.test with AD DS and DNS.',
  ],
  'lab-07': [
    'Add DC02 and Check Active Directory Replication',
    'Build DC02 in lab.example.test and verify Active Directory replication.',
  ],
  'lab-05': [
    'Create Users & Policy',
    'Create test users, organizational units, and a Group Policy in lab.example.test.',
  ],
  'lab-06': [
    'Build and Join APP01',
    'Join APP01 to lab.example.test and install an IIS test website.',
  ],
  'lab-08': [
    'Build the Destination Domain',
    'Create DEST-DC01 and a separate migrate.lab.example.test forest.',
  ],
  'lab-09': [
    'Connect Two Domains with DNS Forwarders',
    'Configure DNS resolution between lab.example.test and migrate.lab.example.test.',
  ],
  'lab-10': [
    'Move a Group Policy',
    'Export a test GPO and import it into the destination domain.',
  ],
  'lab-11': [
    'Move APP01 to the New Domain',
    'Move APP01 to migrate.lab.example.test and verify its application and policies.',
  ],
  'lab-12': [
    'Test the Rollback Plan',
    'Rehearse recovery from a domain move and record the result.',
  ],
  'sql-01': [
    'Choose the SQL Installer',
    'Choose supported SQL Server and Configuration Manager evaluation installers.',
  ],
  'sql-02': [
    'Build SQL01',
    'Create the SQL01 Windows server and join it to lab.example.test.',
  ],
  'sql-03': [
    'Install SQL Server',
    'Install and configure the SQL Server instance on SQL01.',
  ],
  'sql-04': [
    'Create a SQL Database',
    'Use SSMS to create a practice database and sample data.',
  ],
  'sql-05': [
    'Back Up and Restore a SQL Database',
    'Create a real database backup and restore it to prove recovery.',
  ],
  'lab-14': [
    'Plan the Azure Destination',
    'Plan the Azure identity environment and set a spending boundary.',
  ],
  'lab-15': [
    'Build AZ-DC01',
    'Create the Windows domain controller for your optional Azure destination forest.',
  ],
  'lab-16': [
    'Verify Private Connectivity',
    'Prove private network connectivity before moving a server into Azure.',
  ],
  'lab-17': [
    'Move a Server to Azure',
    'Rehearse one member-server migration after the private networking checks pass.',
  ],
  'move-01': [
    'Choose a Migration Method',
    'Inventory each workload and select a method that supports its dependencies.',
  ],
  'move-02': [
    'Move SQL Server Data to Azure',
    'Move only the practice database using a backup and restore workflow, then validate it.',
  ],
  'move-03': [
    'Plan a MECM Migration',
    'Compare supported approaches for preserving or replacing a Configuration Manager site.',
  ],
  'move-04': [
    'Plan Identity Changes',
    'Identify the account, computer, and application changes needed for a new domain.',
  ],
  'az-01': [
    'Set the Azure Lab Budget',
    'Estimate costs and limit the lab to one cloud VM at a time.',
  ],
  'az-02': [
    'Check Migration Tool Support',
    'Check that your migration tool supports the actual source hypervisor.',
  ],
  'upgrade-01': [
    'Upgrade Server 2019 to 2022 in Azure',
    'Upgrade the migrated APP02 member server in Azure and prove its application still works.',
  ],
  'az-03': [
    'Rehearse the Cutover',
    'Prepare a practice cutover plan with validation and rollback gates.',
  ],
  'lab-19': [
    'Troubleshoot Common IT Problems',
    'Choose a symptom in Azure, Windows, RHEL, SQL, migrations or applications and follow the checks in order.',
  ],
  'lab-13': [
    'Install WSUS',
    'Build a separate WSUS server and verify the update service.',
  ],
  'mecm-01': [
    'Build MECM01',
    'Create MECM01 and install the required Windows roles.',
  ],
  'mecm-02': [
    'Connect MECM to AD and SQL',
    'Grant MECM01 the required directory and SQL Server permissions.',
  ],
  'mecm-03': [
    'Install Configuration Manager',
    'Install an evaluation stand-alone primary site and verify its prerequisites.',
  ],
  'mecm-04': [
    'Add a Managed Client',
    'Add a Configuration Manager client and test its SQL dependency.',
  ],
  'mecm-05': [
    'Connect MECM to WSUS',
    'Connect the Software Update Point to WSUS01 and verify update management.',
  ],
  'ha-01': [
    'Understand SQL High Availability',
    'Explain how two SQL nodes and a cloud witness participate in cluster quorum.',
  ],
  'ha-02': [
    'Prepare SQL01 and SQL02',
    'Prepare two SQL nodes for a separate high availability lab after proving single-server recovery.',
  ],
  'ha-03': [
    'Create a Cloud Witness',
    'Create the Azure storage account that will hold the cluster witness blob.',
  ],
  'ha-04': [
    'Configure Cluster Quorum',
    'Configure a healthy Windows Failover Cluster to use the Azure cloud witness.',
  ],
  'ha-05': [
    'Test Quorum and Clean Up',
    'Test quorum safely and distinguish cluster voting from database replication.',
  ],
  'lab-18': [
    'Explain the Migration Plan',
    'Rehearse the migration sequence using the interview drill and checklist.',
  ],
  'lab-20': [
    'Shut Down the Lab',
    'Stop or remove cloud resources deliberately and retain your learning evidence.',
  ],
  'field-01': [
    'Review an Existing Migration',
    'Ask ten handoff questions to establish the project state before making changes.',
  ],
};

const linuxTitles: Record<string, string> = {
  'assignment-v2': 'Plan the Lab Change',
  'windows-tools-v2': 'Check Windows Tools',
  'azure-scope-v2': 'Set the Azure Budget',
  'two-host-plan-v3': 'Plan Two RHEL Servers',
  'resource-group-v2': 'Create a Resource Group',
  'network-plan-v2': 'Build a VNet and Subnet',
  'build-storage-v3': 'Plan Disks and Mount Points',
  'nsg-v2': 'Restrict SSH Access',
  'key-concept-v2': 'Understand SSH Keys',
  'key-create-v2': 'Create an SSH Key Pair',
  'vm-provision-v2': 'Build the RHEL Endpoint',
  'manager-vm-v3': 'Build the RHEL Manager',
  'reachability-v2': 'Test Network Access',
  'host-trust-v2': 'Verify the Host Fingerprint',
  'first-ssh-v2': 'Connect to RHEL with SSH',
  'identity-v2': 'Check User Privileges',
  'host-os-v2': 'Identify the RHEL System',
  'guest-network-v2': 'Check IP Addresses and Routes',
  'home-files-v2': 'Explore Linux Files',
  'storage-verify-v3': 'Verify Linux Storage',
  'paired-access-v3': 'Verify Access to Both Hosts',
  'test-file-v3': 'Create a Test File',
  'scp-test-v3': 'Copy a File with SCP',
  'verify-transfer-v3': 'Verify the Copied File',
  'sftp-test-v3': 'Transfer a File with SFTP',
  'installer-types-v3': 'Choose an Install Method',
  'software-inventory-v3': 'Record Installed Software',
  'baseline-v2': 'Capture the Server Baseline',
  'rollback-gate-v3': 'Prepare the Rollback Plan',
  'deallocate-v2': 'Pause the Azure Lab',
  'wazuh-release-v4': 'Check the Wazuh Release',
  'wazuh-central-v4': 'Install the Wazuh Manager',
  'wazuh-dashboard-v4': 'Verify Wazuh Services',
  'wazuh-artifact-v4': 'Verify the Agent Package',
  'wazuh-agent-v4': 'Install the Wazuh Agent',
  'wazuh-checkin-v4': 'Verify Agent Check-In',
  'wazuh-event-v4': 'Test Event Delivery',
  'wazuh-fault-v4': 'Troubleshoot Agent Connectivity',
  'wazuh-recover-v4': 'Recover the Wazuh Agent',
  'wazuh-close-v4': 'Close the Lab Change',
};

function migration(ids: string[]): ConsoleLesson[] {
  return ids.flatMap(migrationParts).map((id) => {
    const lesson = migrationLessons.find((item) => item.id === id);
    if (!lesson) throw new Error(`Unknown pathway lesson: ${id}`);
    const [title, description] = (lesson.separated
      ? [lesson.title, lesson.description!]
      : titles[id]) ?? [
      lesson.title,
      lesson.body
        .split('\n')
        .find((line) => line.trim() && !line.startsWith('#'))!,
    ];
    return {
      id,
      title,
      description:
        welcomeFor(id, 'stepOffset' in lesson && lesson.stepOffset === 21)
          ?.welcome ?? description,
      href: `/migration#lesson=${id}`,
      source: 'migration',
      metadata: lesson.surface,
      steps: [
        'Read the prerequisites and identify the named machine',
        'Follow the lesson actions in your own lab',
        'Compare your evidence with the pass checks',
        'Record the result before marking verified',
      ],
    };
  });
}

function securityLesson(
  lesson: (typeof securityCourse.lessons)[number],
): ConsoleLesson {
  return {
    id: lesson.id,
    title: lesson.title,
    description: lesson.description,
    href: `/security#lesson=${lesson.id}`,
    source: 'security-lab',
    metadata: 'VMware-first / Azure Arc / Defender cost and license gates',
    steps: lesson.steps.map((step) => step.title),
  };
}

function enterpriseLessons(
  course: typeof mecmCourse,
  route: string,
): ConsoleLesson[] {
  return course.lessons.map((lesson) => ({
    id: lesson.id,
    title: lesson.title,
    description: lesson.description,
    href: `${route}#lesson=${lesson.id}`,
    source: 'enterprise',
    metadata: course.baseline,
    steps: lesson.steps.map((step) => step.title),
  }));
}
function standaloneLessons(
  course: typeof mecmCourse,
  route: string,
  source: ConsoleLesson['source'],
): ConsoleLesson[] {
  return enterpriseLessons(course, route).map((lesson) => ({
    ...lesson,
    source,
  }));
}
export const learningPathways: LearningPathway[] = [
  {
    id: 'windows',
    title: 'Windows Server & VMware',
    prerequisite: 'Start here · prepare the private lab',
    sections: [
      {
        title: 'Plan and Prepare',
        lessons: migration(['lab-00', 'lab-01', 'lab-02', 'lab-03']),
      },
      {
        title: 'Create and Install DC01',
        lessons: migration(['lab-04']).filter((l) => l.id !== 'lab-04'),
      },
      {
        title: 'Create and Install DC02',
        lessons: migration(['lab-07']).filter((l) => l.id !== 'lab-07'),
      },
    ],
  },
  {
    id: 'active-directory',
    title: 'Active Directory & DNS',
    prerequisite: 'After the DC01 and DC02 Windows installation labs',
    sections: [
      {
        title: 'Install AD DS and DNS',
        lessons: migration(['lab-04']).filter((l) => l.id === 'lab-04'),
      },
      {
        title: 'Add a Controller and Check Replication',
        lessons: migration(['lab-07']).filter((l) => l.id === 'lab-07'),
      },
      {
        title: 'Manage Users and Group Policy',
        lessons: migration(['lab-05']),
      },
    ],
  },
  {
    id: 'sql',
    title: 'SQL Server',
    prerequisite: 'After Windows / AD · SQL01 needs lab.example.test',
    sections: [
      {
        title: '01 / Install and Recover SQL',
        lessons: migration(['sql-01', 'sql-02', 'sql-03', 'sql-04', 'sql-05']),
      },
      {
        title: '02 / High Availability',
        optional: true,
        lessons: migration(['ha-01', 'ha-02', 'ha-03', 'ha-04', 'ha-05']),
      },
    ],
  },
  {
    id: 'helpdesk',
    title: 'IIS & Help Desk',
    prerequisite: 'After Active Directory · disposable APP01 member server',
    sections: [
      { title: 'Prepare APP01 and IIS', lessons: migration(['lab-06']) },
      {
        title: 'Install and Configure osTicket',
        lessons: standaloneLessons(
          helpdeskCourse,
          '/helpdesk',
          'helpdesk',
        ).slice(0, 8),
      },
      {
        title: 'Operate, Update and Recover',
        lessons: standaloneLessons(
          helpdeskCourse,
          '/helpdesk',
          'helpdesk',
        ).slice(8),
      },
    ],
  },
  {
    id: 'dmz',
    title: 'DMZ & Private IIS Publishing',
    prerequisite:
      'After Windows, VMware and IIS basics · isolated local practice',
    sections: [
      {
        title: '01 / Plan and Build the Network',
        lessons: enterpriseLessons(dmzCourse, '/dmz').slice(0, 3),
      },
      {
        title: '02 / Private IIS and DMZ Proxy',
        lessons: enterpriseLessons(dmzCourse, '/dmz').slice(3, 6),
      },
      {
        title: '03 / Prove Isolation, Recover and Plan Azure',
        lessons: enterpriseLessons(dmzCourse, '/dmz').slice(6),
      },
    ],
  },
  {
    id: 'wsus',
    title: 'WSUS · Windows Updates',
    prerequisite: 'After AD · standalone WSUS01 and a disposable pilot',
    sections: [
      { title: 'Install and Configure WSUS', lessons: migration(['lab-13']) },
      {
        title: 'Computer Groups and Client Policy',
        lessons: enterpriseLessons(wsusCourse, '/wsus').slice(0, 1),
      },
      {
        title: 'Approve Updates and Reboot in Batches',
        lessons: enterpriseLessons(wsusCourse, '/wsus').slice(1, 2),
      },
      {
        title: 'Troubleshoot and Recover',
        lessons: enterpriseLessons(wsusCourse, '/wsus').slice(2),
      },
    ],
  },
  {
    id: 'mecm',
    title: 'MECM · Configuration Manager',
    prerequisite: 'After AD and SQL · evaluation primary site and test clients',
    sections: [
      {
        title: 'Install and Configure the Site',
        lessons: migration(['mecm-01', 'mecm-02', 'mecm-03']),
      },
      {
        title: 'Connect and Troubleshoot Dependencies',
        lessons: migration(['mecm-04']),
      },
      {
        title: 'Build and Enroll a Test Client',
        lessons: enterpriseLessons(mecmCourse, '/mecm').slice(0, 1),
      },
      {
        title: 'Device Collections',
        lessons: enterpriseLessons(mecmCourse, '/mecm').slice(1, 2),
      },
      {
        title: 'Deploy and Remove Software',
        lessons: enterpriseLessons(mecmCourse, '/mecm').slice(2, 3),
      },
      {
        title: 'Heartbeat and Client Health',
        lessons: enterpriseLessons(mecmCourse, '/mecm').slice(3, 4),
      },
      {
        title: 'Compliance Baselines',
        lessons: enterpriseLessons(mecmCourse, '/mecm').slice(4, 5),
      },
      {
        title: 'Daily Operations and Recovery',
        lessons: enterpriseLessons(mecmCourse, '/mecm').slice(5),
      },
      { title: 'Software Update Point', lessons: migration(['mecm-05']) },
    ],
  },
  {
    id: 'azure',
    title: 'Microsoft Azure Foundations',
    prerequisite: 'After Windows / AD · review costs first',
    sections: [
      {
        title: 'Budget and Private Destination',
        lessons: migration(['az-01', 'lab-14', 'lab-15', 'lab-16']),
      },
    ],
  },
  {
    id: 'landing-zone',
    title: 'Azure Landing Zones',
    prerequisite: 'Review Azure costs before creating resources',
    sections: [
      {
        title: 'Plan, Build and Test',
        lessons: standaloneLessons(
          landingZoneCourse,
          '/landing-zone',
          'landing-zone',
        ),
      },
    ],
  },
  {
    id: 'azure-operations',
    title: 'Azure Server Maintenance',
    prerequisite: 'After Azure foundations · protect and pilot before rollout',
    sections: [
      {
        title: 'Backups, Updates and Recovery',
        lessons: standaloneLessons(
          maintenanceCourse,
          '/azure-operations',
          'azure-lab',
        ),
      },
    ],
  },
  {
    id: 'security',
    title: 'Cloud & Endpoint Security',
    prerequisite: 'Review licensing and the lab cost goal first',
    sections: [
      {
        title: 'Endpoint Protection and Defender',
        lessons: securityCourse.lessons.slice(0, 12).map(securityLesson),
      },
      {
        title: 'Optional Licensed Cloud VDI',
        optional: true,
        lessons: securityCourse.lessons.slice(12).map(securityLesson),
      },
    ],
  },
  {
    id: 'migrations',
    title: 'Cloud Migrations',
    prerequisite: 'After Windows, SQL, and Azure foundations',
    sections: [
      {
        title: '01 / Plan the Move',
        lessons: migration(['field-01', 'move-01', 'move-04']),
      },
      {
        title: '02 / Move Between Domains',
        lessons: migration(['lab-08', 'lab-09', 'lab-10', 'lab-11', 'lab-12']),
      },
      {
        title: '03 / Move to Azure',
        lessons: migration([
          'az-02',
          'lab-17',
          'upgrade-01',
          'az-03',
          'move-02',
        ]),
      },
      {
        title: '04 / Verify and Close',
        lessons: migration(['lab-19', 'lab-18', 'lab-20']),
      },
      {
        title: '05 / MECM Migration',
        optional: true,
        lessons: migration(['move-03']),
      },
    ],
  },
  {
    id: 'linux',
    title: 'Linux Administration',
    prerequisite: 'Separate RHEL / Wazuh pathway · Azure subscription required',
    sections: modules
      .filter((module) => module.lessonIds.length)
      .map((module) => ({
        title: module.title,
        lessons: module.lessonIds.map((id) => {
          const lesson = lessons.find((item) => item.id === id)!;
          return {
            id,
            title: linuxTitles[id] ?? lesson.title,
            description: welcomeFor(id)?.welcome ?? lesson.objective,
            href: `/#lesson=${id}`,
            source: 'linux' as const,
            metadata: lesson.shell,
            steps: [
              'Read the task and check the target host',
              'Follow the guided commands in your own lab',
              'Verify the expected output',
              'Record evidence and mark verified',
            ],
          };
        }),
      })),
  },
  {
    id: 'alma',
    title: 'AlmaLinux Desktop Experience',
    prerequisite: 'Day-to-day operations · AlmaLinux 9 GNOME · VMware-first',
    sections: [
      ...new Set(almaCourse.lessons.map((lesson) => lesson.section)),
    ].map((title) => ({
      title,
      lessons: almaCourse.lessons
        .filter((lesson) => lesson.section === title)
        .map((lesson) => ({
          id: lesson.id,
          title: lesson.title,
          description: welcomeFor(lesson.id)?.welcome ?? lesson.description,
          href: `/alma#lesson=${lesson.id}`,
          source: 'alma' as const,
          metadata: 'AlmaLinux 9 / GNOME / your own lab',
          steps: lesson.guide.steps.map((step) => step.title),
        })),
    })),
  },
  {
    id: 'splunk',
    title: 'Splunk Core User',
    prerequisite:
      'Windows practice VM · search, reports, dashboards and alerts',
    sections: [
      {
        title: '01 / Get Ready and Upload Data',
        lessons: enterpriseLessons(splunkCourse, '/splunk').slice(0, 3),
      },
      {
        title: '02 / Search and Explain Results',
        lessons: enterpriseLessons(splunkCourse, '/splunk').slice(3, 9),
      },
      {
        title: '03 / Reports, Dashboards and Lookups',
        lessons: enterpriseLessons(splunkCourse, '/splunk').slice(9, 12),
      },
      {
        title: '04 / Scheduling and Final Investigation',
        lessons: enterpriseLessons(splunkCourse, '/splunk').slice(12, 14),
      },
      {
        title: '05 / Cyber Analyst Investigations and Dashboard Inputs',
        lessons: enterpriseLessons(splunkCourse, '/splunk').slice(14),
      },
    ],
  },
  ...nessusCourses.map((course) => ({
    id: course.id,
    title: course.title,
    prerequisite: course.prerequisite,
    sections: [
      {
        title: 'Guided lessons / in order',
        lessons: course.lessons.map((lesson) => ({
          id: lesson.id,
          title: lesson.title,
          description: lesson.description,
          href: `${nessusCourseHref(course.id)}#lesson=${lesson.id}`,
          source: 'nessus' as const,
          metadata: course.baseline,
          steps: lesson.steps.map((step) => step.title),
        })),
      },
    ],
  })),
];

export const pathwayLessons = (pathway: LearningPathway) =>
  pathway.sections.flatMap((section) => section.lessons);

// Core lesson pagination follows the prerequisite route. Optional extensions
// stay within their own sequence instead of interrupting the core route.
export function lessonSequenceFor(id: string): ConsoleLesson[] {
  if (id.startsWith('dmz-'))
    return pathwayLessons(learningPathways.find((path) => path.id === 'dmz')!);
  if (id.startsWith('splunk-'))
    return pathwayLessons(learningPathways.find((p) => p.id === 'splunk')!);
  if (id.startsWith('lz-'))
    return pathwayLessons(
      learningPathways.find((p) => p.id === 'landing-zone')!,
    );
  if (id.startsWith('mecm-') || id.startsWith('wsus-') || id === 'lab-13')
    return pathwayLessons(
      learningPathways.find(
        (p) => p.id === (id.startsWith('mecm-') ? 'mecm' : 'wsus'),
      )!,
    );
  if (id.startsWith('sec-')) return securityCourse.lessons.map(securityLesson);
  if (
    id.startsWith('helpdesk-') ||
    id.startsWith('nessus-') ||
    id.startsWith('azure-maint-')
  ) {
    const pathway = learningPathways.find((path) =>
      path.sections.some((section) =>
        section.lessons.some((lesson) => lesson.id === id),
      ),
    );
    return pathway
      ? pathwayLessons(pathway).filter((lesson) =>
          id.startsWith('helpdesk-')
            ? lesson.source === 'helpdesk'
            : id.startsWith('azure-maint-')
              ? lesson.source === 'azure-lab'
              : lesson.source === 'nessus',
        )
      : [];
  }
  if (id.startsWith('alma-'))
    return pathwayLessons(learningPathways.find((path) => path.id === 'alma')!);
  const sections = learningPathways
    .filter(
      (pathway) =>
        !['linux', 'alma', 'mecm', 'wsus', 'splunk', 'dmz'].includes(
          pathway.id,
        ) && !pathway.id.startsWith('nessus-'),
    )
    .flatMap((pathway) => pathway.sections)
    .filter((section) =>
      section.lessons.every(
        (lesson) => !['azure-lab', 'landing-zone'].includes(lesson.source),
      ),
    );
  const optional = sections.find(
    (section) =>
      section.optional && section.lessons.some((lesson) => lesson.id === id),
  );
  return (
    optional?.lessons ??
    sections
      .filter((section) => !section.optional)
      .flatMap((section) => section.lessons)
  );
}
