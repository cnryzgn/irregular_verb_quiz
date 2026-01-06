import { IDifficultyConfig } from "../DifficultyConfig/DifficultyConfig";
import { Question } from "../Question/Question";
import { VerbForm } from "../VerbForm/VerbForm";
import { VerbRandomizer } from "../VerbRandomizer/VerbRandomizer";

export interface IGameManager {
    score: number;
    readonly difficulty: IDifficultyConfig;
    irregularVerbs: VerbForm[];
    startGame(questionCount: number): VerbRandomizer[];
    questionTextPick(version: string): Question
    randomQuestionGenerate(): unknown;
    generateExam(): unknown;
    getDifficultyDetails(): IDifficultyConfig;
}