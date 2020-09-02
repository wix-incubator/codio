type StepType = 'codio' | 'md' | 'test' | 'comment' | 'tour' | 'quiz'
type ProgressStatus = 'done' | 'skipped' | 'watched' | 'locked' | 'undone'

type TutorialStep = {
    type: StepType,
    name: string,
    path?: string
}

type TutorialStepWithId = {
    id: StepId,
    type: StepType,
    name: string,
    path?: string
}

type TutorialChapter = {
    title: string
    steps: Array<string>
}

type StepId = string
type ChapterId = string;
type TutorialProgress = {
    progressByStepId: {
        [key in StepId]: {
            status?: ProgressStatus
        }
    },
    progressByChapterId: {
        [key in ChapterId]: {
            status?: ProgressStatus
            percent?: number
        }
    }
}

type Tutorial = {
    title: string
    chapters : Array<string>,
    chaptersById: {
        [key in ChapterId]: TutorialChapter
    },
    stepsById: {
        [key in StepId] : TutorialStep
    },
    version: number
}

type TutorialStore = {
    tutorial: Tutorial,
    progress: TutorialProgress
}

type Quiz = Array<{
    question: string
    answers: Array<{
        answer: string
        onSelectedMessage: string
    } | string>
    correctAnswerIdx: number
}>