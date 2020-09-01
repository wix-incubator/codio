export const TUTORIAL_COMMAND_NAMES = {
    codioStepPress: 'codioStepPress',
    mdStepPress: 'mdStepPress',
    commentStepPress: 'commentStepPress',
    testStepPress: 'testStepPress',
}

export const PROGRESS_STATUS = {
    done: 'done',
    skipped: 'skipped',
    watched: 'watched',
    undone: 'undone',
    locked: 'locked'
} as const

export const MAIN_FOLDER = '.tutorial';
export const TUTORIAL_FILE = 'tutorial.json';
export const PROGRESS_FILE = 'progress.json';
export const CODIOS_FOLDER_NAME = 'codios';
export const MARKDOWN_FOLDER_NAME = 'markdown';
export const TESTS_FOLDER_NAME = 'tests';
export const COMMENTS_FOLDER_NAME = 'comments';
export const TREE_VIEW_ID = 'tutorial';

export const progressToEmoji = {
    [PROGRESS_STATUS.locked]: '🔒',
    [PROGRESS_STATUS.done]: "🟢",
    [PROGRESS_STATUS.watched]: "🟢",
    [PROGRESS_STATUS.skipped]: "🟡",
    [PROGRESS_STATUS.undone]: "⚪️"
}

export const stepTypeToEmoji = {
    codio : "🎙",
    comment : "💬",
    md : "📖",
    test : "🌡",
}

export const stepTypeToIcon = {
    codio : {
        dark:  'media/icon-small.svg', 
        light: 'media/icon-small-light.svg'
    }, 
    comment: {
        dark:  'media/comment.svg', 
        light: 'media/comment.svg'
    }, 
    md: {
        dark:  'media/read.svg',
        light: 'media/read.svg',
    },
    test: {
        dark:  'media/test.svg', 
        light: 'media/test.svg',
    }
}


