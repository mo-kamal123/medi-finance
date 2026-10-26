import assert from 'node:assert/strict';
import test from 'node:test';
import { getNextChequeStatus } from './cheque-status.js';

for (const [type, labels] of [
  [0, ['تم الاستلام', 'تحت التحصيل', 'تم التحصيل', 'مرفوض', 'مرتد']],
  [1, ['تم الإصدار', 'تم الصرف', 'مرفوض', 'مرتد']],
]) {
  test('advances every transition for cheque type ' + type + ' regardless of API order', () => {
    const options = labels.map((label, i) => ({ label, value: String(i + 10) })).reverse();
    for (let i = 0; i < labels.length - 1; i++) {
      const next = getNextChequeStatus(options, { statusID: i + 10 }, type);
      assert.equal(next.label, labels[i + 1]);
      assert.equal(next.value, String(i + 11));
    }
    assert.equal(getNextChequeStatus(options, { statusID: labels.length + 9 }, type), null);
  });
}

test('supports Arabic label fallback and hamza variations', () => {
  const options = [{ label: 'تحت التحصيل', value: '20' }];
  assert.equal(getNextChequeStatus(options, { statusNameAr: 'تم الإستلام' }, 0)?.value, '20');
});

test('does not offer unknown transitions, missing statuses, or invalid IDs', () => {
  assert.equal(getNextChequeStatus([], { statusNameAr: 'تم الاستلام' }, 0), null);
  assert.equal(getNextChequeStatus([{ label: 'تحت التحصيل', value: 'undefined' }], { statusNameAr: 'تم الاستلام' }, 0), null);
  assert.equal(getNextChequeStatus([{ label: 'تحت التحصيل', value: '20' }], { statusNameAr: 'غير معروف' }, 0), null);
});
