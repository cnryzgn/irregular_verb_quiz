import { VerbForm } from "../interfaces";

interface CurrentQuestion {
    pickedVerbVersion: string;
    pickedVerb: string;
    question: {
        verbKey: string;
    };
}

/**
 * Verilen sorunun doğru cevabını veri seti içinden bulur.
 */
const getCorrectVerbAnswer = (
    currentQuestion: CurrentQuestion, 
    verbsList: VerbForm[]
): string => {
    const { pickedVerbVersion, pickedVerb, question } = currentQuestion;

    const verbRow = verbsList.find(v => 
        v[pickedVerbVersion as keyof VerbForm] === pickedVerb
    );

    const answer = verbRow ? verbRow[question.verbKey as keyof VerbForm] : "";
    return String(answer); // Her zaman string dönmesini garanti ediyoruz
};

/**
 * Kullanıcının cevabını gerçek cevapla karşılaştırır (Case-insensitive)
 */
const checkIsAnswerInvalid = (userAnswer: string, correctAnswer: string): boolean => {
    const cleanUser = userAnswer.trim().toLowerCase();
    const cleanCorrect = correctAnswer.toLowerCase();
    
    // Eğer cevap birden fazla opsiyon içeriyorsa (örn: "got/gotten")
    if (cleanCorrect.includes('/')) {
        const options = cleanCorrect.split('/');
        return !options.includes(cleanUser);
    }

    return cleanUser !== cleanCorrect;
};

export {
    checkIsAnswerInvalid,
    getCorrectVerbAnswer
}