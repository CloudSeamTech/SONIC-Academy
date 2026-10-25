import { migrationCurriculum, type CurriculumLesson } from './migration-curriculum.ts';

export type MigrationLesson = CurriculumLesson;

export type MigrationStage = {
  id: string;
  title: string;
  plainEnglish: string;
  lessonIds: string[];
};

const stageDefinitions = [
  [
    'orient',
    'Start Here: See the Windows Migration Lab',
    'Choose the safe training route and learn what every named Windows machine does.',
  ],
  [
    'source',
    'Build the Agency Windows Domain',
    'Create DC01, the agency users and policy, APP01, and the optional second domain controller.',
  ],
  [
    'destination',
    'Build the Destination Domain and Move APP01',
    'Create DEST-DC01, connect DNS, transfer the test policy, move APP01, and prove rollback.',
  ],
  [
    'sql',
    'Build SQL01 and Practice Database Recovery',
    'Install SQL Server on SQL01, create understandable practice data, and prove backup and restore.',
  ],
  [
    'mecm',
    'Build the MECM Configuration Manager Lab',
    'Prepare MECM01, connect Active Directory and SQL, install the evaluation site, and test a client.',
  ],
  [
    'migration-methods',
    'Choose the Correct Move for Each Workload',
    'Decide how Windows domains, SQL databases, and MECM environments move without treating them as the same job.',
  ],
  [
    'azure-foundation',
    'Build the Azure Windows Destination',
    'Set the cost boundary, create AZ-DC01, prove private networking, and rehearse the first migration wave.',
  ],
  [
    'azure-move',
    'Move the Practice SQL Database to Azure',
    'Choose supported migration tooling, restore the practice database, validate it, and stop resources safely.',
  ],
  [
    'availability',
    'Add Optional SQL High Availability',
    'Prepare SQL01 and SQL02, create the Azure cloud witness, prove quorum, and protect the budget.',
  ],
  [
    'closeout',
    'Troubleshoot, Prove, and Hand Off the Migration',
    'Use the decision tree, interview drill, cleanup steps, and field handoff questions to close the work.',
  ],
] as const;

export const migrationLessons: MigrationLesson[] = migrationCurriculum;

export const migrationStages: MigrationStage[] = stageDefinitions.map(
  ([id, title, plainEnglish]) => ({
    id,
    title,
    plainEnglish,
    lessonIds: migrationLessons
      .filter((lesson) => lesson.stageId === id)
      .map((lesson) => lesson.id),
  }),
);

export const migrationTasks = [
  {
    id: 'choose-windows-lab-route',
    title: 'Choose the Windows migration lab you will build',
    description:
      'Start at LAB 00, choose the core or optional route, record your available RAM, and set the Azure spending limit.',
    lessonId: 'lab-00',
    state: 'available',
    machine: 'Windows workstation · course workspace',
  },
  {
    id: 'build-agency-domain-controller',
    title: 'Build DC01 and create lab.example.test',
    description:
      'Create the first Windows Server VM, give it the approved private address, install AD DS, and promote it safely.',
    lessonId: 'lab-04',
    state: 'available',
    machine: 'DC01 · Windows Server 2019',
  },
  {
    id: 'build-app01',
    title: 'Build APP01, join lab.example.test, and install IIS',
    description:
      'Create the exact member server that will later move to the destination domain and prove its test website and policy.',
    lessonId: 'lab-06',
    state: 'available',
    machine: 'APP01 · Windows Server 2019',
  },
  {
    id: 'build-destination-domain-controller',
    title: 'Build DEST-DC01 and create migrate.lab.example.test',
    description:
      'Create the new Windows identity environment before moving DNS, policy, or the APP01 workload.',
    lessonId: 'lab-08',
    state: 'available',
    machine: 'DEST-DC01 · Windows Server 2019',
  },
  {
    id: 'move-app01',
    title: 'Move APP01 from lab.example.test to migrate.lab.example.test',
    description:
      'Prove the before state, change the domain membership, verify the new identity and policy, and retain a rollback path.',
    lessonId: 'lab-11',
    state: 'available',
    machine: 'APP01 + DEST-DC01',
  },
  {
    id: 'build-sql01',
    title: 'Build SQL01 and prove backup and restore',
    description:
      'Choose the approved installer, install SQL Server, create a practice database, and produce real recovery evidence.',
    lessonId: 'sql-01',
    state: 'available',
    machine: 'SQL01 · Windows Server + SQL Server',
  },
  {
    id: 'build-mecm01',
    title: 'Build the MECM01 primary-site lab',
    description:
      'Prepare the Windows roles, connect Active Directory and SQL, install the evaluation site, and test a managed client.',
    lessonId: 'mecm-01',
    state: 'available',
    machine: 'MECM01 · Configuration Manager lab',
  },
  {
    id: 'build-azure-windows-destination',
    title: 'Build AZ-DC01 as the private Azure destination',
    description:
      'Set the budget first, create the Windows VM carefully, and prove private connectivity before migration work.',
    lessonId: 'lab-14',
    state: 'available',
    machine: 'Azure Portal + AZ-DC01',
  },
  {
    id: 'move-sql-database-to-azure',
    title: 'Restore the practice SQL database in Azure',
    description:
      'Use the .bak workflow, validate the database separately from the server, and stop paid resources after proof.',
    lessonId: 'az-01',
    state: 'available',
    machine: 'Azure SQL training destination',
  },
  {
    id: 'troubleshoot-windows-migration',
    title: 'Troubleshoot a failed Windows migration step',
    description:
      'Start with the exact symptom, follow the evidence tree, preserve rollback, and document the handoff.',
    lessonId: 'lab-19',
    state: 'available',
    machine: 'Named failed system · evidence first',
  },
] as const;

export const migrationLessonById = (id: string | null) =>
  migrationLessons.find((lesson) => lesson.id === id);

export const migrationStageFor = (lessonId: string) =>
  migrationStages.find((stage) => stage.lessonIds.includes(lessonId));
