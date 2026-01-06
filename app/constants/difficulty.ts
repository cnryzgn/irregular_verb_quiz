import { IDifficultyConfig } from "../interfaces";

export const DIFFICULTY_SETTINGS: Record<'easy' | 'medium' | 'hard' | 'endless_blitz' | 'endless_zen', IDifficultyConfig> = {
    easy: {
        level: 'easy',
        timer: null,
        pointMultiplier: 5,
        questionCount: 3,
        quizType: 'exam'
    },
    medium: {
        level: 'medium',
        timer: 15,
        pointMultiplier: 15,
        questionCount: 20,
        quizType: 'exam'
    },
    hard: {
        level: 'hard',
        timer: 8,
        pointMultiplier: 40,
        questionCount: 30,
        quizType: 'exam'
    },
    endless_blitz: {
        level: 'endless_blitz',
        timer: 5,
        pointMultiplier: 60,
        questionCount: Infinity,
        quizType: 'endless'
    },
    endless_zen: {
        level: 'endless_zen',
        timer: null,
        pointMultiplier: 10,
        questionCount: Infinity,
        quizType: 'endless'
    },
};