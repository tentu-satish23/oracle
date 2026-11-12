const { spawnSync } = require('child_process');
const fs = require('fs/promises');
const path = require('path');
const os = require('os');
const crypto = require('crypto');

function buildHarnessCode(userCode, testCases, problemSlug) {
  const codeWithoutComments = userCode
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*/g, '');
  const needsListNode = !/\bclass\s+ListNode\b/.test(codeWithoutComments);
  const needsTreeNode = !/\bclass\s+TreeNode\b/.test(codeWithoutComments);

  const listNodeDef = needsListNode ? `
class ListNode {
    public int val;
    public ListNode next;
    public ListNode() {}
    public ListNode(int val) { this.val = val; }
    public ListNode(int val, ListNode next) { this.val = val; this.next = next; }
}
` : '';

  const treeNodeDef = needsTreeNode ? `
class TreeNode {
    public int val;
    public TreeNode left;
    public TreeNode right;
    public TreeNode() {}
    public TreeNode(int val) { this.val = val; }
    public TreeNode(int val, TreeNode left, TreeNode right) {
        this.val = val;
        this.left = left;
        this.right = right;
    }
}
` : '';

  return `
import java.util.*;
import java.lang.reflect.*;

${listNodeDef}
${treeNodeDef}

${userCode}

public class Main {
    public static void main(String[] args) {
        try {
            Scanner sc = new Scanner(System.in);
            StringBuilder sb = new StringBuilder();
            while (sc.hasNextLine()) {
                String l = sc.nextLine();
                if (sb.length() > 0) sb.append("\\n");
                sb.append(l);
            }
            String rawInput = sb.toString().trim();
            Solution solution = new Solution();
            dispatch(solution, rawInput, "${problemSlug}");
        } catch (InvocationTargetException ite) {
            Throwable cause = ite.getCause() != null ? ite.getCause() : ite;
            System.err.println("Runtime Error: " + cause.toString());
            cause.printStackTrace(System.err);
            System.exit(1);
        } catch (Exception e) {
            System.err.println("Execution Error: " + e.toString());
            e.printStackTrace(System.err);
            System.exit(1);
        }
    }

    private static void dispatch(Solution sol, String input, String slug) throws Exception {
        Method targetMethod = null;
        String cleanSlug = slug.replaceAll("[^a-zA-Z0-9]", "").toLowerCase();
        boolean isReverseList = cleanSlug.contains("reverselinkedlist") || cleanSlug.contains("reverselist");

        if (isReverseList) {
            try {
                targetMethod = sol.getClass().getMethod("reverseList", ListNode.class);
            } catch (NoSuchMethodException nsme) {
                // Fall back
            }
        }

        if (targetMethod == null) {
            targetMethod = findSolutionMethod(sol, slug);
        }

        if (targetMethod == null) {
            System.err.println("Error: No public method found in class Solution");
            System.exit(1);
            return;
        }

        Class<?>[] paramTypes = targetMethod.getParameterTypes();

        if (isReverseList && targetMethod.getName().equals("reverseList") && paramTypes.length == 1 && paramTypes[0] == ListNode.class) {
            ListNode head = parseToListNode(input);
            Object result = targetMethod.invoke(sol, new Object[]{ head });
            printFormatted(result, targetMethod.getReturnType());
            return;
        }

        Object[] parsedArgs = parseArguments(input, paramTypes);
        Object result = targetMethod.invoke(sol, parsedArgs);

        if (targetMethod.getReturnType() == void.class) {
            if (parsedArgs.length > 0) {
                printFormatted(parsedArgs[0], parsedArgs[0] != null ? parsedArgs[0].getClass() : void.class);
            } else {
                System.out.println("null");
            }
        } else {
            printFormatted(result, targetMethod.getReturnType());
        }
    }

    private static Method findSolutionMethod(Solution sol, String slug) {
        Method[] methods = sol.getClass().getDeclaredMethods();
        List<Method> candidates = new ArrayList<>();
        for (Method m : methods) {
            if (Modifier.isPublic(m.getModifiers()) &&
                !m.getName().equals("equals") &&
                !m.getName().equals("hashCode") &&
                !m.getName().equals("toString") &&
                !m.isSynthetic()) {
                candidates.add(m);
            }
        }
        if (candidates.isEmpty()) return null;

        String cleanSlug = slug.replaceAll("[^a-zA-Z0-9]", "").toLowerCase();
        for (Method m : candidates) {
            String name = m.getName().toLowerCase();
            if (cleanSlug.contains(name) || name.contains(cleanSlug)) {
                return m;
            }
        }
        return candidates.get(0);
    }

    private static Object[] parseArguments(String input, Class<?>[] types) {
        List<String> rawTokens = splitInputTokens(input, types.length);
        Object[] args = new Object[types.length];

        for (int i = 0; i < types.length; i++) {
            String token = i < rawTokens.size() ? rawTokens.get(i).trim() : "";
            args[i] = parseSingleValue(token, types[i]);
        }
        return args;
    }

    private static List<String> splitInputTokens(String input, int expectedCount) {
        List<String> tokens = new ArrayList<>();
        if (input == null || input.isEmpty()) return tokens;

        if (input.contains(";")) {
            for (String p : input.split(";")) {
                tokens.add(p.trim());
            }
            return tokens;
        }

        if (input.contains("=")) {
            String[] parts = input.split(",\\\\s*(?=[a-zA-Z0-9_]+\\\\s*=)");
            if (parts.length > 1) {
                for (String p : parts) {
                    int eq = p.indexOf('=');
                    tokens.add(eq >= 0 ? p.substring(eq + 1).trim() : p.trim());
                }
                return tokens;
            }
        }

        if (expectedCount > 1) {
            List<String> parts = splitTopLevelCommas(input);
            if (parts.size() == expectedCount) {
                return parts;
            }
        }

        tokens.add(input);
        return tokens;
    }

    private static List<String> splitTopLevelCommas(String s) {
        List<String> res = new ArrayList<>();
        StringBuilder cur = new StringBuilder();
        int bracket = 0, brace = 0;
        boolean inQuote = false;

        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            if (c == '\"') inQuote = !inQuote;
            else if (!inQuote) {
                if (c == '[') bracket++;
                else if (c == ']') bracket--;
                else if (c == '{') brace++;
                else if (c == '}') brace--;
                else if (c == ',' && bracket == 0 && brace == 0) {
                    res.add(cur.toString().trim());
                    cur.setLength(0);
                    continue;
                }
            }
            cur.append(c);
        }
        if (cur.length() > 0) res.add(cur.toString().trim());
        return res;
    }

    private static Object parseSingleValue(String val, Class<?> type) {
        if (val == null) return null;
        val = val.trim();

        if (type == ListNode.class) {
            return parseToListNode(val);
        } else if (type == ListNode[].class) {
            return parseToListNodeArray(val);
        } else if (type == TreeNode.class) {
            return parseToTreeNode(val);
        } else if (type == int[].class) {
            return parseInt1D(val);
        } else if (type == int[][].class) {
            return parseInt2D(val);
        } else if (type == String.class) {
            return parseString(val);
        } else if (type == String[].class) {
            return parseString1D(val);
        } else if (type == int.class || type == Integer.class) {
            if (val.contains("=")) val = val.substring(val.indexOf('=') + 1).trim();
            return Integer.parseInt(val.replaceAll("[^0-9-]", ""));
        } else if (type == long.class || type == Long.class) {
            if (val.contains("=")) val = val.substring(val.indexOf('=') + 1).trim();
            return Long.parseLong(val.replaceAll("[^0-9-]", ""));
        } else if (type == double.class || type == Double.class) {
            if (val.contains("=")) val = val.substring(val.indexOf('=') + 1).trim();
            return Double.parseDouble(val.trim());
        } else if (type == boolean.class || type == Boolean.class) {
            if (val.contains("=")) val = val.substring(val.indexOf('=') + 1).trim();
            return Boolean.parseBoolean(val.trim());
        } else if (type == char.class || type == Character.class) {
            if (val.contains("=")) val = val.substring(val.indexOf('=') + 1).trim();
            String clean = val.replace("'", "").trim();
            return clean.isEmpty() ? ' ' : clean.charAt(0);
        } else if (type == char[].class) {
            String clean = val.replace("[", "").replace("]", "").replace("'", "").replace(",", "").trim();
            return clean.toCharArray();
        }
        return val;
    }

    private static ListNode parseToListNode(String val) {
        if (val == null) return null;
        val = val.trim();
        if (val.contains("=") && !val.startsWith("[") && !val.startsWith("{")) {
            val = val.substring(val.indexOf('=') + 1).trim();
        }
        if (val.isEmpty() || val.equals("null") || val.equals("[]")) {
            return null;
        }
        if (val.startsWith("[") && val.endsWith("]")) {
            val = val.substring(1, val.length() - 1).trim();
        }
        if (val.isEmpty()) return null;

        String[] parts = val.split(",");
        ListNode dummy = new ListNode(0);
        ListNode curr = dummy;
        for (String part : parts) {
            String p = part.trim();
            if (!p.isEmpty() && !p.equals("null")) {
                curr.next = new ListNode(Integer.parseInt(p));
                curr = curr.next;
            }
        }
        return dummy.next;
    }

    private static ListNode[] parseToListNodeArray(String val) {
        if (val == null) return new ListNode[0];
        val = val.trim();
        if (val.contains("=") && !val.startsWith("[") && !val.startsWith("{")) {
            val = val.substring(val.indexOf('=') + 1).trim();
        }
        if (val.isEmpty() || val.equals("[]") || val.equals("null")) {
            return new ListNode[0];
        }
        if (val.startsWith("[")) val = val.substring(1);
        if (val.endsWith("]")) val = val.substring(0, val.length() - 1);
        val = val.trim();
        if (val.isEmpty()) return new ListNode[0];

        List<ListNode> list = new ArrayList<>();
        int start = -1;
        for (int i = 0; i < val.length(); i++) {
            if (val.charAt(i) == '[') start = i;
            else if (val.charAt(i) == ']') {
                if (start != -1) {
                    list.add(parseToListNode(val.substring(start, i + 1)));
                    start = -1;
                }
            }
        }
        return list.toArray(new ListNode[0]);
    }

    private static TreeNode parseToTreeNode(String val) {
        if (val == null) return null;
        val = val.trim();
        if (val.contains("=") && !val.startsWith("[") && !val.startsWith("{")) {
            val = val.substring(val.indexOf('=') + 1).trim();
        }
        if (val.isEmpty() || val.equals("[]") || val.equals("null")) {
            return null;
        }
        if (val.startsWith("[") && val.endsWith("]")) {
            val = val.substring(1, val.length() - 1).trim();
        }
        if (val.isEmpty()) return null;

        String[] parts = val.split(",");
        if (parts.length == 0) return null;
        String rootStr = parts[0].trim();
        if (rootStr.isEmpty() || rootStr.equals("null")) return null;

        TreeNode root = new TreeNode(Integer.parseInt(rootStr));
        Queue<TreeNode> queue = new LinkedList<>();
        queue.offer(root);

        int i = 1;
        while (!queue.isEmpty() && i < parts.length) {
            TreeNode curr = queue.poll();
            if (i < parts.length) {
                String leftVal = parts[i++].trim();
                if (!leftVal.isEmpty() && !leftVal.equals("null")) {
                    curr.left = new TreeNode(Integer.parseInt(leftVal));
                    queue.offer(curr.left);
                }
            }
            if (i < parts.length) {
                String rightVal = parts[i++].trim();
                if (!rightVal.isEmpty() && !rightVal.equals("null")) {
                    curr.right = new TreeNode(Integer.parseInt(rightVal));
                    queue.offer(curr.right);
                }
            }
        }
        return root;
    }

    private static int[] parseInt1D(String val) {
        if (val == null) return new int[0];
        val = val.trim();
        if (val.contains("=") && !val.startsWith("[") && !val.startsWith("{")) {
            val = val.substring(val.indexOf('=') + 1).trim();
        }
        val = val.replace("[", "").replace("]", "").trim();
        if (val.isEmpty()) return new int[0];
        String[] parts = val.split(",");
        List<Integer> list = new ArrayList<>();
        for (String p : parts) {
            String clean = p.trim();
            if (!clean.isEmpty()) {
                list.add(Integer.parseInt(clean));
            }
        }
        int[] arr = new int[list.size()];
        for (int i = 0; i < list.size(); i++) arr[i] = list.get(i);
        return arr;
    }

    private static int[][] parseInt2D(String val) {
        if (val == null) return new int[0][0];
        val = val.trim();
        if (val.contains("=") && !val.startsWith("[") && !val.startsWith("{")) {
            val = val.substring(val.indexOf('=') + 1).trim();
        }
        if (val.startsWith("[")) val = val.substring(1);
        if (val.endsWith("]")) val = val.substring(0, val.length() - 1);
        val = val.trim();
        if (val.isEmpty()) return new int[0][0];

        List<int[]> rows = new ArrayList<>();
        int start = -1;
        for (int i = 0; i < val.length(); i++) {
            if (val.charAt(i) == '[') start = i;
            else if (val.charAt(i) == ']') {
                if (start != -1) {
                    rows.add(parseInt1D(val.substring(start, i + 1)));
                    start = -1;
                }
            }
        }
        return rows.toArray(new int[rows.size()][]);
    }

    private static String parseString(String val) {
        if (val == null) return "";
        val = val.trim();
        if (val.contains("=") && !val.startsWith("\\\"")) {
            val = val.substring(val.indexOf('=') + 1).trim();
        }
        if (val.startsWith("\\\"") && val.endsWith("\\\"") && val.length() >= 2) {
            return val.substring(1, val.length() - 1);
        }
        return val;
    }

    private static String[] parseString1D(String val) {
        if (val == null) return new String[0];
        val = val.trim();
        if (val.contains("=") && !val.startsWith("[")) {
            val = val.substring(val.indexOf('=') + 1).trim();
        }
        if (val.startsWith("[")) val = val.substring(1);
        if (val.endsWith("]")) val = val.substring(0, val.length() - 1);
        val = val.trim();
        if (val.isEmpty()) return new String[0];

        List<String> list = new ArrayList<>();
        StringBuilder cur = new StringBuilder();
        boolean inQuotes = false;
        for (int i = 0; i < val.length(); i++) {
            char c = val.charAt(i);
            if (c == '\"') inQuotes = !inQuotes;
            else if (c == ',' && !inQuotes) {
                String item = cur.toString().trim();
                if (item.startsWith("\\\"") && item.endsWith("\\\"") && item.length() >= 2) {
                    item = item.substring(1, item.length() - 1);
                }
                list.add(item);
                cur.setLength(0);
                continue;
            }
            cur.append(c);
        }
        if (cur.length() > 0) {
            String item = cur.toString().trim();
            if (item.startsWith("\\\"") && item.endsWith("\\\"") && item.length() >= 2) {
                item = item.substring(1, item.length() - 1);
            }
            list.add(item);
        }
        return list.toArray(new String[0]);
    }

    private static String formatListNode(ListNode head) {
        if (head == null) return "[]";
        StringBuilder sb = new StringBuilder("[");
        ListNode curr = head;
        Set<ListNode> visited = new HashSet<>();
        while (curr != null) {
            if (visited.contains(curr)) break;
            visited.add(curr);
            sb.append(curr.val);
            curr = curr.next;
            if (curr != null) sb.append(",");
        }
        sb.append("]");
        return sb.toString();
    }

    private static String formatListNodeArray(ListNode[] lists) {
        if (lists == null || lists.length == 0) return "[]";
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < lists.length; i++) {
            sb.append(formatListNode(lists[i]));
            if (i < lists.length - 1) sb.append(",");
        }
        sb.append("]");
        return sb.toString();
    }

    private static String formatTreeNode(TreeNode root) {
        if (root == null) return "[]";
        List<String> list = new ArrayList<>();
        Queue<TreeNode> queue = new LinkedList<>();
        queue.offer(root);

        while (!queue.isEmpty()) {
            TreeNode curr = queue.poll();
            if (curr != null) {
                list.add(String.valueOf(curr.val));
                queue.offer(curr.left);
                queue.offer(curr.right);
            } else {
                list.add("null");
            }
        }
        int last = list.size() - 1;
        while (last >= 0 && list.get(last).equals("null")) {
            last--;
        }
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i <= last; i++) {
            sb.append(list.get(i));
            if (i < last) sb.append(",");
        }
        sb.append("]");
        return sb.toString();
    }

    private static void printFormatted(Object obj, Class<?> returnType) {
        if (obj == null) {
            if (returnType == ListNode.class || returnType == ListNode[].class || returnType == TreeNode.class) {
                System.out.println("[]");
            } else {
                System.out.println("null");
            }
            return;
        }
        if (obj instanceof ListNode) {
            System.out.println(formatListNode((ListNode) obj));
        } else if (obj instanceof TreeNode) {
            System.out.println(formatTreeNode((TreeNode) obj));
        } else if (obj instanceof ListNode[]) {
            System.out.println(formatListNodeArray((ListNode[]) obj));
        } else if (obj instanceof int[]) {
            System.out.println(Arrays.toString((int[]) obj).replaceAll("\\\\s+", ""));
        } else if (obj instanceof boolean[]) {
            System.out.println(Arrays.toString((boolean[]) obj).replaceAll("\\\\s+", ""));
        } else if (obj instanceof char[]) {
            System.out.println(Arrays.toString((char[]) obj).replaceAll("\\\\s+", ""));
        } else if (obj instanceof int[][]) {
            System.out.println(Arrays.deepToString((int[][]) obj).replaceAll("\\\\s+", ""));
        } else if (obj instanceof Object[]) {
            System.out.println(Arrays.deepToString((Object[]) obj).replaceAll("\\\\s+", ""));
        } else if (obj instanceof List) {
            System.out.println(obj.toString().replaceAll("\\\\s+", ""));
        } else {
            System.out.println(obj.toString());
        }
    }
}
`;
}

