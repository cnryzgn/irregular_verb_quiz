export interface QuestionData {
    question: string;
    shownVerb: string;
    shownVerbForm: string; // v1/v2/v3
}

export interface ExamResult {
    answer: string;
    questionData: QuestionData;
    currentQuestion: number;
    completedQuestionLocations: number[]; // [1, 4, 6] null answers don't contain here.
    correctAnswer: string;
    totalQuestion: number;
    timeLeft: number;
    isInvalidAnswer: boolean;
}