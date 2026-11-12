/**
 * OOP'S ORACLE - Universal Topic Synthesis Engine
 * Generates 100% topic-matched, highly technical educational content
 * for every single lesson across all 20 Java courses.
 */

function generateTopicContent(course, moduleName, topic, classPfx) {
  const t = topic.toLowerCase();
  const m = moduleName.toLowerCase();
  const safeTitle = topic.replace(/["']/g, '');

  // Build topic-specific code examples and technical content
  const topicData = buildTopicData(course, moduleName, topic, classPfx);

  return {
    id: course.id * 100 + topicData.lessonNum,
    courseId: course.id,
    lessonNumber: topicData.lessonNum,
    title: topic,
    module: moduleName,
    duration: '15 min',
    isFreePreview: true,
    isLocked: false,
    isCompleted: false,

    introduction: topicData.introduction,
    definition: topicData.definition,
    explanation: topicData.explanation,
    importantConcepts: topicData.importantConcepts,
    syntax: topicData.syntax,

    codeExamples: topicData.codeExamples,
    codeExample: topicData.codeExamples[0].code,
    expectedOutput: topicData.codeExamples[0].output,
    content: `${topicData.introduction}\n\n${topicData.explanation}`,

    realWorldExample: topicData.realWorldExample,
    commonMistakes: topicData.commonMistakes,
    interviewQuestions: topicData.interviewQuestions,
    practiceQuestions: topicData.interviewQuestions.map(q => ({ question: q.question, answer: q.answer })),

    practiceProblems: topicData.practiceProblems,
    miniExercise: {
      prompt: topicData.practiceProblems[0].description,
      starterCode: topicData.practiceProblems[0].starterCode,
      solution: topicData.practiceProblems[0].solution
    },

    summary: topicData.summary,
    keyPoints: topicData.keyPoints,

    quizQuestion: topicData.quiz.question,
    quizOptions: topicData.quiz.options,
    quizCorrectIndex: topicData.quiz.correctIndex
  };
}

module.exports = { generateTopicContent };