async function runTest(name, userCode, slug, tests) {
  const javac = 'C:\\Program Files\\Java\\jdk-17.0.20.1\\bin\\javac.exe';
  const java = 'C:\\Program Files\\Java\\jdk-17.0.20.1\\bin\\java.exe';
  const tempDir = path.join(os.tmpdir(), `oracle_t_${crypto.randomBytes(4).toString('hex')}`);
  await fs.mkdir(tempDir, { recursive: true });

  const fullSource = buildHarnessCode(userCode, tests, slug);
  await fs.writeFile(path.join(tempDir, 'Main.java'), fullSource, 'utf8');

  const compile = spawnSync(javac, ['Main.java'], { cwd: tempDir, encoding: 'utf8' });
  if (compile.status !== 0) {
    console.error(`[${name}] Compilation failed:`, compile.stderr);
    await fs.rm(tempDir, { recursive: true, force: true });
    return false;
  }

  let allPassed = true;
  for (const t of tests) {
    const run = spawnSync(java, ['-Xmx128m', 'Main'], {
      cwd: tempDir,
      input: t.input,
      encoding: 'utf8'
    });
    const output = (run.stdout || '').trim();
    const passed = output === t.expected;
    console.log(`[${name}] "${t.input}" -> Got: "${output}", Expected: "${t.expected}", Pass: ${passed}`);
    if (!passed) allPassed = false;
  }

  await fs.rm(tempDir, { recursive: true, force: true });
  return allPassed;
}

