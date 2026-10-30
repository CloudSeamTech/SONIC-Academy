import fs from 'node:fs';
const path = 'content/screenshots/markers.json';
const registry = JSON.parse(fs.readFileSync(path, 'utf8'));
const labels = {
  '/splunk/interface-02.png': [
    'Applications: switch apps.',
    'Splunk bar: settings, messages and help.',
    'Apps bar: search, reports, alerts and dashboards.',
    'Search bar: enter SPL here, not in PowerShell.',
    'Time picker: choose All time for the supplied fixed-date CSV.',
    'How to search: open learning resources.',
    'Workload management: Cloud-only; absent in an Enterprise lab.',
    'Search history: revisit searches after running one.',
  ],
  '/splunk/interface-03.png': [
    'Apps bar: change views.',
    'Search bar: use the lesson’s CloudSeam index and search.',
    'Time picker: controls the events included.',
    'Search actions: manage, share, print or export results.',
    'Results tabs: Events, Statistics or Visualization.',
    'Search mode: Smart, Fast or Verbose.',
    'Timeline: event distribution over time.',
    'Fields sidebar: inspect available fields.',
    'Events viewer: read matching records.',
    'Save As: save a report, alert or dashboard panel.',
  ],
};
for (const [src, entries] of Object.entries(labels)) {
  registry[src] = entries.map((label, i) => ({ number: i + 1, x: 0, y: 0, embedded: true, label }));
}
fs.writeFileSync(path, JSON.stringify(registry, null, 2) + '\n');
