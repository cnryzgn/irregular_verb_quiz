import { Question } from "../Question/Question"

export interface VerbRandomizer {
    pickedVerb: string,
    pickedVerbVersion: string,
    question: Question,
    isLastQuestion?: boolean
    correctAnswer: string,
    turkishMeaning: string,
}