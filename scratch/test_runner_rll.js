import { executeJavaCode } from '../server/src/services/javaRunner.js';

async function testReverseLinkedList() {
  const userCode = `
/**
 * Definition for singly-linked list.
 * public class ListNode {
 *     int val;
 *     ListNode next;
 *     ListNode() {}
 *     ListNode(int val) { this.val = val; }
 *     ListNode(int val, ListNode next) { this.val = val; this.next = next; }
 * }
 */
class Solution {
    public ListNode reverseList(ListNode head) {
        ListNode prev = null;
        ListNode curr = head;
        while (curr != null) {
            ListNode next = curr.next;
            curr.next = prev;
            prev = curr;
            curr = next;
        }
        return prev;
    }
}
`;

  const testCases = [
    { input: '[1,2,3,4,5]', expectedOutput: '[5,4,3,2,1]', isHidden: false },
    { input: '[]', expectedOutput: '[]', isHidden: false },
    { input: '[1]', expectedOutput: '[1]', isHidden: false },
    { input: '[1,2]', expectedOutput: '[2,1]', isHidden: false }
  ];

  console.log('Testing Reverse Linked List through javaRunner.js:');
  const result = await executeJavaCode(userCode, testCases, 'reverse-linked-list');
  console.log('Result Status:', result.status);
  console.log('Passed Tests:', result.passedTests, '/', result.totalTests);
  console.log('Runtime:', result.runtime, 'ms');
  console.log('Test Results:');
  for (const tr of result.testResults) {
    console.log(`  Case ${tr.caseNumber}: input="${tr.input}" expected="${tr.expectedOutput}" actual="${tr.actualOutput}" passed=${tr.passed}`);
  }

  if (result.status !== 'Accepted') {
    console.error('FAILED! Error message:', result.errorMessage);
    process.exit(1);
  } else {
    console.log('ALL TESTS PASSED WITH ACCEPTED STATUS!');
  }
}

testReverseLinkedList().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