async function main() {
  console.log('=== TEST 1: Two Sum (int[], int -> int[]) ===');
  await runTest('Two Sum', `
class Solution {
    public int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int comp = target - nums[i];
            if (map.containsKey(comp)) return new int[]{ map.get(comp), i };
            map.put(nums[i], i);
        }
        return new int[0];
    }
}
`, 'two-sum', [
    { input: '[2,7,11,15];9', expected: '[0,1]' },
    { input: 'nums = [3,2,4], target = 6', expected: '[1,2]' }
  ]);

  console.log('\n=== TEST 2: Valid Anagram (String, String -> boolean) ===');
  await runTest('Anagram', `
class Solution {
    public boolean isAnagram(String s, String t) {
        if (s.length() != t.length()) return false;
        int[] counts = new int[26];
        for (char c : s.toCharArray()) counts[c - 'a']++;
        for (char c : t.toCharArray()) {
            if (--counts[c - 'a'] < 0) return false;
        }
        return true;
    }
}
`, 'valid-anagram', [
    { input: 'anagram;nagaram', expected: 'true' },
    { input: 'rat;car', expected: 'false' }
  ]);

  console.log('\n=== TEST 3: Invert Binary Tree (TreeNode -> TreeNode) ===');
  await runTest('Invert Tree', `
class Solution {
    public TreeNode invertTree(TreeNode root) {
        if (root == null) return null;
        TreeNode left = invertTree(root.left);
        TreeNode right = invertTree(root.right);
        root.left = right;
        root.right = left;
        return root;
    }
}
`, 'invert-binary-tree', [
    { input: '[4,2,7,1,3,6,9]', expected: '[4,7,2,9,6,3,1]' },
    { input: '[]', expected: '[]' }
  ]);

  console.log('\n=== TEST 4: Merge K Sorted Lists (ListNode[] -> ListNode) ===');
  await runTest('Merge K Lists', `
class Solution {
    public ListNode mergeKLists(ListNode[] lists) {
        PriorityQueue<ListNode> pq = new PriorityQueue<>((a, b) -> a.val - b.val);
        for (ListNode l : lists) {
            if (l != null) pq.offer(l);
        }
        ListNode dummy = new ListNode(0);
        ListNode curr = dummy;
        while (!pq.isEmpty()) {
            ListNode node = pq.poll();
            curr.next = node;
            curr = curr.next;
            if (node.next != null) pq.offer(node.next);
        }
        return dummy.next;
    }
}
`, 'merge-k-sorted-lists', [
    { input: '[[1,4,5],[1,3,4],[2,6]]', expected: '[1,1,2,3,4,4,5,6]' },
    { input: '[]', expected: '[]' }
  ]);

  console.log('\n=== TEST 5: Matrix Problem (int[][]) ===');
  await runTest('Matrix Transpose', `
class Solution {
    public int[][] transpose(int[][] matrix) {
        int m = matrix.length, n = matrix[0].length;
        int[][] res = new int[n][m];
        for (int i = 0; i < m; i++) {
            for (int j = 0; j < n; j++) {
                res[j][i] = matrix[i][j];
            }
        }
        return res;
    }
}
`, 'transpose-matrix', [
    { input: '[[1,2,3],[4,5,6]]', expected: '[[1,4],[2,5],[3,6]]' }
  ]);
}

main();
