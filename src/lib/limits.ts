// Free vs Premium usage limits
// All values are configurable via environment variables.

export const FREE_AI_DAILY_LIMIT = parseInt(process.env.FREE_AI_DAILY_LIMIT ?? '5', 10)
export const FREE_QUIZ_QUESTION_COUNT = parseInt(process.env.FREE_QUIZ_QUESTION_COUNT ?? '10', 10)
export const PREMIUM_QUIZ_QUESTION_COUNT = parseInt(process.env.PREMIUM_QUIZ_QUESTION_COUNT ?? '50', 10)
