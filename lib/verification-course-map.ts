/** Configuration evidence is not proof that every UI action was followed. */
export const dc01LessonCoverage = [
  {
    step: 1,
    title: 'Open Add Roles and Features',
    checks: [],
    note: 'Opening a wizard leaves no configuration fact this collector can prove. Keep your screenshot.',
  },
  {
    step: 2,
    title: 'Select the local destination server',
    checks: [],
    note: 'The hostname check confirms the report’s target; it cannot prove the earlier wizard selection.',
  },
  {
    step: 3,
    title: 'Select AD DS and its tools',
    checks: [],
    note: 'This pack does not inventory every management tool. Keep the role-selection screenshot.',
  },
  {
    step: 4,
    title: 'Install the role',
    checks: ['roles'],
    note: 'Checks installed AD DS and DNS role state, not the installation log or click history.',
  },
  {
    step: 5,
    title: 'Choose the correct promotion operation',
    checks: [],
    note: 'A domain match alone cannot prove whether you chose a new forest or an existing forest.',
  },
  {
    step: 6,
    title: 'Set controller options and DSRM',
    checks: [],
    note: 'Recovery passwords stay private. This pack never requests or tests your DSRM password.',
  },
  {
    step: 7,
    title: 'Review DNS and additional options',
    checks: [],
    note: 'The DNS checks below inspect selected results, not every wizard option or delegation setting.',
  },
  {
    step: 8,
    title: 'Keep the default AD paths',
    checks: [],
    note: 'Database, log and SYSVOL path verification is not included in this pack yet.',
  },
  {
    step: 9,
    title: 'Check prerequisites before promotion',
    checks: [],
    note: 'Keep your prerequisite-check evidence. A later running DC does not prove the earlier warning list.',
  },
  {
    step: 10,
    title: 'Promote and wait for restart',
    checks: ['promotion', 'identity', 'services'],
    note: 'Checks the current promoted DC identity and service states; it does not reconstruct restart history.',
  },
  {
    step: 11,
    title: 'Verify the directory',
    checks: [
      'promotion',
      'identity',
      'shares',
      'dns-client',
      'dns-registration',
    ],
    note: 'Checks this subset of directory facts. Replication and wider AD health need separate checks.',
  },
] as const;
