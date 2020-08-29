type StepType = 'codio' | 'md' | 'test' | 'comment'
type ProgressStatus = 'done' | 'skipped' | 'watched'

type TutorialStep = {
    type: StepType,
    name: string,
    path?: string
}

type TutorialChapter = {
    title: string
    steps: Array<string>
}

type TutorialProgress = {
    progressByStepId: {
        [key: string]: {
            status?: ProgressStatus
        }
    },
    progressByChapterId: {
        [key: string]: {
            status?: ProgressStatus
            percent?: number
        }
    }
}

type Tutorial = {
    chapters : Array<string>,
    chaptersById: {
        [key: string]: TutorialChapter
    },
    stepsById: {
        [key: string] : TutorialStep
    },
    version: number
}

type TutorialStore = {
    tutorial: Tutorial,
    progress: TutorialProgress
}