import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {
  promptFor,
  terminalLines,
  contextFor,
} from '../lib/terminal-presentation.ts';
import { readPassport, passportKey, validIPv4 } from '../lib/lab-passport.ts';
import { brandForCourse } from '../lib/course-brands.ts';
import { learningPathways, pathwayLessons } from '../app/learning-pathways.ts';
const bash = {
  shell: 'bash',
  directory: '~',
  user: 'learner',
  host: 'alma-lab01',
  privilege: 'user',
};
test('SFTP prompt takes precedence over its outer Windows terminal', () => {
  const context = contextFor('Windows PowerShell · sftp> prompt');
  assert.equal(context.shell, 'sftp');
  assert.equal(context.directory, '<remote-pwd>');
  assert.equal(promptFor(context), 'sftp>');
  const command = 'pwd\nlpwd\ncd /uploads';
  assert.equal(terminalLines(command, context).map(line => line.text).join('\n'), command);
});
test('terminal examples preserve real shell symbols and unchanged executable input', () => {
  assert.equal(promptFor(bash), '[learner@alma-lab01 ~]$');
  assert.equal(
    promptFor({ ...bash, privilege: 'root', directory: '/etc/nginx' }),
    '[root@alma-lab01 /etc/nginx]#',
  );
  const command =
    'cd "$HOME/sonic-admin"\npwd\nprintf "# %s\\n" "$HOME" > practice/result.txt';
  const lines = terminalLines(command, bash);
  assert.equal(lines[1].prompt, '[learner@alma-lab01 ~/sonic-admin]$');
  assert.equal(lines.map((line) => line.text).join('\n'), command);
  assert.equal(
    terminalLines('sudo nginx -t\nwhoami', bash)[1].prompt,
    '[learner@alma-lab01 ~]$',
  );
  assert.equal(
    terminalLines('sudo -i\nwhoami', bash)[1].prompt,
    '[root@alma-lab01 ~]#',
  );
  assert.equal(contextFor('Splunk Web → Search'), null);
});
test('here-documents and PowerShell show continuation prompts, not fake commands', () => {
  const lines = terminalLines(
    "sudo tee /tmp/example <<'EOF'\nhello $HOME\nEOF\npwd",
    bash,
  );
  assert.deepEqual(
    lines.map((line) => line.prompt),
    ['[learner@alma-lab01 ~]$', '>', '>', '[learner@alma-lab01 ~]$'],
  );
  const ps = {
    ...bash,
    shell: 'powershell',
    directory: 'C:\\Users\\Administrator',
  };
  assert.equal(
    terminalLines('Set-Location $HOME\nGet-Location', ps)[1].prompt,
    'PS C:\\Users\\Administrator>',
  );
  assert.deepEqual(
    terminalLines("$s = @'\nhello\n'@\n$s", ps).map((line) => line.prompt),
    [
      'PS C:\\Users\\Administrator>',
      '>>',
      '>>',
      'PS C:\\Users\\Administrator>',
    ],
  );
});
test('Lab Passport is versioned, account scoped, bounded and does not accept secret fields', () => {
  assert.notEqual(passportKey(), passportKey('user-a'));
  assert.notEqual(passportKey('user-a'), passportKey('user-b'));
  assert.deepEqual(readPassport('{broken').environments, {});
  assert.deepEqual(
    readPassport('{"version":2,"environments":{"linux":{}}}').environments,
    {},
  );
  const value = readPassport(
    JSON.stringify({
      version: 1,
      environments: {
        linux: {
          hostname: 'alma01',
          ipv4: '192.168.211.128',
          password: 'never-store',
          directory: '/home/me',
        },
      },
    }),
  );
  assert.equal(value.environments.linux.hostname, 'alma01');
  assert.equal('password' in value.environments.linux, false);
  assert.equal(validIPv4('192.168.211.128'), true);
  assert.equal(validIPv4('256.0.0.1'), false);
  assert.equal(validIPv4('192.168.1'), false);
  assert.equal(validIPv4(''), true);
});
test('original Linux lesson order and all Daily Admin executable commands are retained', () => {
  const original = JSON.parse(
    fs.readFileSync('content/teaching/original-linux-order.json', 'utf8'),
  );
  assert.deepEqual(
    pathwayLessons(learningPathways.find((p) => p.id === 'linux')).map(
      (l) => l.id,
    ),
    original,
  );
  const course = JSON.parse(
    fs.readFileSync('content/linux-admin/course.json', 'utf8'),
  );
  const contract = JSON.parse(
    fs.readFileSync('content/teaching/daily-command-contract.json', 'utf8'),
  );
  for (const lesson of course.lessons)
    lesson.steps.forEach((step, index) => {
      assert.equal(
        crypto
          .createHash('sha256')
          .update(step.command ?? '')
          .digest('hex'),
        contract[`${lesson.id}:${index}`],
      );
      assert.ok(step.terminal.directory && step.terminal.host);
    });
});
test('card artwork and zipper favicons exist without changing vendor proportions or executable assets', () => {
  const sources = JSON.parse(
    fs.readFileSync('public/vendor-logos/sources.json', 'utf8'),
  );
  for (const path of learningPathways) {
    const brand = brandForCourse(path.id);
    if (!brand) continue;
    const asset = sources.assets.find((a) => a.id === brand.id);
    assert.ok(asset, brand.id);
    const data = fs.readFileSync(`public/vendor-logos/${brand.id}.svg`);
    assert.equal(
      crypto.createHash('sha256').update(data).digest('hex'),
      asset.sha256,
    );
    assert.doesNotMatch(data.toString(), /<script|foreignObject/i);
  }
  for (const size of [32, 64, 180, 192, 512])
    assert.ok(fs.statSync(`public/cloudseam-icon-${size}.png`).size > 100);
  assert.match(
    fs.readFileSync('public/favicon.svg', 'utf8'),
    /data:image\/png;base64/,
  );
});
