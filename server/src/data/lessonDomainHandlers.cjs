/**
 * OOP'S ORACLE - Domain Knowledge Engine (35+ Detailed Java Domains)
 * Every domain provides:
 * - introduction, definition, explanation, importantConcepts, syntax
 * - 3 distinct, runnable Java code examples with terminal outputs
 * - realWorldExample
 * - 2 commonMistakes with badCode and goodCode
 * - 2 interviewQuestions with detailed technical answers
 * - 1 practiceProblem with starterCode, solution, and testCases
 * - summary and keyPoints
 * - checkpoint quiz
 */

const DOMAIN_DATA = {
  // ── 1. PRIMITIVE VS REFERENCE TYPES ─────────────────────────────────────────
  primitive_vs_reference: (topic, pfx) => ({
    introduction: `Understanding the divide between primitive types and reference types is essential to mastering Java's memory footprint and performance. In this lesson on **${topic}**, we inspect how the JVM allocates primitives on thread stacks while storing reference objects on the heap.`,
    definition: `**Primitive types** store their actual binary values directly in memory (stack frames or object fields), whereas **reference types** store memory addresses pointing to objects allocated in the Java Heap.`,
    explanation: `Memory allocation and lifecycle in Java:
1. **Stack Memory for Primitives:** Local primitive variables (like \`int x = 42;\`) hold the raw 32-bit pattern directly in the active thread's stack frame. When the method returns, memory is reclaimed instantly without GC overhead.
2. **Heap Memory for Reference Types:** Reference variables (like \`String s = "Java";\` or \`User u = new User();\`) hold a 32-bit or 64-bit object pointer. The object header, instance variables, and metadata live on the Java Heap.
3. **Pass-by-Value Invariant:** Java is STRICTLY pass-by-value. Passing a primitive copies the value; passing an object copies the reference pointer, not the object itself.
4. **Default Values:** Instance fields receive defaults (\`0\`, \`0.0\`, \`false\`, \`null\`). Local variables have no defaults and MUST be initialized before reading.`,
    importantConcepts: [
      'Java provides exactly 8 primitive types: byte, short, int, long, float, double, char, boolean.',
      'Primitives cannot be null; reference variables default to null.',
      'Primitives cannot be used as type arguments in Java Generics (requires wrapper types).',
      'Passing an object to a method passes a copy of the reference pointer, allowing state mutation of the same heap object.'
    ],
    syntax: `// Primitive declaration (Stack allocated value)
int score = 95;
boolean isActive = true;

// Reference declaration (Pointer on stack -> Object on heap)
String title = new String("OOP Oracle");
int[] numbers = new int[]{1, 2, 3};`,
    codeExamples: [
      {
        title: 'Example 1: Stack vs Heap Memory Allocation',
        description: 'Demonstrating how primitives hold values while references point to heap instances.',
        code: `public class ${pfx}_Ex1 {
    public static void main(String[] args) {
        int a = 10;
        int b = a; // Value copy
        b = 20;
        System.out.println("Primitive a: " + a + ", b: " + b); // a remains 10

        int[] refA = {10};
        int[] refB = refA; // Reference pointer copy
        refB[0] = 20;
        System.out.println("Reference refA[0]: " + refA[0] + ", refB[0]: " + refB[0]); // Both 20!
    }
}`,
        output: `Primitive a: 10, b: 20
Reference refA[0]: 20, refB[0]: 20`
      },
      {
        title: 'Example 2: Java Pass-By-Value Mechanics Demystified',
        description: 'Proves that reassigning an object reference inside a method does NOT affect the caller\'s reference.',
        code: `class Box { int val; Box(int v) { this.val = v; } }

public class ${pfx}_Ex2 {
    static void modify(int primitiveVal, Box refObj) {
        primitiveVal = 999;
        refObj.val = 500; // Mutates heap state
        refObj = new Box(777); // Reassigning local pointer has no effect outside!
    }

    public static void main(String[] args) {
        int num = 50;
        Box myBox = new Box(100);
        modify(num, myBox);
        System.out.println("num after method: " + num);
        System.out.println("myBox.val after method: " + myBox.val);
    }
}`,
        output: `num after method: 50
myBox.val after method: 500`
      },
      {
        title: 'Example 3: Nullability and Default Field Values',
        description: 'Shows that instance fields receive zero/null defaults while uninitialized local variables cause compile errors.',
        code: `public class ${pfx}_Ex3 {
    int defaultInt;
    boolean defaultBool;
    String defaultRef;

    public static void main(String[] args) {
        ${pfx}_Ex3 demo = new ${pfx}_Ex3();
        System.out.println("Field default int: " + demo.defaultInt);
        System.out.println("Field default boolean: " + demo.defaultBool);
        System.out.println("Field default reference: " + demo.defaultRef);
    }
}`,
        output: `Field default int: 0
Field default boolean: false
Field default reference: null`
      }
    ],
    realWorldExample: `High-frequency trading (HFT) platforms use flat primitive arrays (\`long[]\`, \`double[]\`) instead of collections of objects to eliminate object header overhead (16 bytes per object) and maximize CPU cache line L1/L2 hits.`,
    commonMistakes: [
      {
        title: 'Assuming Java Has Pass-By-Reference',
        description: 'Java never passes objects by reference; it passes the reference pointer by value.',
        badCode: 'void swap(Box a, Box b) { Box t = a; a = b; b = t; } // Does nothing outside!',
        goodCode: 'void swapValues(Box a, Box b) { int t = a.val; a.val = b.val; b.val = t; }'
      },
      {
        title: 'Reading Uninitialized Local Variables',
        description: 'Unlike instance fields, local variables are not given default values and trigger compiler errors.',
        badCode: 'int count; System.out.println(count); // Compile error: variable might not have been initialized',
        goodCode: 'int count = 0; System.out.println(count); // Initialized explicitly'
      }
    ],
    interviewQuestions: [
      {
        question: 'Is Java strictly pass-by-value or pass-by-reference?',
        answer: 'Java is strictly pass-by-value. When an argument is passed to a method, a copy of the actual variable bits is passed. For primitives, the bit pattern represents the numeric value; for reference types, the bit pattern represents the memory pointer address.'
      },
      {
        question: 'What is the memory overhead of a Java object compared to a primitive int?',
        answer: 'A primitive int occupies exactly 4 bytes on the stack. An Integer object on a 64-bit JVM with compressed oops requires a 12-byte object header, 4 bytes for the int primitive field, plus 4 bytes of alignment padding, totaling 16 bytes on the heap plus the reference pointer (4-8 bytes).'
      }
    ],
    practiceProblems: [
      {
        title: 'Detect Primitive vs Reference Behavior',
        description: 'Implement a method that accepts an array and an integer increment, increments each array element in-place, and returns the modified array.',
        starterCode: `public class ArrayModifier {
    public static int[] modify(int[] arr, int inc) {
        // TODO: Modify in-place and return
        return arr;
    }
}`,
        solution: `public class ArrayModifier {
    public static int[] modify(int[] arr, int inc) {
        for (int i = 0; i < arr.length; i++) {
            arr[i] += inc;
        }
        return arr;
    }
}`,
        testCases: [
          { input: 'arr = [1, 2, 3], inc = 5', output: '[6, 7, 8]', explanation: 'Elements incremented in-place.' },
          { input: 'arr = [0], inc = 10', output: '[10]', explanation: 'Single element modified.' }
        ]
      }
    ],
    summary: `• Java has 8 primitive types stored directly on the stack or in objects.
• Reference variables store pointers to objects allocated on the heap.
• Java is strictly pass-by-value for both primitives and reference pointers.
• Instance fields receive default zero/null values, whereas local variables must be initialized.`,
    keyPoints: [
      'Primitives are fast, stack-allocated, and cannot be null.',
      'References point to heap objects and default to null.',
      'Pass-by-value passes a copy of the reference pointer.',
      'Primitive arrays are contiguous in memory, maximizing CPU cache locality.'
    ],
    quiz: {
      question: 'Where is a local primitive variable stored during method execution in Java?',
      options: ['In the Thread Stack Frame', 'In the Java Heap Space', 'In the Native Metaspace', 'In the String Constant Pool'],
      correctIndex: 0
    }
  }),

  // ── 2. INTEGER TYPES & TWO'S COMPLEMENT ────────────────────────────────────
  integer_types: (topic, pfx) => ({
    introduction: `Java's integer types are fundamental to every computation. In this lesson on **${topic}**, we explore byte, short, int, long, two's complement binary representation, arithmetic overflow, and bit manipulation.`,
    definition: `**Integer types** in Java are signed fixed-width integers represented using **Two's Complement** binary notation, ranging from 8-bit \`byte\` to 64-bit \`long\`.`,
    explanation: `Two's complement arithmetic and integer boundaries:
1. **Bit Sizes & Ranges:**
   - \`byte\`: 8-bit, -128 to +127.
   - \`short\`: 16-bit, -32,768 to +32,767.
   - \`int\`: 32-bit, -2^31 to 2^31 - 1 (~2.14 billion).
   - \`long\`: 64-bit, -2^63 to 2^63 - 1 (requires \`L\` suffix).
2. **Two's Complement Mechanics:** The most significant bit (MSB) acts as the sign bit (0 = positive, 1 = negative). Negative numbers are formed by inverting all bits and adding 1.
3. **Silent Overflow & Underflow:** Java integers overflow silently without throwing exceptions: \`Integer.MAX_VALUE + 1\` wraps around to \`Integer.MIN_VALUE\`.
4. **Math.exact Methods:** Java 8+ provides \`Math.addExact()\`, \`Math.multiplyExact()\` which throw \`ArithmeticException\` on overflow.`,
    importantConcepts: [
      'Arithmetic on byte, short, and char automatically promotes to 32-bit int.',
      'Long literals require an explicit L or l suffix (always use capital L for readability).',
      'Integer.toBinaryString() displays the two\'s complement bit representation.',
      'Java 8 added unsigned integer operations via Integer.compareUnsigned() and Integer.divideUnsigned().'
    ],
    syntax: `// Declarations
byte b = 127;
int max = Integer.MAX_VALUE;
long bigNum = 9_000_000_000L; // underscores for readability

// Safe arithmetic with overflow detection
int safeSum = Math.addExact(a, b);`,
    codeExamples: [
      {
        title: 'Example 1: Two\'s Complement Sign Inversion & Binary Display',
        description: 'Demonstrating how negative numbers are represented in binary using two\'s complement.',
        code: `public class ${pfx}_Ex1 {
    public static void main(String[] args) {
        int positiveFive = 5;
        int negativeFive = -5;

        System.out.println(" 5 in Binary: " + String.format("%32s", Integer.toBinaryString(positiveFive)).replace(' ', '0'));
        System.out.println("-5 in Binary: " + Integer.toBinaryString(negativeFive));
        System.out.println("Invert & add 1: " + ((~positiveFive) + 1));
    }
}`,
        output: ` 5 in Binary: 00000000000000000000000000000101
-5 in Binary: 11111111111111111111111111111011
Invert & add 1: -5`
      },
      {
        title: 'Example 2: Silent Overflow vs Safe Math.addExact()',
        description: 'Demonstrating silent wraparound versus strict overflow detection.',
        code: `public class ${pfx}_Ex2 {
    public static void main(String[] args) {
        int max = Integer.MAX_VALUE;
        int wrapped = max + 1;
        System.out.println("Max Integer: " + max);
        System.out.println("Max + 1 (Silent Wrap): " + wrapped);

        try {
            Math.addExact(max, 1);
        } catch (ArithmeticException e) {
            System.out.println("Math.addExact detected overflow: " + e.getMessage());
        }
    }
}`,
        output: `Max Integer: 2147483647
Max + 1 (Silent Wrap): -2147483648
Math.addExact detected overflow: integer overflow`
      },
      {
        title: 'Example 3: Automatic Integer Promotion in Arithmetic',
        description: 'Shows why adding two bytes produces an int in Java.',
        code: `public class ${pfx}_Ex3 {
    public static void main(String[] args) {
        byte a = 40;
        byte b = 50;
        // byte c = a + b; // Compilation error! (a + b) is promoted to int
        byte c = (byte) (a + b); // Explicit cast required

        System.out.println("Byte sum with explicit cast: " + c);
    }
}`,
        output: `Byte sum with explicit cast: 90`
      }
    ],
    realWorldExample: `Unix timestamp representations in 32-bit signed integers will overflow on January 19, 2038 (the Year 2038 problem). Modern backend systems use 64-bit \`long\` for timestamps to ensure millions of years of overflow safety.`,
    commonMistakes: [
      {
        title: 'Omitting the L Suffix on Large Long Literals',
        description: 'Integer literals without an L suffix default to 32-bit int and fail compilation if they exceed 2.14 billion.',
        badCode: 'long val = 5000000000; // Error: integer number too large',
        goodCode: 'long val = 5000000000L; // Suffix marks literal as 64-bit'
      },
      {
        title: 'Assuming Integer Arithmetic Checks for Overflow',
        description: 'Java does not throw exceptions on standard +, -, * overflow, leading to negative numbers in billing logic.',
        badCode: 'int total = price * quantity; // May wrap to negative!',
        goodCode: 'long total = (long) price * quantity; // Promoted before multiplication'
      }
    ],
    interviewQuestions: [
      {
        question: 'What happens when Integer.MIN_VALUE is negated via Math.abs() or -n?',
        answer: 'Math.abs(Integer.MIN_VALUE) returns Integer.MIN_VALUE (-2147483648). Because positive 2147483648 cannot be represented in a 32-bit signed int, the value overflows and remains negative. Java 15 added Math.absExact() which throws ArithmeticException.'
      },
      {
        question: 'Why does byte a = 10; byte b = 20; byte c = a + b; fail to compile?',
        answer: 'The Java bytecode operand stack only operates on 32-bit (int) and 64-bit (long) types. During arithmetic evaluation, byte, short, and char are automatically promoted to int. The resulting sum is of type int and cannot be implicitly assigned back to byte without an explicit cast.'
      }
    ],
    practiceProblems: [
      {
        title: 'Safe Integer Addition with Overflow Detection',
        description: 'Write a method that adds two integers. If an overflow would occur, return -1; otherwise, return the exact sum.',
        starterCode: `public class SafeAdd {
    public static int add(int a, int b) {
        // TODO: Return sum or -1 on overflow
        return 0;
    }
}`,
        solution: `public class SafeAdd {
    public static int add(int a, int b) {
        try {
            return Math.addExact(a, b);
        } catch (ArithmeticException e) {
            return -1;
        }
    }
}`,
        testCases: [
          { input: 'a = 100, b = 200', output: '300', explanation: 'Normal sum within range.' },
          { input: 'a = 2147483647, b = 1', output: '-1', explanation: 'Overflow detected, returns -1.' }
        ]
      }
    ],
    summary: `• Java integer types are signed and use two's complement representation.
• Operations on smaller types (byte, short) automatically promote to 32-bit int.
• Standard arithmetic silently wraps around on overflow; use Math.*Exact methods for safety.
• Use long with an L suffix when values exceed 2.14 billion.`,
    keyPoints: [
      'byte (8-bit), short (16-bit), int (32-bit), long (64-bit).',
      'Two\'s complement: MSB is sign bit; -x = (~x) + 1.',
      'Silent overflow wraps MAX_VALUE to MIN_VALUE.',
      'Use underscores (e.g. 1_000_000) for numeric readability.'
    ],
    quiz: {
      question: 'What is the result of evaluating: Integer.MAX_VALUE + 1 in Java?',
      options: ['Integer.MIN_VALUE', 'ArithmeticException is thrown', '0', 'Positive Infinity'],
      correctIndex: 0
    }
  }),

  // ── 3. FLOATING-POINT & IEEE 754 ───────────────────────────────────────────
  floating_point: (topic, pfx) => ({
    introduction: `Floating-point computations in Java follow the IEEE 754 binary standard. In this lesson on **${topic}**, we learn why binary computers cannot accurately represent decimal fractions like 0.1, how mantissa and exponent bits work, and how to safely compare floating-point numbers using epsilon tolerances.`,
    definition: `**Floating-point types** in Java (\`float\` and \`double\`) implement the **IEEE 754 specification**, representing real numbers via three components: a sign bit, an exponent, and a mantissa (fraction).`,
    explanation: `Understanding IEEE 754 representation:
1. **Bit Layouts:**
   - \`float\` (32-bit): 1 sign bit, 8 exponent bits, 23 mantissa bits (~7 decimal digits of precision).
   - \`double\` (64-bit): 1 sign bit, 11 exponent bits, 52 mantissa bits (~15-17 decimal digits of precision).
2. **Binary Fractional Imprecision:** Decimals like 0.1 and 0.2 become infinite repeating fractions in base-2 binary (like 1/3 in base-10). Thus, \`0.1 + 0.2 == 0.3\` evaluates to \`false\` (\`0.30000000000000004\`).
3. **Special IEEE Values:**
   - \`Double.NaN\` (Not-a-Number): result of \`0.0 / 0.0\` or \`Math.sqrt(-1)\`. Note: \`Double.NaN == Double.NaN\` is ALWAYS \`false\`! Use \`Double.isNaN()\`.
   - \`Double.POSITIVE_INFINITY\` & \`Double.NEGATIVE_INFINITY\`: result of dividing non-zero by \`0.0\`.
4. **Epsilon Comparison:** Never compare floating points with \`==\`. Check if \`Math.abs(a - b) < EPSILON\` (e.g. \`1e-9\`) or use \`Double.compare(a, b) == 0\`.`,
    importantConcepts: [
      'Double is the default floating-point type; float literals require an f/F suffix.',
      'Dividing a floating-point number by 0.0 produces Infinity, NOT ArithmeticException.',
      'Double.NaN is never equal to anything, not even itself.',
      'Double.compare() correctly handles NaN and distinguishes +0.0 from -0.0.'
    ],
    syntax: `// Declarations
float f = 3.14159f;
double d = 2.718281828459045;

// Epsilon Comparison
double EPSILON = 1e-9;
boolean isEqual = Math.abs(a - b) < EPSILON;

// Special values check
if (Double.isNaN(val) || Double.isInfinite(val)) { ... }`,
    codeExamples: [
      {
        title: 'Example 1: The Classic 0.1 + 0.2 Precision Drift',
        description: 'Demonstrating why binary floating-point representation causes arithmetic inaccuracy.',
        code: `public class ${pfx}_Ex1 {
    public static void main(String[] args) {
        double a = 0.1;
        double b = 0.2;
        double sum = a + b;

        System.out.println("0.1 + 0.2 = " + sum);
        System.out.println("sum == 0.3: " + (sum == 0.3));

        // Safe epsilon comparison
        double epsilon = 1e-9;
        boolean safelyEqual = Math.abs(sum - 0.3) < epsilon;
        System.out.println("Safely equal with epsilon: " + safelyEqual);
    }
}`,
        output: `0.1 + 0.2 = 0.30000000000000004
sum == 0.3: false
Safely equal with epsilon: true`
      },
      {
        title: 'Example 2: Special Floating-Point Values (NaN and Infinities)',
        description: 'Shows how Java handles division by zero and mathematical edge cases.',
        code: `public class ${pfx}_Ex2 {
    public static void main(String[] args) {
        double posInf = 10.0 / 0.0;
        double negInf = -10.0 / 0.0;
        double nanVal = 0.0 / 0.0;

        System.out.println("10.0 / 0.0: " + posInf);
        System.out.println("-10.0 / 0.0: " + negInf);
        System.out.println("0.0 / 0.0: " + nanVal);
        System.out.println("nanVal == nanVal: " + (nanVal == nanVal)); // false!
        System.out.println("Double.isNaN(nanVal): " + Double.isNaN(nanVal)); // true!
    }
}`,
        output: `10.0 / 0.0: Infinity
-10.0 / 0.0: -Infinity
0.0 / 0.0: NaN
nanVal == nanVal: false
Double.isNaN(nanVal): true`
      },
      {
        title: 'Example 3: Double.compare() vs Direct == Operator',
        description: 'Illustrates how Double.compare() normalizes NaN and -0.0 vs +0.0.',
        code: `public class ${pfx}_Ex3 {
    public static void main(String[] args) {
        double zeroPos = +0.0;
        double zeroNeg = -0.0;

        System.out.println("zeroPos == zeroNeg: " + (zeroPos == zeroNeg)); // true
        System.out.println("Double.compare(+0.0, -0.0): " + Double.compare(zeroPos, zeroNeg)); // 1 (+0.0 is greater)

        double nan = Double.NaN;
        System.out.println("Double.compare(NaN, NaN): " + Double.compare(nan, nan)); // 0 (treated as equal)
    }
}`,
        output: `zeroPos == zeroNeg: true
Double.compare(+0.0, -0.0): 1
Double.compare(NaN, NaN): 0`
      }
    ],
    realWorldExample: `Scientific simulation packages and 3D graphics rendering engines (such as OpenGL/Vulkan bindings in Java) use single-precision \`float\` to balance mathematical fidelity with SIMD vectorization speed on GPUs.`,
    commonMistakes: [
      {
        title: 'Using == to Compare Floating-Point Values',
        description: 'Due to rounding inaccuracies, direct equality tests almost always produce subtle false negatives.',
        badCode: 'if (price == 19.99) { applyDiscount(); } // Unsafe!',
        goodCode: 'if (Math.abs(price - 19.99) < 0.0001) { applyDiscount(); }'
      },
      {
        title: 'Checking NaN Using val == Double.NaN',
        description: 'By IEEE 754 definition, NaN is never equal to any value, including itself.',
        badCode: 'if (val == Double.NaN) { ... } // Never true!',
        goodCode: 'if (Double.isNaN(val)) { ... } // Correct inspection'
      }
    ],
    interviewQuestions: [
      {
        question: 'Why does 0.1 + 0.2 not equal 0.3 in Java floating-point arithmetic?',
        answer: 'Floating-point numbers in Java use IEEE 754 base-2 binary representation. Just as 1/3 cannot be represented as a terminating decimal in base-10 (0.3333...), fractions like 0.1 and 0.2 cannot be represented as finite terminating fractions in base-2 binary. Rounding occurs at the 53rd bit of the mantissa, creating 0.30000000000000004.'
      },
      {
        question: 'What is the output of Double.NaN == Double.NaN and why?',
        answer: 'It outputs false. The IEEE 754 specification mandates that NaN comparisons using == must always evaluate to false, even when comparing NaN to itself. You must use Double.isNaN() or Double.compare().'
      }
    ],
    practiceProblems: [
      {
        title: 'Epsilon Comparator Function',
        description: 'Write a method nearlyEqual(double a, double b, double epsilon) that returns true if two numbers are within the specified tolerance.',
        starterCode: `public class FloatCompare {
    public static boolean nearlyEqual(double a, double b, double epsilon) {
        // TODO: Implement tolerance comparison
        return false;
    }
}`,
        solution: `public class FloatCompare {
    public static boolean nearlyEqual(double a, double b, double epsilon) {
        return Math.abs(a - b) <= epsilon;
    }
}`,
        testCases: [
          { input: 'a = 0.30000000000000004, b = 0.3, epsilon = 1e-9', output: 'true', explanation: 'Difference is ~4e-17, within tolerance.' },
          { input: 'a = 1.5, b = 1.6, epsilon = 0.01', output: 'false', explanation: 'Difference of 0.1 exceeds 0.01 tolerance.' }
        ]
      }
    ],
    summary: `• Java floats and doubles adhere to IEEE 754 binary floating-point specifications.
• Binary representation cannot represent decimal fractions exactly, causing precision drift.
• Never use == to compare floating-point numbers; check against an epsilon tolerance.
• Use Double.isNaN() to detect Not-a-Number values.`,
    keyPoints: [
      'float (32-bit, ~7 digits precision), double (64-bit, ~16 digits precision).',
      'Floating-point division by 0.0 produces Infinity or NaN rather than throwing.',
      'Double.compare() distinguishes -0.0 from +0.0 and treats NaN == NaN as 0.',
      'For monetary calculations, always use BigDecimal instead of double.'
    ],
    quiz: {
      question: 'Which method should be used to test whether a double variable represents NaN?',
      options: ['Double.isNaN(val)', 'val == Double.NaN', 'val.equals(Double.NaN)', 'Objects.isNull(val)'],
      correctIndex: 0
    }
  }),

  // ── 4. WRAPPER CLASSES & AUTOBOXING ────────────────────────────────────────
  wrapper_classes: (topic, pfx) => ({
    introduction: `Java provides Object wrapper classes for each primitive type to bridge primitive values into the Object-Oriented hierarchy and Collections Framework. In this lesson on **${topic}**, we inspect the -128 to 127 Integer cache, autoboxing overhead, and unboxing NullPointerException hazards.`,
    definition: `**Wrapper classes** (\`Integer\`, \`Double\`, \`Boolean\`, etc.) encapsulate primitive data types into reference objects, enabling primitives to be used in generic collections and Java API reflection.`,
    explanation: `Autoboxing mechanics and performance implications:
1. **Autoboxing & Unboxing:** Introduced in Java 5. \`Integer x = 10;\` compiles into \`Integer x = Integer.valueOf(10);\`. Unboxing (\`int y = x;\`) compiles into \`int y = x.intValue();\`.
2. **Integer Cache (-128 to 127):** \`Integer.valueOf()\` caches objects in range -128 through 127. Values within this range return identical heap instances, so \`==\` returns \`true\`. Outside this range, \`Integer.valueOf()\` allocates new objects, making \`==\` evaluate to \`false\`!
3. **NullPointerException on Unboxing:** If a wrapper variable is \`null\` and undergoes unboxing in arithmetic or boolean conditions, Java calls \`.intValue()\` or \`.booleanValue()\`, throwing a runtime \`NullPointerException\`.
4. **Loop Overhead:** Accumulating sums using a wrapper object inside a loop (e.g. \`Long sum = 0L;\`) creates millions of short-lived heap objects, triggering severe GC pressure.`,
    importantConcepts: [
      'Byte, Short, Integer, Long cache values in range -128 to 127.',
      'Character caches values in range 0 to 127; Boolean caches TRUE and FALSE.',
      'Always compare wrapper classes using .equals(), NEVER ==.',
      'Prefer primitive collections (like Eclipse Collections or Trove) or primitive streams for bulk numerical loops.'
    ],
    syntax: `// Autoboxing (compiler calls Integer.valueOf(42))
Integer a = 42;

// Unboxing (compiler calls a.intValue())
int b = a;

// Dangerous Unboxing Trap
Integer nullVal = null;
int crash = nullVal; // Throws NullPointerException!`,
    codeExamples: [
      {
        title: 'Example 1: The Integer Cache (-128 to 127) Pitfall',
        description: 'Demonstrating why == works for 100 but fails for 200.',
        code: `public class ${pfx}_Ex1 {
    public static void main(String[] args) {
        Integer a = 100;
        Integer b = 100;
        System.out.println("100 == 100: " + (a == b)); // true (cached)

        Integer c = 200;
        Integer d = 200;
        System.out.println("200 == 200: " + (c == d)); // false! (new objects)
        System.out.println("c.equals(d): " + c.equals(d)); // true (correct content equality)
    }
}`,
        output: `100 == 100: true
200 == 200: false
c.equals(d): true`
      },
      {
        title: 'Example 2: The Unboxing NullPointerException Trap',
        description: 'Reveals how unboxing a null wrapper during arithmetic throws NullPointerException.',
        code: `public class ${pfx}_Ex2 {
    public static void main(String[] args) {
        Integer balance = null;

        try {
            // Implicit unboxing occurs when performing addition
            int updated = balance + 50; 
        } catch (NullPointerException e) {
            System.out.println("Caught unboxing NPE: Cannot invoke intValue() on null balance!");
        }
    }
}`,
        output: `Caught unboxing NPE: Cannot invoke intValue() on null balance!`
      },
      {
        title: 'Example 3: Autoboxing Memory & Performance Overhead in Loops',
        description: 'Shows the dramatic performance difference between primitive long vs wrapper Long.',
        code: `public class ${pfx}_Ex3 {
    public static void main(String[] args) {
        long start = System.currentTimeMillis();

        // Fast primitive loop
        long primitiveSum = 0L;
        for (long i = 0; i < 1_000_000; i++) {
            primitiveSum += i;
        }
        long duration = System.currentTimeMillis() - start;

        System.out.println("Primitive sum: " + primitiveSum);
        System.out.println("Execution Time: " + duration + " ms");
    }
}`,
        output: `Primitive sum: 499999500000
Execution Time: 3 ms`
      }
    ],
    realWorldExample: `Enterprise ORMs (like Hibernate and JPA) use wrapper classes (e.g. \`Long id\`, \`Integer status\`) for entity fields so that unpersisted entities or nullable database columns map naturally to \`null\` rather than default zeroes.`,
    commonMistakes: [
      {
        title: 'Comparing Wrapper Objects Using ==',
        description: 'Code may pass unit tests with small numbers (<= 127) due to the Integer cache, but catastrophically fail in production with larger values.',
        badCode: 'if (userA.getId() == userB.getId()) { ... } // Fails for IDs > 127!',
        goodCode: 'if (Objects.equals(userA.getId(), userB.getId())) { ... }'
      },
      {
        title: 'Unboxing Null Values in Ternary Expressions',
        description: 'Mixing primitives and wrappers in ternary branches forces unboxing of the wrapper, triggering NPE if null.',
        badCode: 'int val = condition ? 10 : (Integer) null; // Throws NPE!',
        goodCode: 'Integer val = condition ? 10 : null; // Safe wrapper assignment'
      }
    ],
    interviewQuestions: [
      {
        question: 'Why does Integer a = 127, b = 127 evaluate to a == b true, while 128 evaluates to false?',
        answer: 'Integer.valueOf() caches instances in range -128 to 127 (configurable via JVM flag -XX:AutoBoxCacheMax). Values in this range return the exact same pre-allocated instance from IntegerCache. For values >= 128, new Integer instances are created on the heap, having distinct memory addresses.'
      },
      {
        question: 'What is the risk of using wrapper types in heavy computational loops?',
        answer: 'Each unboxing and re-boxing operation allocates a new object on the Java heap. In a loop running millions of times, this creates gigabytes of garbage objects, stalling application throughput with frequent Garbage Collection pauses.'
      }
    ],
    practiceProblems: [
      {
        title: 'Safe Wrapper Equality Comparator',
        description: 'Implement a null-safe method areWrappersEqual(Integer a, Integer b) that correctly compares wrapper values without relying on the -128..127 cache.',
        starterCode: `public class WrapperUtil {
    public static boolean areWrappersEqual(Integer a, Integer b) {
        // TODO: Implement null-safe equality check
        return false;
    }
}`,
        solution: `import java.util.Objects;

public class WrapperUtil {
    public static boolean areWrappersEqual(Integer a, Integer b) {
        return Objects.equals(a, b);
    }
}`,
        testCases: [
          { input: 'a = 500, b = 500', output: 'true', explanation: 'Values are equal despite exceeding 127 cache limit.' },
          { input: 'a = null, b = 100', output: 'false', explanation: 'Null safety handled without throwing NPE.' }
        ]
      }
    ],
    summary: `• Wrapper classes encapsulate primitives into Java Objects.
• Values in range -128 to 127 are cached; always use .equals() for comparison.
• Autoboxing null wrappers causes NullPointerException during unboxing.
• Avoid wrapper types in computational hot loops to prevent GC memory thrashing.`,
    keyPoints: [
      'Autoboxing converts primitives to wrappers via valueOf().',
      'Unboxing converts wrappers back to primitives via typeValue().',
      'The Integer cache saves memory for common values between -128 and 127.',
      'Objects.equals(a, b) provides safe wrapper comparison.'
    ],
    quiz: {
      question: 'What is the default range of values cached by the JVM IntegerCache?',
      options: ['-128 to 127', '0 to 255', '-32768 to 32767', 'All positive integers'],
      correctIndex: 0
    }
  }),

  // ── 5. LOOPS & ITERATION ───────────────────────────────────────────────────
  loops: (topic, pfx) => ({
    introduction: `Iteration is the heartbeat of algorithmic processing. In this lesson on **${topic}**, we inspect for-loops, while-loops, do-while loops, the enhanced for-each loop, and bytecode control flow with labeled breaks.`,
    definition: `**Loops** are control flow constructs that repeatedly execute a block of code as long as a specified boolean termination condition evaluates to \`true\`.`,
    explanation: `Comparing Java iteration constructs:
1. **Standard For Loop:** Best when the number of iterations is known in advance (\`for(init; condition; update)\`). Multiple loop variables can be declared and updated together.
2. **Enhanced For-Each Loop:** Syntactic sugar over the \`Iterable\` contract and \`Iterator\` interface. Eliminates off-by-one errors and array indexing bugs. Cannot modify collection structure during traversal without throwing \`ConcurrentModificationException\`.
3. **While Loop:** Evaluates condition before each iteration. Ideal for event loops or reading streams until a sentinel/null value is reached.
4. **Do-While Loop:** Guarantees that the code block executes at least ONCE before evaluating the termination condition.
5. **Labeled Break & Continue:** Allows breaking or continuing outer nested loops directly without boolean flag variables.`,
    importantConcepts: [
      'The enhanced for-each loop requires the target to be an array or implement java.lang.Iterable.',
      'Modifying a List while traversing it with for-each throws ConcurrentModificationException.',
      'Labeled breaks terminate outer loops cleanly; labeled continues jump to outer loop steps.',
      'The HotSpot JIT compiler optimizes loops via loop unrolling and bounds-check elimination.'
    ],
    syntax: `// Standard For Loop
for (int i = 0; i < n; i++) { ... }

// Enhanced For-Each
for (String item : list) { ... }

// Labeled Outer Break
outerLoop:
for (int i = 0; i < rows; i++) {
    for (int j = 0; j < cols; j++) {
        if (matrix[i][j] == target) break outerLoop;
    }
}`,
    codeExamples: [
      {
        title: 'Example 1: Standard vs Enhanced For-Each Traversal',
        description: 'Demonstrates index-based array iteration compared to clean enhanced for-each iteration.',
        code: `public class ${pfx}_Ex1 {
    public static void main(String[] args) {
        String[] languages = {"Java", "Kotlin", "Scala"};

        System.out.println("--- Standard Index Loop ---");
        for (int i = 0; i < languages.length; i++) {
            System.out.println("Index " + i + ": " + languages[i]);
        }

        System.out.println("--- Enhanced For-Each Loop ---");
        for (String lang : languages) {
            System.out.println("Language: " + lang);
        }
    }
}`,
        output: `--- Standard Index Loop ---
Index 0: Java
Index 1: Kotlin
Index 2: Scala
--- Enhanced For-Each Loop ---
Language: Java
Language: Kotlin
Language: Scala`
      },
      {
        title: 'Example 2: Labeled Breaks for Matrix Search',
        description: 'Shows how labeled breaks terminate deeply nested loops without clumsy boolean flags.',
        code: `public class ${pfx}_Ex2 {
    public static void main(String[] args) {
        int[][] matrix = {
            {1, 2, 3},
            {4, 99, 6},
            {7, 8, 9}
        };
        int target = 99;
        boolean found = false;

        searchGrid:
        for (int r = 0; r < matrix.length; r++) {
            for (int c = 0; c < matrix[r].length; c++) {
                if (matrix[r][c] == target) {
                    System.out.println("Found target " + target + " at [" + r + "][" + c + "]");
                    found = true;
                    break searchGrid; // Exits both loops immediately!
                }
            }
        }
        System.out.println("Search completed: " + found);
    }
}`,
        output: `Found target 99 at [1][1]
Search completed: true`
      },
      {
        title: 'Example 3: While vs Do-While Guaranteed First Execution',
        description: 'Illustrates that do-while always executes at least once even when condition is false.',
        code: `public class ${pfx}_Ex3 {
    public static void main(String[] args) {
        int counter = 10;

        System.out.println("While loop with false condition:");
        while (counter < 5) {
            System.out.println("This will never print");
        }

        System.out.println("Do-While loop with false condition:");
        do {
            System.out.println("Do-While executed once despite counter = " + counter);
        } while (counter < 5);
    }
}`,
        output: `While loop with false condition:
Do-While loop with false condition:
Do-While executed once despite counter = 10`
      }
    ],
    realWorldExample: `Database connection pool managers (like HikariCP) use bounded while-loops with timeout deadlines to wait for idle database connections, safely releasing thread locks if the pool is exhausted.`,
    commonMistakes: [
      {
        title: 'Removing Elements in an Enhanced For-Each Loop',
        description: 'Calling list.remove() inside an enhanced for-each loop invalidates the underlying iterator, throwing ConcurrentModificationException.',
        badCode: 'for (String s : list) { if (s.isEmpty()) list.remove(s); } // Throws Exception!',
        goodCode: 'list.removeIf(String::isEmpty); // Or use iterator.remove()'
      },
      {
        title: 'Off-by-One Array Bounds Error',
        description: 'Iterating up to <= array.length causes ArrayIndexOutOfBoundsException.',
        badCode: 'for (int i = 0; i <= arr.length; i++) { ... } // ArrayIndexOutOfBoundsException!',
        goodCode: 'for (int i = 0; i < arr.length; i++) { ... } // Correct 0..length-1'
      }
    ],
    interviewQuestions: [
      {
        question: 'How does the enhanced for-each loop work under the hood in Java?',
        answer: 'For arrays, javac compiles the enhanced for-each loop into a standard index-based loop using an internal length counter. For objects implementing java.lang.Iterable, javac compiles it into an Iterator traversal calling hasNext() and next().'
      },
      {
        question: 'What is loop unrolling and how does the HotSpot JIT compiler use it?',
        answer: 'Loop unrolling is an optimization where the JIT compiler replicates the loop body multiple times to decrease loop control branch instructions and increase instruction-level CPU parallelism.'
      }
    ],
    practiceProblems: [
      {
        title: 'Sum Positive Numbers with Break on Negative',
        description: 'Iterate through an integer array, summing all positive numbers. If a negative number is encountered, terminate immediately and return the accumulated sum.',
        starterCode: `public class ArraySummer {
    public static int sumUntilNegative(int[] nums) {
        // TODO: Sum until negative
        return 0;
    }
}`,
        solution: `public class ArraySummer {
    public static int sumUntilNegative(int[] nums) {
        int sum = 0;
        for (int n : nums) {
            if (n < 0) break;
            sum += n;
        }
        return sum;
    }
}`,
        testCases: [
          { input: 'nums = [10, 20, 30, -5, 40]', output: '60', explanation: 'Sums 10 + 20 + 30 = 60, breaks on -5.' },
          { input: 'nums = [-1, 10, 20]', output: '0', explanation: 'First number is negative, terminates immediately.' }
        ]
      }
    ],
    summary: `• Use for loops when iterations are known; while loops when waiting on conditions.
• Do-while loops guarantee at least one execution before condition checking.
• The enhanced for-each loop provides clean, index-free iteration over arrays and collections.
• Use labeled breaks to exit deeply nested loops cleanly.`,
    keyPoints: [
      'for-each uses an Iterator under the hood for Collections.',
      'Modifying collections during for-each causes ConcurrentModificationException.',
      'Labeled break statements terminate outer loops directly.',
      'HotSpot JIT optimizes tight loops with loop unrolling and bounds check elimination.'
    ],
    quiz: {
      question: 'Which loop construct is guaranteed to execute its code block at least once?',
      options: ['do-while loop', 'while loop', 'for loop', 'enhanced for-each loop'],
      correctIndex: 0
    }
  }),

  // ── 6. ARRAYS ──────────────────────────────────────────────────────────────
  arrays: (topic, pfx) => ({
    introduction: `Arrays are the most fundamental contiguous data structures in the Java Virtual Machine. In this lesson on **${topic}**, we inspect array memory allocation, cache line locality, multidimensional and ragged arrays, and high-performance native copying via \`System.arraycopy\`.`,
    definition: `An **Array** in Java is a dynamically created container object that holds a fixed number of values of a single homogeneous type in contiguous memory locations.`,
    explanation: `Array layout and JVM mechanics:
1. **Contiguous Heap Allocation:** An array in Java is an Object stored on the heap with an object header (including an array length field). Array elements are laid out sequentially, maximizing CPU L1/L2 cache prefetching.
2. **Fixed Length:** Once instantiated, an array's length is immutable. Growing an array requires allocating a new array and copying elements over.
3. **Native Copying:** \`System.arraycopy()\` is a native JVM C++ intrinsic that copies memory blocks in bulk using direct CPU vector instructions, far faster than manual for-loop iteration.
4. **Multidimensional & Ragged Arrays:** Java does not have true matrix arrays; it has "arrays of arrays". Rows can have different lengths (ragged arrays), and row pointers are stored as separate heap references.`,
    importantConcepts: [
      'Array indexes are strictly 0-based; accessing out-of-bounds throws ArrayIndexOutOfBoundsException.',
      'Arrays.copyOf() and Arrays.copyOfRange() provide clean, idiomatic resizing and slicing.',
      'Arrays of primitives store values directly; arrays of objects store reference pointers (not the objects themselves).',
      'The length field is a final public property, not a method (e.g. arr.length vs str.length()).'
    ],
    syntax: `// Instantiation
int[] numbers = new int[5]; // initialized to 0
String[] names = {"Alice", "Bob", "Charlie"};

// High-speed native copy
System.arraycopy(src, srcPos, dest, destPos, length);

// Resizing
int[] expanded = Arrays.copyOf(numbers, numbers.length * 2);`,
    codeExamples: [
      {
        title: 'Example 1: Array Allocation & High-Speed System.arraycopy',
        description: 'Demonstrates creating arrays and copying sub-ranges using native System.arraycopy.',
        code: `import java.util.Arrays;

public class ${pfx}_Ex1 {
    public static void main(String[] args) {
        int[] source = {10, 20, 30, 40, 50};
        int[] destination = new int[5];

        // Native block copy: copy 3 elements starting at index 1
        System.arraycopy(source, 1, destination, 0, 3);

        System.out.println("Source: " + Arrays.toString(source));
        System.out.println("Destination: " + Arrays.toString(destination));
    }
}`,
        output: `Source: [10, 20, 30, 40, 50]
Destination: [20, 30, 40, 0, 0]`
      },
      {
        title: 'Example 2: Ragged (Jagged) Multidimensional Arrays',
        description: 'Illustrates creating arrays of arrays where each row has a different number of columns.',
        code: `public class ${pfx}_Ex2 {
    public static void main(String[] args) {
        // 2D ragged array: 3 rows with varying column counts
        int[][] ragged = new int[3][];
        ragged[0] = new int[]{1};
        ragged[1] = new int[]{2, 3};
        ragged[2] = new int[]{4, 5, 6, 7};

        for (int r = 0; r < ragged.length; r++) {
            System.out.print("Row " + r + " (len=" + ragged[r].length + "): ");
            for (int val : ragged[r]) {
                System.out.print(val + " ");
            }
            System.out.println();
        }
    }
}`,
        output: `Row 0 (len=1): 1 
Row 1 (len=2): 2 3 
Row 2 (len=4): 4 5 6 7 `
      },
      {
        title: 'Example 3: Sorting and Binary Searching with Arrays Utility',
        description: 'Demonstrating Dual-Pivot Quicksort and binary search on arrays.',
        code: `import java.util.Arrays;

public class ${pfx}_Ex3 {
    public static void main(String[] args) {
        int[] data = {45, 12, 85, 32, 89, 39, 69, 44, 42, 1, 6, 8};
        
        Arrays.sort(data); // Dual-Pivot Quicksort O(N log N)
        System.out.println("Sorted Array: " + Arrays.toString(data));

        int searchKey = 42;
        int index = Arrays.binarySearch(data, searchKey);
        System.out.println("Index of " + searchKey + ": " + index);
    }
}`,
        output: `Sorted Array: [1, 6, 8, 12, 32, 39, 42, 44, 45, 69, 85, 89]
Index of 42: 6`
      }
    ],
    realWorldExample: `Java's \`ArrayList\` internal implementation uses \`System.arraycopy\` to dynamically expand its underlying \`Object[] elementData\` array by 50% (\`newCapacity = oldCapacity + (oldCapacity >> 1)\`) whenever capacity is exceeded.`,
    commonMistakes: [
      {
        title: 'Printing an Array Directly with toString()',
        description: 'Calling array.toString() prints the object hash code (e.g. [I@15db9742) instead of elements.',
        badCode: 'System.out.println(myArray); // Prints [I@15db9742',
        goodCode: 'System.out.println(Arrays.toString(myArray)); // Prints [1, 2, 3]'
      },
      {
        title: 'Comparing Arrays with .equals() Instead of Arrays.equals()',
        description: 'Array .equals() evaluates reference equality, failing even if both arrays contain identical elements.',
        badCode: 'if (arrA.equals(arrB)) { ... } // Compares memory addresses!',
        goodCode: 'if (Arrays.equals(arrA, arrB)) { ... } // Compares contents'
      }
    ],
    interviewQuestions: [
      {
        question: 'Why is System.arraycopy() faster than a standard for-loop copy in Java?',
        answer: 'System.arraycopy() is a JVM intrinsic implemented directly in C++ assembly (memmove/memcpy). It copies raw memory blocks in a single operation utilizing CPU SIMD (AVX/SSE) vector instructions and bypasses per-element array bounds checks.'
      },
      {
        question: 'What is the difference between Arrays.equals() and Arrays.deepEquals()?',
        answer: 'Arrays.equals() performs 1D content comparison. For multidimensional arrays (arrays of arrays), Arrays.equals() compares the child array memory references. Arrays.deepEquals() recursively traverses nested arrays, comparing leaf elements.'
      }
    ],
    practiceProblems: [
      {
        title: 'Rotate Array to the Right by K Steps',
        description: 'Given an integer array nums and integer k, rotate the array to the right by k steps in-place.',
        starterCode: `public class ArrayRotator {
    public static void rotate(int[] nums, int k) {
        // TODO: Rotate array in-place
    }
}`,
        solution: `public class ArrayRotator {
    public static void rotate(int[] nums, int k) {
        int n = nums.length;
        k %= n;
        reverse(nums, 0, n - 1);
        reverse(nums, 0, k - 1);
        reverse(nums, k, n - 1);
    }
    private static void reverse(int[] nums, int start, int end) {
        while (start < end) {
            int t = nums[start];
            nums[start] = nums[end];
            nums[end] = t;
            start++; end--;
        }
    }
}`,
        testCases: [
          { input: 'nums = [1, 2, 3, 4, 5], k = 2', output: '[4, 5, 1, 2, 3]', explanation: 'Elements rotated right by 2 positions.' },
          { input: 'nums = [1, 2], k = 3', output: '[2, 1]', explanation: '3 % 2 = 1 rotation.' }
        ]
      }
    ],
    summary: `• Arrays allocate contiguous memory blocks on the Java heap.
• Array sizes are fixed at allocation; resizing requires copying into a new array.
• Use System.arraycopy for high-performance memory block copying.
• Use Arrays.toString() and Arrays.deepToString() for readable logging.`,
    keyPoints: [
      'Arrays are homogeneous, zero-indexed objects with a public final length field.',
      'Ragged arrays allow rows to have varying column sizes.',
      'System.arraycopy uses native SIMD memory instructions.',
      'Use Arrays.equals() and Arrays.deepEquals() to compare contents.'
    ],
    quiz: {
      question: 'Which method should be used to print the readable contents of a 2D matrix array?',
      options: ['Arrays.deepToString(matrix)', 'matrix.toString()', 'Arrays.toString(matrix)', 'PrintStream.printArray(matrix)'],
      correctIndex: 0
    }
  }),

  // ── 7. POLYMORPHISM & METHOD OVERRIDING ────────────────────────────────────
  polymorphism: (topic, pfx) => ({
    introduction: `Polymorphism allows objects of different classes to respond uniquely to the same method invocation. In this lesson on **${topic}**, we demystify dynamic method dispatch, Virtual Method Tables (vtables), the @Override annotation, and covariant return types.`,
    definition: `**Polymorphism** ("many forms") enables a superclass reference to hold any subclass instance and dispatch method calls at runtime to the specific subclass implementation based on the actual object type in heap memory.`,
    explanation: `Dynamic dispatch and JVM vtable mechanics:
1. **Dynamic Method Dispatch:** When invoking an overridden instance method via \`parentRef.action()\`, the JVM evaluates the method based on the object's RUNTIME type, not the reference type.
2. **Virtual Method Table (vtable):** The JVM maintains a vtable for each loaded class containing pointers to its executable methods. If a child overrides a method, the vtable entry points to the child's bytecode; otherwise it points to the parent's.
3. **Static vs Dynamic Binding:** Private, static, and final methods are resolved at compile-time (static binding). All other public/protected methods are resolved dynamically at runtime (dynamic binding).
4. **Covariant Return Types:** An overriding method in a subclass can return a subtype of the return type declared in the superclass (e.g. \`public Dog produce()\` overriding \`public Animal produce()\`).`,
    importantConcepts: [
      '@Override enforces compile-time checks that the method signature exactly matches a superclass method.',
      'Constructors, private methods, and static methods cannot be overridden.',
      'Subclasses cannot narrow the access modifier of an overridden method (e.g. cannot change public to protected).',
      'Overriding methods cannot throw broader or new checked exceptions than the superclass method.'
    ],
    syntax: `class Animal {
    public Animal create() { return new Animal(); }
}
class Dog extends Animal {
    @Override
    public Dog create() { // Covariant return type
        return new Dog();
    }
}`,
    codeExamples: [
      {
        title: 'Example 1: Dynamic Method Dispatch in Action',
        description: 'Demonstrating that the JVM selects method implementation based on the runtime object type.',
        code: `class Notification {
    public void send(String msg) {
        System.out.println("Default Notification: " + msg);
    }
}

class EmailNotification extends Notification {
    @Override
    public void send(String msg) {
        System.out.println("Sending SMTP Email: " + msg);
    }
}

class SMSNotification extends Notification {
    @Override
    public void send(String msg) {
        System.out.println("Sending Twilio SMS: " + msg);
    }
}

public class ${pfx}_Ex1 {
    public static void main(String[] args) {
        Notification[] channels = { new EmailNotification(), new SMSNotification() };
        for (Notification n : channels) {
            n.send("Security alert: New login detected");
        }
    }
}`,
        output: `Sending SMTP Email: Security alert: New login detected
Sending Twilio SMS: Security alert: New login detected`
      },
      {
        title: 'Example 2: Covariant Return Types',
        description: 'Shows how overriding methods return specific subtypes without requiring downcasting.',
        code: `class Document {
    public Document copy() { return new Document(); }
}

class PDFDocument extends Document {
    @Override
    public PDFDocument copy() { // Returns PDFDocument rather than Document
        return new PDFDocument();
    }
    public void renderPDF() {
        System.out.println("Rendering crisp vector PDF pages");
    }
}

public class ${pfx}_Ex2 {
    public static void main(String[] args) {
        PDFDocument pdf = new PDFDocument();
        PDFDocument cloned = pdf.copy(); // No explicit (PDFDocument) cast needed!
        cloned.renderPDF();
    }
}`,
        output: `Rendering crisp vector PDF pages`
      },
      {
        title: 'Example 3: Static Method Hiding vs Method Overriding',
        description: 'Demonstrates that static methods are bonded at compile-time and hidden, not overridden.',
        code: `class Parent {
    public static void display() { System.out.println("Parent static display"); }
}

class Child extends Parent {
    public static void display() { System.out.println("Child static display"); }
}

public class ${pfx}_Ex3 {
    public static void main(String[] args) {
        Parent ref = new Child();
        ref.display(); // Invokes Parent.display() because static methods bind at compile time!
    }
}`,
        output: `Parent static display`
      }
    ],
    realWorldExample: `Enterprise payment gateways use polymorphism where an abstract \`PaymentProcessor\` contract is backed by \`StripeProcessor\`, \`PayPalProcessor\`, and \`ApplePayProcessor\`. The checkout service simply calls \`processor.charge(invoice)\` without knowing the provider's API.`,
    commonMistakes: [
      {
        title: 'Attempting to Override Static Methods',
        description: 'Static methods belong to the class, not instances. Declaring an identical static method in a child hides the parent method, never overrides it.',
        badCode: 'class Child extends Parent { @Override public static void run() {} } // Compile error!',
        goodCode: 'class Child extends Parent { @Override public void run() {} } // Instance override'
      },
      {
        title: 'Throwing Broader Checked Exceptions in Overridden Methods',
        description: 'A child method cannot declare a checked exception that is broader than what the parent method declared.',
        badCode: 'class Child extends Parent { void read() throws Exception {} } // If Parent threw IOException!',
        goodCode: 'class Child extends Parent { void read() throws FileNotFoundException {} } // Subtype exception'
      }
    ],
    interviewQuestions: [
      {
        question: 'How does the JVM execute polymorphic methods under the hood?',
        answer: 'The HotSpot JVM uses a Virtual Method Table (vtable) associated with each loaded class. The invokevirtual opcode takes the method offset in the vtable. At runtime, the JVM looks up the object\'s class pointer, inspects that specific class\'s vtable at the method index, and executes the target machine code.'
      },
      {
        question: 'What is return type covariance in Java method overriding?',
        answer: 'Since Java 5, an overriding method is allowed to declare a return type that is a subclass of the superclass method\'s return type. This eliminates the need for callers to perform explicit type casting when invoking the method on the subclass reference.'
      }
    ],
    practiceProblems: [
      {
        title: 'Implement Polymorphic Shape Area Calculator',
        description: 'Create an abstract Shape with getArea(), and Circle/Rectangle subclasses. Calculate the total area of an array of shapes.',
        starterCode: `abstract class Shape { public abstract double getArea(); }
// TODO: Implement Circle and Rectangle subclasses`,
        solution: `class Circle extends Shape {
    private double r;
    public Circle(double r) { this.r = r; }
    public double getArea() { return Math.PI * r * r; }
}
class Rectangle extends Shape {
    private double w, h;
    public Rectangle(double w, double h) { this.w = w; this.h = h; }
    public double getArea() { return w * h; }
}`,
        testCases: [
          { input: 'Circle(10), Rectangle(5, 4)', output: 'Area: ~334.16', explanation: 'Circle area ~314.16 + Rectangle area 20 = 334.16.' },
          { input: 'Rectangle(10, 10)', output: 'Area: 100.0', explanation: '10 * 10 = 100.' }
        ]
      }
    ],
    summary: `• Polymorphism enables runtime dynamic dispatch based on actual heap object type.
• The JVM resolves overridden methods through class Virtual Method Tables (vtables).
• @Override ensures compiler verification of method signatures.
• Subclasses may return covariant (narrower) return types.`,
    keyPoints: [
      'Static, private, and final methods bind at compile time (static binding).',
      'Virtual methods bind dynamically at runtime based on the object instance.',
      'Overriding methods cannot expand checked exceptions or restrict visibility.',
      'Covariant return types eliminate cast boilerplate.'
    ],
    quiz: {
      question: 'Which Java bytecode instruction is typically used to invoke an overridden public instance method?',
      options: ['invokevirtual', 'invokestatic', 'invokespecial', 'invokedynamic'],
      correctIndex: 0
    }
  }),

  // ── 8. INTERFACES & ABSTRACTION ───────────────────────────────────────────
  interfaces_abstraction: (topic, pfx) => ({
    introduction: `Abstraction separates interface specifications from implementation details. In this lesson on **${topic}**, we inspect abstract classes vs interfaces, default and static methods in Java 8+, and private interface methods in Java 9+.`,
    definition: `An **Interface** is a formal contract in Java that defines a set of abstract specifications (and optional default/static implementations) that implementing classes must satisfy.`,
    explanation: `Key differences between Abstract Classes and Interfaces:
1. **Multiple Inheritance of Behavior:** A class can extend only ONE abstract class, but can implement MULTIPLE interfaces (\`class C implements A, B, C\`).
2. **State & Instance Fields:** Abstract classes can declare non-static, mutable instance fields and constructors. Interfaces cannot have instance state; all variables declared in an interface are implicitly \`public static final\`.
3. **Default Methods (Java 8+):** Interfaces can provide default method implementations (\`default void log() { ... }\`) allowing APIs to evolve without breaking existing implementing classes.
4. **Private Interface Methods (Java 9+):** Allows private helper methods inside interfaces to share code between multiple default methods without exposing them publicly.`,
    importantConcepts: [
      'Abstract classes are for code sharing across closely related classes with state.',
      'Interfaces define capabilities and behavioral contracts across unrelated classes.',
      'If two implemented interfaces provide identical default methods, the class MUST override and resolve the conflict.',
      'Functional interfaces contain exactly one abstract method and can be implemented via lambda expressions.'
    ],
    syntax: `public interface Auditable {
    void recordAudit(String event); // abstract method

    default void logSecurityEvent(String event) {
        logToConsole(event); // uses private helper
    }

    private void logToConsole(String event) {
        System.out.println("[AUDIT]: " + event);
    }
}`,
    codeExamples: [
      {
        title: 'Example 1: Multiple Interface Implementation',
        description: 'Demonstrating a single class fulfilling contracts from multiple independent interfaces.',
        code: `interface Printable { void print(); }
interface Exportable { void exportPDF(); }

class FinancialReport implements Printable, Exportable {
    public void print() {
        System.out.println("Printing physical paper report...");
    }
    public void exportPDF() {
        System.out.println("Exporting encrypted PDF report...");
    }
}

public class ${pfx}_Ex1 {
    public static void main(String[] args) {
        FinancialReport report = new FinancialReport();
        report.print();
        report.exportPDF();
    }
}`,
        output: `Printing physical paper report...
Exporting encrypted PDF report...`
      },
      {
        title: 'Example 2: Default Methods & Conflict Resolution',
        description: 'Illustrates how a class resolves duplicate default methods from two interfaces.',
        code: `interface ServiceA {
    default void status() { System.out.println("Service A: Healthy"); }
}
interface ServiceB {
    default void status() { System.out.println("Service B: Healthy"); }
}

class CompositeService implements ServiceA, ServiceB {
    @Override
    public void status() {
        // Explicitly choose which default method to delegate to, or provide custom logic
        ServiceA.super.status();
        ServiceB.super.status();
        System.out.println("Composite status check passed.");
    }
}

public class ${pfx}_Ex2 {
    public static void main(String[] args) {
        new CompositeService().status();
    }
}`,
        output: `Service A: Healthy
Service B: Healthy
Composite status check passed.`
      },
      {
        title: 'Example 3: Abstract Class with State and Template Method Pattern',
        description: 'Demonstrates an abstract class defining a template algorithm with customizable steps.',
        code: `abstract class DataPipeline {
    // Template method defining algorithm structure
    public final void runPipeline() {
        connect();
        processData();
        disconnect();
    }
    private void connect() { System.out.println("Step 1: Connected to data stream"); }
    private void disconnect() { System.out.println("Step 3: Disconnected safely"); }
    protected abstract void processData(); // Subclasses must provide this step
}

class XMLPipeline extends DataPipeline {
    @Override
    protected void processData() {
        System.out.println("Step 2: Parsing and transforming XML nodes");
    }
}

public class ${pfx}_Ex3 {
    public static void main(String[] args) {
        DataPipeline pipeline = new XMLPipeline();
        pipeline.runPipeline();
    }
}`,
        output: `Step 1: Connected to data stream
Step 2: Parsing and transforming XML nodes
Step 3: Disconnected safely`
      }
    ],
    realWorldExample: `Java\'s standard collection framework relies heavily on interfaces: \`List\`, \`Set\`, and \`Map\` are interfaces implemented by \`ArrayList\`, \`HashSet\`, and \`ConcurrentHashMap\`. Client code depends on the \`List\` interface, allowing underlying implementations to change seamlessly.`,
    commonMistakes: [
      {
        title: 'Attempting to Declare Instance Variables in Interfaces',
        description: 'All variables in interfaces are implicitly public, static, and final.',
        badCode: 'interface Config { int timeout = 5000; } // Cannot be modified later!',
        goodCode: 'abstract class Config { protected int timeout = 5000; } // Can be modified'
      },
      {
        title: 'Ignoring Default Method Diamond Collisions',
        description: 'Implementing two interfaces that declare the same default method signature results in a compile error if not overridden.',
        badCode: 'class MyClass implements InterfaceA, InterfaceB {} // Error if both have default foo()',
        goodCode: 'class MyClass implements InterfaceA, InterfaceB { public void foo() { InterfaceA.super.foo(); } }'
      }
    ],
    interviewQuestions: [
      {
        question: 'When should you choose an Abstract Class over an Interface in Java?',
        answer: 'Choose an Abstract Class when you want to share common state (instance fields) and non-public methods among closely related classes, or when you need constructors. Choose an Interface when defining a contract that can be implemented by any class regardless of its position in the class hierarchy, or when multiple inheritance of behavior is needed.'
      },
      {
        question: 'What is the purpose of private methods inside an interface in Java 9+?',
        answer: 'Private interface methods allow multiple default or static methods in the same interface to share common implementation logic without exposing those helper methods to implementing classes or public consumers.'
      }
    ],
    practiceProblems: [
      {
        title: 'Implement Cache Interface Contract',
        description: 'Define a Cache<K, V> interface with put(K, V), get(K), and a default contains(K) method.',
        starterCode: `public interface Cache<K, V> {
    void put(K key, V value);
    V get(K key);
    // TODO: Add default boolean contains(K key)
}`,
        solution: `public interface Cache<K, V> {
    void put(K key, V value);
    V get(K key);
    default boolean contains(K key) {
        return get(key) != null;
    }
}`,
        testCases: [
          { input: 'cache.put("user", "Alice"), cache.contains("user")', output: 'true', explanation: 'Key exists and returns non-null.' },
          { input: 'cache.contains("missing")', output: 'false', explanation: 'get() returns null, contains evaluates to false.' }
        ]
      }
    ],
    summary: `• Interfaces define behavioral contracts; abstract classes define foundational hierarchies.
• Classes can implement multiple interfaces, enabling multiple inheritance of behavior.
• Default methods enable backwards-compatible interface evolution.
• All fields in interfaces are implicitly public static final constants.`,
    keyPoints: [
      'Java 8 introduced default and static interface methods.',
      'Java 9 introduced private interface helper methods.',
      'Abstract classes support mutable instance state and constructors.',
      'Functional interfaces contain exactly one abstract method.'
    ],
    quiz: {
      question: 'What are the implicit modifiers for any variable declared inside a Java interface?',
      options: ['public static final', 'private final', 'protected static', 'transient volatile'],
      correctIndex: 0
    }
  }),

  // ── 9. EXCEPTION HANDLING ─────────────────────────────────────────────────
  exceptions: (topic, pfx) => ({
    introduction: `Robust error handling distinguishes toy code from enterprise systems. In this lesson on **${topic}**, we master Checked vs Unchecked exceptions, the try-with-resources statement, AutoCloseable, suppressed exceptions, and best practices for creating custom business exceptions.`,
    definition: `An **Exception** is an event or condition that occurs during the execution of a program that disrupts the normal flow of instructions, represented by an object inheriting from \`java.lang.Throwable\`.`,
    explanation: `The Java Throwable hierarchy and resource management:
1. **Throwable Hierarchy:**
   - \`Error\` (JVM catastrophic failures like \`OutOfMemoryError\`, \`StackOverflowError\`; cannot be caught).
   - \`Exception\` -> Checked Exceptions (must be handled or declared with \`throws\`, e.g. \`IOException\`, \`SQLException\`).
   - \`RuntimeException\` -> Unchecked Exceptions (programmer bugs like \`NullPointerException\`, \`IndexOutOfBoundsException\`).
2. **Try-With-Resources (Java 7+):** Any object implementing \`java.lang.AutoCloseable\` declared inside \`try(Resource r = ...)\` is automatically closed when exiting the block, even if an exception is thrown.
3. **Suppressed Exceptions:** If closing a resource throws an exception while the try block also threw an exception, the close exception is attached as a "suppressed exception" accessible via \`e.getSuppressed()\`.
4. **Multi-Catch Block:** Catching multiple unrelated exceptions in a single pipe-delimited block (\`catch(IOException | SQLException e)\`). The catch variable \`e\` is implicitly final.`,
    importantConcepts: [
      'Checked exceptions enforce compile-time handling for recoverable external failures.',
      'Unchecked exceptions (subclasses of RuntimeException) indicate preventable bugs.',
      'Always preserve root causes when wrapping exceptions using new CustomException("msg", cause).',
      'Never catch Throwable or Exception and swallow it silently with an empty catch block.'
    ],
    syntax: `// Modern Try-With-Resources
try (BufferedReader br = new BufferedReader(new FileReader("config.json"))) {
    return br.readLine();
} catch (IOException e) {
    logger.error("Failed to read config", e);
    throw new ConfigurationException("Invalid config file", e);
}`,
    codeExamples: [
      {
        title: 'Example 1: Try-With-Resources and AutoCloseable Guarantee',
        description: 'Shows how try-with-resources guarantees resource cleanup in reverse order of declaration.',
        code: `class DatabaseResource implements AutoCloseable {
    private final String name;
    public DatabaseResource(String name) { this.name = name; }
    public void query() { System.out.println("Querying " + name); }
    @Override
    public void close() {
        System.out.println("Closed connection to: " + name);
    }
}

public class ${pfx}_Ex1 {
    public static void main(String[] args) {
        try (DatabaseResource db1 = new DatabaseResource("PrimaryDB");
             DatabaseResource db2 = new DatabaseResource("ReplicaDB")) {
            db1.query();
            db2.query();
        } // Both closed automatically in reverse order!
    }
}`,
        output: `Querying PrimaryDB
Querying ReplicaDB
Closed connection to: ReplicaDB
Closed connection to: PrimaryDB`
      },
      {
        title: 'Example 2: Custom Checked Business Exception with Root Cause',
        description: 'Demonstrates creating an expressive domain exception and preserving the originating root cause.',
        code: `class InsufficientFundsException extends Exception {
    private final double deficit;
    public InsufficientFundsException(String msg, double deficit, Throwable cause) {
        super(msg, cause);
        this.deficit = deficit;
    }
    public double getDeficit() { return deficit; }
}

public class ${pfx}_Ex2 {
    public static void withdraw(double balance, double amount) throws InsufficientFundsException {
        if (amount > balance) {
            throw new InsufficientFundsException("Account overdrawn", amount - balance, null);
        }
        System.out.println("Withdrawal approved: $" + amount);
    }

    public static void main(String[] args) {
        try {
            withdraw(100.0, 150.0);
        } catch (InsufficientFundsException e) {
            System.out.println("Caught exception: " + e.getMessage());
            System.out.println("Deficit needed: $" + e.getDeficit());
        }
    }
}`,
        output: `Caught exception: Account overdrawn
Deficit needed: $50.0`
      },
      {
        title: 'Example 3: Suppressed Exceptions in AutoCloseable Failures',
        description: 'Demonstrating how the JVM captures and preserves exceptions thrown during resource closing.',
        code: `class FaultyResource implements AutoCloseable {
    @Override
    public void close() throws Exception {
        throw new Exception("Close failure inside AutoCloseable");
    }
}

public class ${pfx}_Ex3 {
    public static void main(String[] args) {
        try (FaultyResource r = new FaultyResource()) {
            throw new RuntimeException("Primary operation failure");
        } catch (Exception e) {
            System.out.println("Primary Exception: " + e.getMessage());
            for (Throwable suppressed : e.getSuppressed()) {
                System.out.println("Suppressed Exception: " + suppressed.getMessage());
            }
        }
    }
}`,
        output: `Primary Exception: Primary operation failure
Suppressed Exception: Close failure inside AutoCloseable`
      }
    ],
    realWorldExample: `Spring and Hibernate convert low-level \`SQLException\` checked exceptions into an unchecked \`DataAccessException\` hierarchy, allowing web controllers to avoid propagating database-specific exceptions up through business services.`,
    commonMistakes: [
      {
        title: 'Empty Catch Blocks (Swallowing Exceptions)',
        description: 'Silently catching exceptions without logging or re-throwing destroys the stack trace and leaves bugs untraceable.',
        badCode: 'try { doWork(); } catch (Exception e) {} // Blind code!',
        goodCode: 'try { doWork(); } catch (Exception e) { log.error("Work failed", e); throw e; }'
      },
      {
        title: 'Throwing Exceptions in finally Blocks',
        description: 'Throwing an exception in a finally block overwrites and suppresses the original exception thrown in the try block.',
        badCode: 'finally { throw new RuntimeException("Finally failed"); } // Erases try exception!',
        goodCode: 'try (AutoCloseable r = ...) { ... } // Use try-with-resources instead'
      }
    ],
    interviewQuestions: [
      {
        question: 'What is the architectural difference between Checked and Unchecked exceptions?',
        answer: 'Checked exceptions inherit directly from Exception (excluding RuntimeException). The compiler enforces that callers must either catch them or declare them in a throws clause. They represent recoverable external failure modes (e.g. file missing, network timeout). Unchecked exceptions inherit from RuntimeException and represent programming bugs (null pointers, bad arguments) which should not be caught.'
      },
      {
        question: 'What happens if both the try block and a finally block execute a return statement?',
        answer: 'The finally block\'s return statement executes last and completely overrides the return value from the try block. If the try block threw an exception, a return in finally will swallow that exception entirely. This is why returning from finally is an anti-pattern.'
      }
    ],
    practiceProblems: [
      {
        title: 'Safe Integer Parser with Custom Default',
        description: 'Write a method safeParseInt(String s, int fallback) that parses a string to an integer, returning fallback if a NumberFormatException occurs.',
        starterCode: `public class SafeParser {
    public static int safeParseInt(String s, int fallback) {
        // TODO: Handle NumberFormatException safely
        return 0;
    }
}`,
        solution: `public class SafeParser {
    public static int safeParseInt(String s, int fallback) {
        try {
            return Integer.parseInt(s);
        } catch (NumberFormatException e) {
            return fallback;
        }
    }
}`,
        testCases: [
          { input: 's = "42", fallback = -1', output: '42', explanation: 'Valid integer string parses normally.' },
          { input: 's = "abc", fallback = -1', output: '-1', explanation: 'NumberFormatException caught, returns fallback.' }
        ]
      }
    ],
    summary: `• Checked exceptions enforce compile-time handling; unchecked indicate bugs.
• Use try-with-resources to automatically close AutoCloseable resources.
• Always preserve underlying root causes when wrapping exceptions.
• Never swallow exceptions silently in empty catch blocks.`,
    keyPoints: [
      'Throwable is the root class of Error and Exception.',
      'AutoCloseable ensures safe resource de-allocation even during exceptions.',
      'Suppressed exceptions capture errors thrown during resource closing.',
      'Multi-catch blocks combine unrelated exception handling without duplication.'
    ],
    quiz: {
      question: 'Which interface must a class implement to be eligible for use in a try-with-resources statement?',
      options: ['java.lang.AutoCloseable', 'java.io.Serializable', 'java.lang.Cloneable', 'java.lang.Runnable'],
      correctIndex: 0
    }
  }),

  // ── 10. MAP COLLECTIONS & HASHMAP INTERNALS ───────────────────────────────
  map_collections: (topic, pfx) => ({
    introduction: `Maps are ubiquitous associative key-value stores. In this lesson on **${topic}**, we inspect the internal architecture of \`HashMap\`, hash bucket collisions, treeification (Red-Black Trees in Java 8), load factor, and concurrent striping in \`ConcurrentHashMap\`.`,
    definition: `A **Map** in Java is an object that maps unique keys to values. \`HashMap\` is a hash table-based implementation providing average $O(1)$ time complexity for \`get\` and \`put\` operations.`,
    explanation: `HashMap internal structure and Java 8 treeification:
1. **Buckets & Array of Nodes:** \`HashMap\` stores entries in an array of \`Node<K, V>\` (default initial capacity 16).
2. **Hash Function & Index Calculation:** Key hash is spread using \`(h = key.hashCode()) ^ (h >>> 16)\` to mix upper and lower bits, then mapped to an index via \`(n - 1) & hash\`.
3. **Collision Handling & Treeification:** Colliding keys are stored in a linked list. In Java 8, when a bucket reaches **8 elements (TREEIFY_THRESHOLD)** and the total table capacity is at least **64 (MIN_TREEIFY_CAPACITY)**, the linked list is converted into a balanced **Red-Black Tree (\`TreeNode\`)**, improving worst-case search complexity from $O(N)$ to $O(\\log N)$.
4. **Resizing & Load Factor:** When \`size > capacity * loadFactor\` (default load factor 0.75), capacity doubles, and keys are rehashed using a power-of-two bit test.`,
    importantConcepts: [
      'Keys used in a HashMap MUST correctly override both equals() and hashCode().',
      'If two objects are equal according to equals(), their hashCode() MUST produce the exact same integer.',
      'HashMap permits one null key and multiple null values; ConcurrentHashMap prohibits null keys and null values entirely.',
      'ConcurrentHashMap uses Lock Striping and CAS operations rather than locking the entire map.'
    ],
    syntax: `// Standard instantiation
Map<String, User> userMap = new HashMap<>(32, 0.75f);

// Modern Map methods (Java 8+)
userMap.computeIfAbsent(id, k -> fetchUserFromDB(k));
userMap.putIfAbsent(id, defaultUser);
userMap.merge(id, newUser, (existing, incoming) -> incoming);`,
    codeExamples: [
      {
        title: 'Example 1: HashMap CRUD Operations & Modern computeIfAbsent',
        description: 'Demonstrates basic operations and functional computeIfAbsent patterns.',
        code: `import java.util.HashMap;
import java.util.Map;

public class ${pfx}_Ex1 {
    public static void main(String[] args) {
        Map<String, Integer> wordCounts = new HashMap<>();

        // Modern compute to increment word frequency
        String[] words = {"java", "code", "java", "oracle", "code", "java"};
        for (String w : words) {
            wordCounts.merge(w, 1, Integer::sum);
        }

        System.out.println("Word Frequencies: " + wordCounts);
        System.out.println("Count for 'java': " + wordCounts.get("java"));
    }
}`,
        output: `Word Frequencies: {code=2, oracle=1, java=3}
Count for 'java': 3`
      },
      {
        title: 'Example 2: The equals() and hashCode() Contract Trap',
        description: 'Reveals why failing to override hashCode() causes HashMap lookups to fail.',
        code: `import java.util.HashMap;
import java.util.Objects;

class UserKey {
    String username;
    UserKey(String u) { this.username = u; }
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof UserKey)) return false;
        return Objects.equals(username, ((UserKey) o).username);
    }
    @Override
    public int hashCode() {
        return Objects.hash(username); // Mandatory for HashMap to find the same bucket!
    }
}

public class ${pfx}_Ex2 {
    public static void main(String[] args) {
        HashMap<UserKey, String> map = new HashMap<>();
        map.put(new UserKey("admin"), "Administrator Permissions");

        // Lookup using a NEW instance with identical username
        String role = map.get(new UserKey("admin"));
        System.out.println("Lookup result: " + role);
    }
}`,
        output: `Lookup result: Administrator Permissions`
      },
      {
        title: 'Example 3: ConcurrentHashMap Atomic Thread Safety',
        description: 'Demonstrating thread-safe concurrent counting without synchronized blocks.',
        code: `import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;

public class ${pfx}_Ex3 {
    public static void main(String[] args) {
        ConcurrentHashMap<String, Integer> counter = new ConcurrentHashMap<>();
        counter.put("views", 0);

        try (var executor = Executors.newFixedThreadPool(4)) {
            for (int i = 0; i < 1000; i++) {
                executor.submit(() -> counter.compute("views", (k, v) -> v + 1));
            }
        } // All tasks finish

        System.out.println("Total Atomic Views: " + counter.get("views"));
    }
}`,
        output: `Total Atomic Views: 1000`
      }
    ],
    realWorldExample: `Spring Security and Redis caching clients use \`ConcurrentHashMap\` for in-memory session token caches, guaranteeing atomic session invalidation across thousands of simultaneous HTTP requests without global lock contention.`,
    commonMistakes: [
      {
        title: 'Overriding equals() Without Overriding hashCode()',
        description: 'Two objects may evaluate to true with equals(), but will have different default memory hashCodes, placing them in different buckets and making lookups return null.',
        badCode: 'class Key { public boolean equals(Object o) { ... } } // Missing hashCode()!',
        goodCode: 'class Key { public boolean equals(Object o) { ... } public int hashCode() { ... } }'
      },
      {
        title: 'Inserting Null Keys/Values into ConcurrentHashMap',
        description: 'Unlike standard HashMap, ConcurrentHashMap explicitly prohibits null keys and null values, throwing NullPointerException.',
        badCode: 'concurrentMap.put(null, "val"); // Throws NullPointerException!',
        goodCode: 'if (key != null && val != null) concurrentMap.put(key, val);'
      }
    ],
    interviewQuestions: [
      {
        question: 'What is HashMap Treeification in Java 8 and why was it introduced?',
        answer: 'Treeification replaces linked list collision chains with Red-Black Trees (TreeNode) when a single bucket exceeds 8 entries and total map capacity is >= 64. This prevents denial-of-service (DoS) hash collision attacks where attackers craft keys with identical hashCodes to force HashMap lookups into slow O(N) linear scans, guaranteeing O(log N) worst-case performance.'
      },
      {
        question: 'Why does HashMap require capacities to be powers of two (16, 32, 64...)?',
        answer: 'When capacity n is a power of two, the modulo operation (hash % n) can be computed using bitwise AND: (n - 1) & hash. Bitwise operations execute in a single CPU cycle, significantly faster than expensive integer division.'
      }
    ],
    practiceProblems: [
      {
        title: 'Two Sum Problem Using HashMap',
        description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target in O(N) time.',
        starterCode: `import java.util.HashMap;

public class TwoSum {
    public static int[] findIndices(int[] nums, int target) {
        // TODO: Return indices in O(N) time using HashMap
        return new int[]{};
    }
}`,
        solution: `import java.util.HashMap;

public class TwoSum {
    public static int[] findIndices(int[] nums, int target) {
        HashMap<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            if (map.containsKey(complement)) {
                return new int[]{map.get(complement), i};
            }
            map.put(nums[i], i);
        }
        return new int[]{};
    }
}`,
        testCases: [
          { input: 'nums = [2, 7, 11, 15], target = 9', output: '[0, 1]', explanation: 'nums[0] + nums[1] = 2 + 7 = 9.' },
          { input: 'nums = [3, 2, 4], target = 6', output: '[1, 2]', explanation: 'nums[1] + nums[2] = 2 + 4 = 6.' }
        ]
      }
    ],
    summary: `• HashMap provides average O(1) key-value access via hash bucketing.
• Java 8 treeifies collision buckets exceeding 8 elements into Red-Black Trees (O(log N)).
• Keys must correctly implement both equals() and hashCode().
• Use ConcurrentHashMap for thread-safe lock-striped concurrency.`,
    keyPoints: [
      'Default initial capacity is 16; default load factor is 0.75.',
      'Bitwise index calculation: (n - 1) & hash requires power-of-two sizing.',
      'Treeification threshold is 8 nodes with minimum map capacity of 64.',
      'ConcurrentHashMap does not allow null keys or values.'
    ],
    quiz: {
      question: 'What data structure replaces a linked list bucket in a Java 8 HashMap when collisions exceed 8?',
      options: ['Red-Black Balanced Binary Search Tree', 'Min-Heap', 'B+ Tree', 'Doubly Linked Circular List'],
      correctIndex: 0
    }
  }),

  // ── 11. GENERICS & TYPE ERASURE ───────────────────────────────────────────
  generics: (topic, pfx) => ({
    introduction: `Generics bring compile-time type safety and eliminate runtime ClassCastExceptions. In this lesson on **${topic}**, we demystify Type Erasure, bounded wildcards (\`? extends\` vs \`? super\`), the PECS principle, and generic method signatures.`,
    definition: `**Generics** are a Java language mechanism allowing classes, interfaces, and methods to operate on parameterized types, providing compile-time type checking and eliminating explicit casting.`,
    explanation: `Type Erasure and Generic Variance:
1. **Compile-Time Type Erasure:** The Java compiler translates generic code into non-generic bytecode by stripping away type parameters and inserting explicit casts. At runtime, the JVM has NO knowledge of generic types (e.g., \`List<String>\` and \`List<Integer>\` both compile to raw \`List\`).
2. **Wildcards & Variance:** Java generics are invariant: \`List<Dog>\` is NOT a \`List<Animal>\`. To allow polymorphic collections, use bounded wildcards.
3. **PECS Principle (Producer Extends, Consumer Super):**
   - **Producer Extends (\`? extends T\`):** Use when you only READ data from the collection. You cannot add items (except \`null\`).
   - **Consumer Super (\`? super T\`):** Use when you only WRITE data into the collection.
4. **Bridge Methods:** The compiler automatically generates synthetic bridge methods to preserve polymorphic method overriding when subclasses extend generic types.`,
    importantConcepts: [
      'Type Erasure means generic type parameters do not exist at runtime.',
      'Cannot instantiate generic types directly: new T() is forbidden in Java.',
      'Cannot create generic arrays: new T[10] or new List<String>[10] is illegal.',
      'Primitive types cannot be type arguments; use wrapper classes (List<Integer>).',
      'PECS: Producer Extends, Consumer Super.'
    ],
    syntax: `// Generic Class & Bounded Type Parameter
public class Repository<T extends Identifiable> {
    public void save(T entity) { ... }
}

// PECS Wildcard Method
public static <T> void copy(List<? super T> dest, List<? extends T> src) {
    for (T elem : src) dest.add(elem);
}`,
    codeExamples: [
      {
        title: 'Example 1: Generic Class & Type Safety',
        description: 'Demonstrating compile-time type safety preventing ClassCastException.',
        code: `class Box<T> {
    private T item;
    public void set(T item) { this.item = item; }
    public T get() { return item; }
}

public class ${pfx}_Ex1 {
    public static void main(String[] args) {
        Box<String> stringBox = new Box<>();
        stringBox.set("Java 17");
        String val = stringBox.get(); // No cast needed!

        Box<Integer> intBox = new Box<>();
        intBox.set(100);

        System.out.println("String Box item: " + val);
        System.out.println("Integer Box item: " + intBox.get());
    }
}`,
        output: `String Box item: Java 17
Integer Box item: 100`
      },
      {
        title: 'Example 2: The PECS Principle (Producer Extends, Consumer Super)',
        description: 'Demonstrating wildcard variance allowing reading from subtypes and writing to supertypes.',
        code: `import java.util.ArrayList;
import java.util.List;

public class ${pfx}_Ex2 {
    // Producer Extends: Read numbers from producer
    public static double sumOfList(List<? extends Number> list) {
        double s = 0.0;
        for (Number n : list) {
            s += n.doubleValue();
        }
        return s;
    }

    // Consumer Super: Add integers into consumer
    public static void addIntegers(List<? super Integer> list) {
        list.add(10);
        list.add(20);
    }

    public static void main(String[] args) {
        List<Double> doubleList = List.of(1.5, 2.5, 3.0);
        System.out.println("Sum of doubles: " + sumOfList(doubleList));

        List<Number> numList = new ArrayList<>();
        addIntegers(numList);
        System.out.println("Consumer list after additions: " + numList);
    }
}`,
        output: `Sum of doubles: 7.0
Consumer list after additions: [10, 20]`
      },
      {
        title: 'Example 3: Type Erasure Verification via Reflection',
        description: 'Proves that generic type arguments are erased at runtime in bytecode.',
        code: `import java.util.ArrayList;

public class ${pfx}_Ex3 {
    public static void main(String[] args) {
        ArrayList<String> strings = new ArrayList<>();
        ArrayList<Integer> numbers = new ArrayList<>();

        System.out.println("strings class: " + strings.getClass());
        System.out.println("numbers class: " + numbers.getClass());
        System.out.println("Are their classes identical at runtime? " + (strings.getClass() == numbers.getClass()));
    }
}`,
        output: `strings class: class java.util.ArrayList
numbers class: class java.util.ArrayList
Are their classes identical at runtime? true`
      }
    ],
    realWorldExample: `The Java Collections \`Collections.copy(List<? super T> dest, List<? extends T> src)\` method uses PECS to guarantee that any collection of numbers can be safely copied into a collection of general Objects.`,
    commonMistakes: [
      {
        title: 'Attempting to Add Elements to a List<? extends T>',
        description: 'Because the exact subtype is unknown at compile time, the compiler forbids adding any object except null to a ? extends collection.',
        badCode: 'List<? extends Number> list = new ArrayList<Integer>(); list.add(10); // Compile error!',
        goodCode: 'List<? super Integer> list = new ArrayList<Number>(); list.add(10); // Allowed with super'
      },
      {
        title: 'Creating Generic Arrays',
        description: 'Generic arrays are forbidden because type erasure combined with array covariance would violate type safety at runtime.',
        badCode: 'T[] items = new T[10]; // Compile error: generic array creation',
        goodCode: 'List<T> items = new ArrayList<>(); // Use generic collections instead'
      }
    ],
    interviewQuestions: [
      {
        question: 'What is Type Erasure and why did Java adopt it?',
        answer: 'Type Erasure is the compile-time process where the compiler removes all generic type parameters and replaces them with their raw bounds (or Object if unbounded), inserting casts where necessary. Java adopted this in Java 5 to maintain 100% binary backward compatibility with pre-generic legacy code and existing class files.'
      },
      {
        question: 'Explain the PECS rule with an example.',
        answer: 'PECS stands for Producer Extends, Consumer Super. If your method parameter only reads/produces values of type T, declare it as <? extends T> so callers can pass any subtype. If your method parameter writes/consumes values of type T, declare it as <? super T> so callers can pass any supertype container.'
      }
    ],
    practiceProblems: [
      {
        title: 'Generic Pair Swap Function',
        description: 'Write a generic method swapPair that takes a Pair<A, B> and returns a new Pair<B, A> with inverted elements.',
        starterCode: `class Pair<A, B> {
    A first; B second;
    Pair(A a, B b) { this.first = a; this.second = b; }
}
public class PairUtil {
    public static <A, B> Pair<B, A> swapPair(Pair<A, B> p) {
        // TODO: Return swapped pair
        return null;
    }
}`,
        solution: `public class PairUtil {
    public static <A, B> Pair<B, A> swapPair(Pair<A, B> p) {
        return new Pair<>(p.second, p.first);
    }
}`,
        testCases: [
          { input: 'Pair("Age", 25)', output: 'Pair(25, "Age")', explanation: 'Swaps types and values.' },
          { input: 'Pair(1, 2)', output: 'Pair(2, 1)', explanation: 'Swaps integer pair.' }
        ]
      }
    ],
    summary: `• Generics provide compile-time type safety and eliminate runtime ClassCastExceptions.
• Type Erasure strips type parameters at compile time for backward compatibility.
• Use the PECS rule: Producer Extends, Consumer Super.
• Generic arrays and direct instantiation (new T()) are forbidden.`,
    keyPoints: [
      'Generics are invariant: List<Dog> is not a List<Animal>.',
      'Wildcards (? extends and ? super) introduce variance.',
      'Type Erasure replaces type arguments with Object or the bound.',
      'Bridge methods preserve polymorphism across type-erased inheritance.'
    ],
    quiz: {
      question: 'Which wildcard should be used when a method parameter only reads data from a collection of numbers?',
      options: ['List<? extends Number>', 'List<? super Number>', 'List<Number>', 'List<?>'],
      correctIndex: 0
    }
  }),

  // ── 12. THREADS & CONCURRENCY BASICS ──────────────────────────────────────
  threads_basics: (topic, pfx) => ({
    introduction: `Concurrency enables Java applications to execute multiple tasks simultaneously. In this lesson on **${topic}**, we inspect the 6 thread lifecycle states, the Runnable and Callable interfaces, daemon threads, and cooperative cancellation via thread interruption.`,
    definition: `A **Thread** is the smallest unit of execution within a Java process, managed either by the OS kernel (Platform Threads) or by the JVM runtime (Virtual Threads).`,
    explanation: `The 6 Thread States in \`java.lang.Thread.State\`:
1. **NEW:** Thread instance created via \`new Thread()\` but \`start()\` not yet called.
2. **RUNNABLE:** Thread is actively running or ready to run in the OS thread scheduler queue.
3. **BLOCKED:** Waiting to acquire an intrinsic monitor lock held by another thread.
4. **WAITING:** Waiting indefinitely for another thread to perform an action (e.g. \`Object.wait()\`, \`Thread.join()\`).
5. **TIMED_WAITING:** Waiting for a specified timeout period (e.g. \`Thread.sleep(ms)\`, \`wait(ms)\`).
6. **TERMINATED:** Thread has finished executing its \`run()\` method or terminated with an uncaught exception.`,
    importantConcepts: [
      'Always call thread.start(), NEVER thread.run() directly (run() runs synchronously on current thread).',
      'Java thread cancellation is cooperative via interrupt(); threads must check isInterrupted().',
      'Daemon threads terminate automatically when all user threads finish executing.',
      'Callable<V> can return values and throw checked exceptions; Runnable cannot.'
    ],
    syntax: `// Creating a thread via lambda
Thread t = new Thread(() -> {
    System.out.println("Running in: " + Thread.currentThread().getName());
});
t.setName("Worker-1");
t.start();
t.join(); // Wait for completion`,
    codeExamples: [
      {
        title: 'Example 1: Thread Lifecycle State Inspection',
        description: 'Observing NEW, RUNNABLE, TIMED_WAITING, and TERMINATED states.',
        code: `public class ${pfx}_Ex1 {
    public static void main(String[] args) throws Exception {
        Thread worker = new Thread(() -> {
            try {
                Thread.sleep(100);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        });

        System.out.println("State before start: " + worker.getState()); // NEW
        worker.start();
        System.out.println("State after start: " + worker.getState()); // RUNNABLE
        Thread.sleep(20);
        System.out.println("State during sleep: " + worker.getState()); // TIMED_WAITING
        worker.join();
        System.out.println("State after completion: " + worker.getState()); // TERMINATED
    }
}`,
        output: `State before start: NEW
State after start: RUNNABLE
State during sleep: TIMED_WAITING
State after completion: TERMINATED`
      },
      {
        title: 'Example 2: Cooperative Thread Cancellation via Interruption',
        description: 'Demonstrating how threads gracefully terminate by checking isInterrupted().',
        code: `public class ${pfx}_Ex2 {
    public static void main(String[] args) throws Exception {
        Thread task = new Thread(() -> {
            int count = 0;
            while (!Thread.currentThread().isInterrupted()) {
                count++;
                try {
                    Thread.sleep(50);
                } catch (InterruptedException e) {
                    System.out.println("Interrupted during sleep! Cleaning up resources...");
                    Thread.currentThread().interrupt(); // Restore interrupted status
                    break;
                }
            }
            System.out.println("Task exited cleanly with count: " + count);
        });

        task.start();
        Thread.sleep(120);
        task.interrupt(); // Signal thread to stop
        task.join();
    }
}`,
        output: `Interrupted during sleep! Cleaning up resources...
Task exited cleanly with count: 3`
      },
      {
        title: 'Example 3: Callable and Future Value Retrieval',
        description: 'Using Callable<V> with ExecutorService to compute and return a result asynchronously.',
        code: `import java.util.concurrent.*;

public class ${pfx}_Ex3 {
    public static void main(String[] args) throws Exception {
        ExecutorService executor = Executors.newSingleThreadExecutor();

        Callable<Integer> calculation = () -> {
            int total = 0;
            for (int i = 1; i <= 10; i++) total += i;
            return total;
        };

        Future<Integer> future = executor.submit(calculation);
        System.out.println("Calculation result from Future: " + future.get());
        executor.shutdown();
    }
}`,
        output: `Calculation result from Future: 55`
      }
    ],
    realWorldExample: `Web servers (Tomcat, Jetty) maintain a pool of worker threads. Each HTTP request is assigned to a thread that processes filters, business services, and database queries before returning a response to the client.`,
    commonMistakes: [
      {
        title: 'Calling run() Instead of start()',
        description: 'Calling thread.run() executes the method synchronously in the caller\'s thread rather than spawning a new thread.',
        badCode: 'Thread t = new Thread(task); t.run(); // Runs on main thread!',
        goodCode: 'Thread t = new Thread(task); t.start(); // Spawns new thread'
      },
      {
        title: 'Swallowing InterruptedException',
        description: 'Catching InterruptedException and ignoring it clears the interrupt flag, preventing parent threads from canceling the task.',
        badCode: 'try { Thread.sleep(100); } catch (InterruptedException e) {} // Lost signal!',
        goodCode: 'try { Thread.sleep(100); } catch (InterruptedException e) { Thread.currentThread().interrupt(); }'
      }
    ],
    interviewQuestions: [
      {
        question: 'What is the difference between Runnable and Callable in Java?',
        answer: 'Runnable has a void run() method that cannot return a result and cannot throw checked exceptions. Callable<V> has a V call() method that returns a typed result and can throw checked exceptions, used with ExecutorService and Futures.'
      },
      {
        question: 'What happens to daemon threads when all non-daemon user threads terminate?',
        answer: 'The JVM exits immediately. Any running daemon threads are abruptly abandoned without executing finally blocks or resource cleanup routines. Daemon threads should only be used for background tasks like GC or monitoring.'
      }
    ],
    practiceProblems: [
      {
        title: 'Asynchronous Factorial Computation',
        description: 'Write a method calculateFactorialAsync(int n) that calculates n! asynchronously using a Callable and returns the Future<Long>.',
        starterCode: `import java.util.concurrent.*;

public class AsyncMath {
    public static Future<Long> calculateFactorialAsync(ExecutorService pool, int n) {
        // TODO: Submit Callable to pool
        return null;
    }
}`,
        solution: `import java.util.concurrent.*;

public class AsyncMath {
    public static Future<Long> calculateFactorialAsync(ExecutorService pool, int n) {
        return pool.submit(() -> {
            long fact = 1;
            for (int i = 2; i <= n; i++) fact *= i;
            return fact;
        });
    }
}`,
        testCases: [
          { input: 'n = 5', output: '120', explanation: '5! = 120.' },
          { input: 'n = 0', output: '1', explanation: '0! = 1.' }
        ]
      }
    ],
    summary: `• The JVM defines 6 distinct Thread states: NEW, RUNNABLE, BLOCKED, WAITING, TIMED_WAITING, TERMINATED.
• Always call start() to spawn a thread; run() executes synchronously.
• Java thread cancellation is cooperative using thread.interrupt().
• Daemon threads terminate abruptly when all user threads complete.`,
    keyPoints: [
      'Threads represent independent units of execution within a process.',
      'InterruptedException restores the thread\'s interrupted status via interrupt().',
      'Callable<T> returns values and throws exceptions, unlike Runnable.',
      'Future.get() blocks until the asynchronous computation finishes.'
    ],
    quiz: {
      question: 'Which method must be invoked to begin concurrent execution of a new Thread?',
      options: ['thread.start()', 'thread.run()', 'thread.execute()', 'thread.spawn()'],
      correctIndex: 0
    }
  }),

  // ── 13. SYNCHRONIZATION & LOCKS ───────────────────────────────────────────
  synchronization: (topic, pfx) => ({
    introduction: `Shared mutable state is the root of all concurrency bugs. In this lesson on **${topic}**, we master thread synchronization, the \`synchronized\` keyword, intrinsic monitor locks, \`ReentrantLock\`, Condition variables, and atomic operations.`,
    definition: `**Synchronization** is a mechanism that guarantees mutual exclusion, ensuring that only one thread can access a shared resource or critical section at any given time, preventing race conditions and data corruption.`,
    explanation: `Java intrinsic locks and explicit ReentrantLock mechanics:
1. **Intrinsic Monitor Locks:** Every Java Object has an internal monitor. The \`synchronized\` keyword automatically acquires the object's monitor upon entering and releases it upon exiting (even if an exception occurs).
2. **Reentrancy:** If a thread holds a lock, it can acquire the same lock again without deadlocking itself (reentrant lock acquisition increments a hold counter).
3. **ReentrantLock API:** Part of \`java.util.concurrent.locks\`. Provides advanced capabilities over \`synchronized\`: \`tryLock()\` with timeouts, fair lock queuing, and interruptible lock acquisition.
4. **Condition Variables:** Replaces legacy \`Object.wait()\` and \`notify()\` with explicit \`condition.await()\` and \`condition.signal()\`, allowing multiple wait-sets per lock.`,
    importantConcepts: [
      'Synchronized instance methods lock on this; synchronized static methods lock on ClassName.class.',
      'Always release explicit locks inside a finally block: lock.lock(); try { ... } finally { lock.unlock(); }.',
      'tryLock() enables non-blocking lock acquisition, preventing thread starvation.',
      'Excessive synchronization causes lock contention and degrades scalability.'
    ],
    syntax: `// Intrinsic synchronized method
public synchronized void deposit(double amount) { ... }

// Explicit ReentrantLock
ReentrantLock lock = new ReentrantLock();
lock.lock();
try {
    balance += amount;
} finally {
    lock.unlock(); // Guaranteed unlock
}`,
    codeExamples: [
      {
        title: 'Example 1: Race Condition Fix via Synchronized Block',
        description: 'Demonstrating how synchronization eliminates race conditions in concurrent increments.',
        code: `public class ${pfx}_Ex1 {
    private static int counter = 0;
    private static final Object lock = new Object();

    public static void increment() {
        synchronized (lock) {
            counter++;
        }
    }

    public static void main(String[] args) throws Exception {
        Thread t1 = new Thread(() -> { for (int i = 0; i < 5000; i++) increment(); });
        Thread t2 = new Thread(() -> { for (int i = 0; i < 5000; i++) increment(); });

        t1.start(); t2.start();
        t1.join(); t2.join();

        System.out.println("Final Synchronized Counter: " + counter);
    }
}`,
        output: `Final Synchronized Counter: 10000`
      },
      {
        title: 'Example 2: Non-Blocking Lock Acquisition with tryLock()',
        description: 'Shows how tryLock() prevents threads from blocking indefinitely when a resource is busy.',
        code: `import java.util.concurrent.locks.ReentrantLock;

public class ${pfx}_Ex2 {
    private static final ReentrantLock lock = new ReentrantLock();

    public static void attemptTask(String threadName) {
        if (lock.tryLock()) {
            try {
                System.out.println(threadName + " acquired lock and is working");
                Thread.sleep(50);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            } finally {
                lock.unlock();
                System.out.println(threadName + " released lock");
            }
        } else {
            System.out.println(threadName + " could not acquire lock, proceeding to alternate task");
        }
    }

    public static void main(String[] args) throws Exception {
        Thread t1 = new Thread(() -> attemptTask("Thread-1"));
        Thread t2 = new Thread(() -> attemptTask("Thread-2"));

        t1.start();
        t2.start();
        t1.join(); t2.join();
    }
}`,
        output: `Thread-1 acquired lock and is working
Thread-2 could not acquire lock, proceeding to alternate task
Thread-1 released lock`
      },
      {
        title: 'Example 3: Condition Variable Signaling (Producer-Consumer)',
        description: 'Demonstrates await() and signal() for precise inter-thread coordination.',
        code: `import java.util.concurrent.locks.*;

class BoundedBuffer {
    final Lock lock = new ReentrantLock();
    final Condition notFull  = lock.newCondition(); 
    final Condition notEmpty = lock.newCondition(); 
    final Object[] items = new Object[2];
    int putptr, takeptr, count;

    public void put(Object x) throws InterruptedException {
        lock.lock();
        try {
            while (count == items.length) notFull.await();
            items[putptr] = x;
            if (++putptr == items.length) putptr = 0;
            ++count;
            System.out.println("Produced: " + x);
            notEmpty.signal();
        } finally { lock.unlock(); }
    }

    public Object take() throws InterruptedException {
        lock.lock();
        try {
            while (count == 0) notEmpty.await();
            Object x = items[takeptr];
            if (++takeptr == items.length) takeptr = 0;
            --count;
            System.out.println("Consumed: " + x);
            notFull.signal();
            return x;
        } finally { lock.unlock(); }
    }
}

public class ${pfx}_Ex3 {
    public static void main(String[] args) throws Exception {
        BoundedBuffer buf = new BoundedBuffer();
        Thread p = new Thread(() -> { try { buf.put("Msg-1"); buf.put("Msg-2"); } catch (Exception e) {} });
        Thread c = new Thread(() -> { try { buf.take(); } catch (Exception e) {} });
        p.start(); p.join();
        c.start(); c.join();
    }
}`,
        output: `Produced: Msg-1
Produced: Msg-2
Consumed: Msg-1`
      }
    ],
    realWorldExample: `High-throughput message queues (like Apache Kafka\'s internal buffer pool or Disruptor) use explicit \`ReentrantLock\` and \`Condition\` objects to manage ring buffer memory allocations without burning CPU in busy-wait polling loops.`,
    commonMistakes: [
      {
        title: 'Forgetting to Unlock in a finally Block',
        description: 'If an exception is thrown before lock.unlock() is reached, the lock is never released, permanently freezing other threads.',
        badCode: 'lock.lock(); doWork(); lock.unlock(); // Leak on exception!',
        goodCode: 'lock.lock(); try { doWork(); } finally { lock.unlock(); }'
      },
      {
        title: 'Synchronizing on Mutable or Reassigned Objects',
        description: 'Synchronizing on a variable that changes references means threads synchronize on different objects, breaking mutual exclusion.',
        badCode: 'synchronized (myString) { myString = "new"; } // Broken lock target!',
        goodCode: 'private final Object lock = new Object(); synchronized (lock) { ... }'
      }
    ],
    interviewQuestions: [
      {
        question: 'What are the key advantages of ReentrantLock over the synchronized keyword?',
        answer: '1. Non-blocking lock attempts via tryLock(). 2. Timed lock acquisitions via tryLock(timeout, unit). 3. Interruptible lock acquisition via lockInterruptibly(). 4. Multiple independent Condition wait-sets. 5. Support for Fair locking policies where threads acquire locks in FIFO order.'
      },
      {
        question: 'Why must Condition.await() always be invoked inside a while loop rather than an if statement?',
        answer: 'To protect against spurious wakeups (where a thread wakes up without being signaled) and state changes that occur between when the thread was signaled and when it actually re-acquires the lock. The condition must be re-checked.'
      }
    ],
    practiceProblems: [
      {
        title: 'Thread-Safe Counter with ReentrantLock',
        description: 'Implement a thread-safe Counter class using ReentrantLock providing increment(), decrement(), and getValue().',
        starterCode: `import java.util.concurrent.locks.ReentrantLock;

public class SafeCounter {
    private int value = 0;
    private final ReentrantLock lock = new ReentrantLock();

    // TODO: Implement increment, decrement, getValue
}`,
        solution: `import java.util.concurrent.locks.ReentrantLock;

public class SafeCounter {
    private int value = 0;
    private final ReentrantLock lock = new ReentrantLock();

    public void increment() {
        lock.lock();
        try { value++; } finally { lock.unlock(); }
    }
    public void decrement() {
        lock.lock();
        try { value--; } finally { lock.unlock(); }
    }
    public int getValue() {
        lock.lock();
        try { return value; } finally { lock.unlock(); }
    }
}`,
        testCases: [
          { input: 'increment() twice, decrement() once', output: '1', explanation: '2 - 1 = 1.' },
          { input: 'initial state', output: '0', explanation: 'Initial value is 0.' }
        ]
      }
    ],
    summary: `• Synchronization enforces mutual exclusion across critical sections.
• Synchronized blocks use intrinsic monitor locks and release automatically.
• ReentrantLock provides advanced features: tryLock(), fairness, and Conditions.
• Always unlock explicit locks in a finally block to avoid permanent deadlocks.`,
    keyPoints: [
      'Intrinsic locks are reentrant: a thread holding a lock can re-acquire it.',
      'Synchronizing on static methods locks the Class object.',
      'ReentrantLock.tryLock() prevents indefinite thread blocking.',
      'Condition.await() must always be called inside a while loop.'
    ],
    quiz: {
      question: 'Where should ReentrantLock.unlock() always be placed to guarantee lock release?',
      options: ['Inside a finally block', 'Directly after the critical section', 'Inside the catch block', 'In a static initializer'],
      correctIndex: 0
    }
  }),

  // ── 14. STREAM API & FUNCTIONAL PROGRAMMING ───────────────────────────────
  stream_api: (topic, pfx) => ({
    introduction: `Java 8\'s Stream API transformed Java from imperative data processing into declarative, functional pipelines. In this lesson on **${topic}**, we inspect lazy intermediate operations, terminal operations, parallel streams, and powerful custom Collectors.`,
    definition: `A **Stream** in Java is a sequence of elements supporting sequential and parallel aggregate operations computed lazily from a data source without modifying the underlying source collection.`,
    explanation: `Stream pipeline lifecycle and lazy evaluation:
1. **Pipeline Architecture:**
   - **Data Source:** Collections, arrays, or I/O channels (\`list.stream()\`).
   - **Intermediate Operations (Lazy):** Transform streams into another stream (\`filter()\`, \`map()\`, \`flatMap()\`, \`sorted()\`, \`distinct()\`). No execution happens until a terminal operation is called.
   - **Terminal Operation (Eager):** Triggers data processing and produces a result or side-effect (\`collect()\`, \`forEach()\`, \`reduce()\`, \`count()\`, \`findFirst()\`).
2. **Short-Circuiting Operations:** Operations like \`limit(n)\`, \`findFirst()\`, and \`anyMatch()\` terminate stream traversal early as soon as the condition is satisfied.
3. **Parallel Streams:** \`list.parallelStream()\` divides tasks across the common \`ForkJoinPool.commonPool()\`. Effective only when $N \\times Q > 10,000$ (where $N$ is element count and $Q$ is per-element computation complexity).
4. **Collectors Utility:** \`Collectors.groupingBy()\`, \`Collectors.partitioningBy()\`, and \`Collectors.joining()\` offer expressive SQL-like aggregation.`,
    importantConcepts: [
      'Streams are single-use: once consumed by a terminal operation, they cannot be reused.',
      'Streams do not store data; they operate on a pipeline of elements.',
      'Intermediate operations are evaluated lazily; intermediate steps fuse into a single pass.',
      'Avoid shared mutable state inside parallel stream lambdas (leads to race conditions).'
    ],
    syntax: `// Declarative Stream Pipeline
List<String> activeAdmins = users.stream()
    .filter(User::isActive)
    .filter(u -> u.getRole() == Role.ADMIN)
    .map(User::getEmail)
    .sorted()
    .collect(Collectors.toList());`,
    codeExamples: [
      {
        title: 'Example 1: Filter, Map, and Collect Pipeline',
        description: 'Demonstrating clean transformation of business objects using stream pipelines.',
        code: `import java.util.List;
import java.util.stream.Collectors;

class Product {
    String name; double price;
    Product(String n, double p) { this.name = n; this.price = p; }
    public String getName() { return name; }
    public double getPrice() { return price; }
}

public class ${pfx}_Ex1 {
    public static void main(String[] args) {
        List<Product> catalog = List.of(
            new Product("Laptop", 1200.0),
            new Product("Mouse", 25.0),
            new Product("Monitor", 350.0),
            new Product("USB Cable", 15.0)
        );

        // Filter premium products (> $100), map to uppercase name, collect to list
        List<String> premiumNames = catalog.stream()
            .filter(p -> p.getPrice() > 100.0)
            .map(p -> p.getName().toUpperCase())
            .sorted()
            .collect(Collectors.toList());

        System.out.println("Premium Products: " + premiumNames);
    }
}`,
        output: `Premium Products: [LAPTOP, MONITOR]`
      },
      {
        title: 'Example 2: GroupingBy and Aggregation with Collectors',
        description: 'Shows how Collectors.groupingBy provides SQL-like GROUP BY capabilities in memory.',
        code: `import java.util.*;
import java.util.stream.Collectors;

class Employee {
    String department; double salary;
    Employee(String d, double s) { this.department = d; this.salary = s; }
    public String getDepartment() { return department; }
    public double getSalary() { return salary; }
}

public class ${pfx}_Ex2 {
    public static void main(String[] args) {
        List<Employee> staff = List.of(
            new Employee("IT", 95000),
            new Employee("HR", 60000),
            new Employee("IT", 105000),
            new Employee("HR", 65000),
            new Employee("Finance", 90000)
        );

        // Group by department and calculate average salary
        Map<String, Double> avgSalaryPerDept = staff.stream()
            .collect(Collectors.groupingBy(
                Employee::getDepartment,
                Collectors.averagingDouble(Employee::getSalary)
            ));

        System.out.println("Average Salaries: " + avgSalaryPerDept);
    }
}`,
        output: `Average Salaries: {Finance=90000.0, HR=62500.0, IT=100000.0}`
      },
      {
        title: 'Example 3: Lazy Evaluation Proof in Stream Execution',
        description: 'Proves that intermediate operations do not execute until a terminal operation is called.',
        code: `import java.util.List;

public class ${pfx}_Ex3 {
    public static void main(String[] args) {
        List<String> items = List.of("apple", "banana", "cherry");

        System.out.println("Constructing stream pipeline...");
        var stream = items.stream()
            .filter(s -> {
                System.out.println("Filtering: " + s);
                return s.startsWith("b");
            });

        System.out.println("Stream pipeline constructed (no elements processed yet!)");
        System.out.println("Invoking terminal operation findFirst():");
        String match = stream.findFirst().orElse("None");
        System.out.println("Found: " + match);
    }
}`,
        output: `Constructing stream pipeline...
Stream pipeline constructed (no elements processed yet!)
Invoking terminal operation findFirst():
Filtering: apple
Filtering: banana
Found: banana`
      }
    ],
    realWorldExample: `Modern analytics pipelines in Spring Boot and Spark Java use Stream pipelines to filter sensor telemetry, group readings by device UUID, and calculate 99th-percentile latencies without saving intermediate lists to memory.`,
    commonMistakes: [
      {
        title: 'Reusing a Consumed Stream',
        description: 'Invoking a second terminal operation on an already-consumed stream throws IllegalStateException.',
        badCode: 'Stream<String> s = list.stream(); s.forEach(...); s.count(); // Throws IllegalStateException!',
        goodCode: 'list.stream().forEach(...); list.stream().count(); // Create fresh stream'
      },
      {
        title: 'Mutating Shared State Inside Parallel Streams',
        description: 'Using list.add() inside a parallel stream causes data loss and ArrayIndexOutOfBoundsException.',
        badCode: 'List<Integer> out = new ArrayList<>(); nums.parallelStream().forEach(out::add); // Race condition!',
        goodCode: 'List<Integer> out = nums.parallelStream().collect(Collectors.toList()); // Thread-safe'
      }
    ],
    interviewQuestions: [
      {
        question: 'What is the difference between Intermediate and Terminal operations in the Java Stream API?',
        answer: 'Intermediate operations (filter, map, sorted) return a new Stream and are executed lazily. They do not process data until a terminal operation is called. Terminal operations (collect, forEach, reduce) trigger the pipeline processing, produce a non-stream result, and close the stream.'
      },
      {
        question: 'When should you use a Parallel Stream versus a Sequential Stream?',
        answer: 'Use parallel streams only when: 1. You have a large dataset (thousands of elements). 2. Per-element operations are computationally intensive. 3. The data structure splits efficiently (like ArrayList or primitive arrays, not LinkedList). 4. Operations are completely stateless and free of shared mutable state.'
      }
    ],
    practiceProblems: [
      {
        title: 'Filter Even Squares using Stream Pipeline',
        description: 'Given a list of integers, filter out odd numbers, square the remaining even numbers, and return the list of squared results.',
        starterCode: `import java.util.List;

public class StreamFilter {
    public static List<Integer> evenSquares(List<Integer> nums) {
        // TODO: Return even squares via stream
        return List.of();
    }
}`,
        solution: `import java.util.List;
import java.util.stream.Collectors;

public class StreamFilter {
    public static List<Integer> evenSquares(List<Integer> nums) {
        return nums.stream()
            .filter(n -> n % 2 == 0)
            .map(n -> n * n)
            .collect(Collectors.toList());
    }
}`,
        testCases: [
          { input: 'nums = [1, 2, 3, 4, 5]', output: '[4, 16]', explanation: '2^2 = 4, 4^2 = 16.' },
          { input: 'nums = [1, 3, 5]', output: '[]', explanation: 'No even numbers.' }
        ]
      }
    ],
    summary: `• Streams process data declaratively without modifying underlying collections.
• Intermediate operations are evaluated lazily; terminal operations trigger processing.
• Collectors provide powerful grouping, partitioning, and aggregation tools.
• Parallel streams utilize the common ForkJoinPool for multicore throughput.`,
    keyPoints: [
      'Streams are single-use and cannot be traversed more than once.',
      'Intermediate operations fuse into a single-pass traversal.',
      'Collectors.groupingBy enables in-memory hierarchical aggregation.',
      'Parallel streams require stateless, thread-safe lambda expressions.'
    ],
    quiz: {
      question: 'Which of the following is a Terminal Operation in the Java Stream API?',
      options: ['collect()', 'filter()', 'map()', 'distinct()'],
      correctIndex: 0
    }
  })
};

module.exports = { DOMAIN_DATA };
