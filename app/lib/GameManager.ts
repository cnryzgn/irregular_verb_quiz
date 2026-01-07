import {
    IGameManager,
    Question,
    VerbRandomizer,
    VerbForm,
    IDifficultyConfig,
    ExamResult,
} from "../interfaces";
import { DIFFICULTY_SETTINGS } from "../constants/difficulty";

// Zorluk ayarlarını merkezi bir yerde topluyoruz
// Bunu sonradan /config içine falan al
export class GameManager implements IGameManager {
    public score: number = 0;
    public readonly difficulty: IDifficultyConfig
    public irregularVerbs: VerbForm[];
    public examResult: ExamResult[] = [];

    // static questions.
    private readonly questions: Record<'v1' | 'v2' | 'v3', string> = {
        v1: "What is the base form (v1) version of this verb?",
        v2: "What is the past simple (v2) version of this verb?",
        v3: "What is the past participle (v3) version of this verb?"
    };

    constructor(
        irregularVerbs: VerbForm[],
        level: keyof typeof DIFFICULTY_SETTINGS = 'medium'
    ) {
        this.irregularVerbs = irregularVerbs;
        this.difficulty = DIFFICULTY_SETTINGS[level];
    }

    public startGame(): VerbRandomizer[] {
        this.score = 0;


        return this.generateExam(this.difficulty.questionCount)
    }

    public getQuizType(): string {
        return this.difficulty.quizType
    }


    public updateScore(): void {
        // Artık multiplier (çarpan) bilgisi difficulty interface'inden geliyor
        this.score += this.difficulty.pointMultiplier;
    }

    public getTimerValue(): number | null {
        return this.difficulty.timer;
    }

    public getTotalQuestionCount(): number {
        return this.difficulty.questionCount
    }

    // if-if-if changed with dinamic key access.
    public questionTextPick(version: 'v1' | 'v2' | 'v3'): Question {
        // Mevcut versiyon dışındaki diğer versiyonları filtrele
        const keys = Object.keys(this.questions) as Array<'v1' | 'v2' | 'v3'>;
        const otherKeys = keys.filter(key => key !== version);

        const randomKey = otherKeys[Math.floor(Math.random() * otherKeys.length)];

        return {
            question: this.questions[randomKey],
            verbKey: randomKey
        };
    }

    public randomQuestionGenerate(): VerbRandomizer {
        const randomIndex = Math.floor(Math.random() * this.irregularVerbs.length);
        const randomVerb = this.irregularVerbs[randomIndex];
        const { turkishMeaning }= this.irregularVerbs[randomIndex]

        const versions: Array<'v1' | 'v2' | 'v3'> = ['v1', 'v2', 'v3'];
        const randomVersionKey = versions[Math.floor(Math.random() * 3)];
        const verbValue = randomVerb[randomVersionKey];

        const question: Question = this.questionTextPick(randomVersionKey);
        const correctAnswer: string = randomVerb[question.verbKey as 'v1' | 'v2' | 'v3'];

        return {
            pickedVerb: verbValue,
            pickedVerbVersion: randomVersionKey,
            question,
            correctAnswer,
            turkishMeaning
        };
    }

    public generateExam(totalQuestionCount: number = 10): VerbRandomizer[] {
        const exam: VerbRandomizer[] = [];

        for (let i = 0; i < totalQuestionCount; i++) {
            const question = this.randomQuestionGenerate()

            if (i === (totalQuestionCount - 1)) {
                question.isLastQuestion = true
            }

            exam.push(question);
        }

        return exam;
    }

    public getDifficultyDetails(): IDifficultyConfig {
        return this.difficulty;
    }

    public updateExamResult(currentExamResult: ExamResult) {
        return this.examResult.push(currentExamResult)
    }

    public getExamResult(): ExamResult[] {
        return this.examResult;
    }
}