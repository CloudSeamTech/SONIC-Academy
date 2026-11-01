import fs from 'node:fs';
import teaching from '../content/bicep/teaching.json' with { type: 'json' };

// Called after initial course generation; also safe to run independently.
// Lesson IDs, three-step progress positions, source examples and compiler stay intact.
export function refineBicepTeaching() {
  const path = 'content/bicep/course.json';
  const course = JSON.parse(fs.readFileSync(path, 'utf8'));
  for (const lesson of course.lessons) {
    const text = teaching[lesson.id];
    if (!text) throw new Error(`Missing beginner teaching: ${lesson.id}`);
    lesson.what = text.scenario;
    lesson.description = text.scenario;
    lesson.why = text.why;
    lesson.steps[0].title = 'Find the parts you will use';
    lesson.steps[0].actions = [text.focus];
    lesson.steps[0].expected =
      'You can identify the named fields in the example before changing them.';
    lesson.steps[2].title = 'Check the result yourself';
    lesson.steps[2].actions = [
      text.proof,
      'In your private notebook, write what you changed and what stayed fixed. Use dummy values; exclude secrets.',
    ];
    for (const step of lesson.steps) {
      step.guide = {
        what: step.title,
        why: text.why,
        verify: step.expected,
        failure:
          'Read the first compiler diagnostic. Return to the named file and line, correct one change, and compile again. For local commands, confirm Get-Location and save the file first.',
      };
    }
    if (lesson.id === 'bicep-handoff') {
      lesson.steps[2].title = 'Try a check that blocks a mistake';
      lesson.steps[2].where =
        'Your Windows workstation → VS Code → new CloudSeam-Bicep-CI folder → PowerShell';
      lesson.steps[2].actions = [
        'Open the CI security mini-lab below. Create a separate CloudSeam-Bicep-CI folder in Documents; open it with VS Code → File → Open Folder.',
        "Create main.bicep. Type param greeting string = 'Hello, team' on line 1 and output message string = greeting on line 2. Save with Ctrl+S.",
        'Open the practice linter configuration below. Create bicepconfig.json beside main.bicep and type its JSON; keep each rule’s level set to error. Save it.',
        'Select Terminal → New Terminal → PowerShell. Type Get-Location and confirm CloudSeam-Bicep-CI, then type az bicep build --file .\\main.bicep. Expect main.json without a build error.',
        "Add param unusedName string = 'practice' as a new line in main.bicep. Save, then run the same build command. Expect no-unused-params to fail the build.",
        'Delete only the unusedName line, save and build again. Expect that error to disappear. Keep the failed and repaired results in your private notebook.',
        'Read the compile-only workflow example below. The optional hosted-run section in the mini-lab shows its exact .github/workflows/ci-check.yml location and Actions → Run workflow route. No Azure sign-in or deployment is included.',
      ];
      lesson.steps[2].guide.what = lesson.steps[2].title;
      lesson.steps[2].screenshot = {
        status: 'capture-needed',
        title: 'Local CI rule: failed build, then repaired build',
        instructions:
          'Capture the actual unused-input diagnostic and repaired local build. No CI execution screenshot is supplied yet.',
      };
      lesson.steps[0].screenshot = {
        status: 'capture-needed',
        title: 'Compile-only CI workflow',
        instructions:
          'Capture the practice workflow after its hosted run; do not substitute an Azure deployment screenshot.',
      };
      lesson.steps[2].downloads = [
        {
          title: 'Open the beginner CI security mini-lab',
          href: '/bicep/ci-security-lab.md',
        },
        {
          title: 'Download the practice linter configuration',
          href: '/bicep/bicepconfig.json',
        },
        {
          title: 'Download the compile-only GitHub workflow example',
          href: '/bicep/ci-check.yml',
        },
      ];
      lesson.steps[2].expected =
        'An unused input fails the configured local build; removing it allows compilation. Your notes distinguish compile-only CI from a separately approved Azure deployment.';
      lesson.steps[2].guide.verify = lesson.steps[2].expected;
      lesson.steps[2].sources = [
        'https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/linter',
        'https://docs.github.com/en/actions/reference/security/secure-use',
        'https://learn.microsoft.com/en-us/devops/deliver/iac-github-actions',
      ];
    }
  }
  fs.writeFileSync(path, JSON.stringify(course, null, 2) + '\n');
}
if (
  process.argv[1]?.replaceAll('\\', '/').endsWith('/refine-bicep-teaching.mjs')
)
  refineBicepTeaching();
