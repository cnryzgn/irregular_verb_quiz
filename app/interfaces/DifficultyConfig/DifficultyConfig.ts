export interface IDifficultyConfig {
    level: 'easy' | 'medium' | 'hard' | 'endless_blitz' | 'endless_zen';
    timer: number | null;
    pointMultiplier: number;
    questionCount: number,
    quizType: string
}