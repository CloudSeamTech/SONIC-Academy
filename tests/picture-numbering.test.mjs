import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const markers = JSON.parse(fs.readFileSync(new URL('../content/screenshots/markers.json', import.meta.url)));
test('Every registered picture has a complete, unique numbered explanation sequence', () => {
  for (const [src, points] of Object.entries(markers)) {
    assert.ok(points.length, src);
    assert.deepEqual(points.map(p => p.number), points.map((_, i) => i + 1), src);
    for (const point of points) {
      assert.ok(point.label.trim().length > 8, src);
      assert.ok(point.x >= 0 && point.x <= 100 && point.y >= 0 && point.y <= 100, src);
    }
  }
});
test('Untouched vendor pictures explain every baked-in marker', () => {
  assert.equal(markers['/splunk/interface-02.png'].length, 8);
  assert.equal(markers['/splunk/interface-03.png'].length, 10);
  for (const src of ['/splunk/interface-02.png', '/splunk/interface-03.png']) assert.ok(markers[src].every(p => p.embedded));
});
