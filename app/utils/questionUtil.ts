import { Question, VerbRandomizer, VerbForm } from "../interfaces"

export function questionUtil(irregularVerbs: VerbForm[]) {

    const questionPick = (version: string): Question => {
        type VerbForm = 'v1' | 'v2' | 'v3';


        const questions: Record<VerbForm, string> = {
            v1: "What is the base form (v1) version of this verb?",
            v2: "What is the past simple (v2) version of this verb?",
            v3: "What is the past participle (v3) version of this verb?"
        };


        const randomQuestionIndex: number = Math.floor(Math.random() * 2)
        const result: Question = {
            question: '',
            verbKey: ''
        }


        if (version === "v1") {
            const { v1: removedQuestion, ...others } = questions

            result.question = Object.values(others)[randomQuestionIndex]
            result.verbKey = Object.keys(others)[randomQuestionIndex]
        }

        if (version === "v2") {
            const { v2: removedQuestion, ...others } = questions

            result.question = Object.values(others)[randomQuestionIndex]
            result.verbKey = Object.keys(others)[randomQuestionIndex]
        }

        if (version === "v3") {
            const { v3: removedQuestion, ...others } = questions

            result.question = Object.values(others)[randomQuestionIndex]
            result.verbKey = Object.keys(others)[randomQuestionIndex]
        }

        return result
    }

    const randomVerbPick = (): VerbRandomizer => {
        const randomIndex: number = Math.floor(Math.random() * irregularVerbs.length)
        const randomVerbVersion: number = Math.floor(Math.random() * 3)

        const verbKey = Object.keys(irregularVerbs[randomIndex])[randomVerbVersion]
        const verbValue = Object.values(irregularVerbs[randomIndex])[randomVerbVersion]

        const question: Question = questionPick(verbKey)

        return {
            pickedVerb: verbValue,
            pickedVerbVersion: verbKey,
            question
        }
    }


    return {
        questionPick,
        randomVerbPick,
        createExam: (totalQuestionCount = 10) => {
        const exam = []

        for (let i: number = 0; i < totalQuestionCount; i++) {
            exam.push(randomVerbPick(irregularVerbs))
        }

        return exam;
    }
    }
}