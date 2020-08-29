export const MAIN_FOLDER = '.tutorial';
export const TUTORIAL_FILE = 'tutorial.json';
export const PROGRESS_FILE = 'progress.json';
export const CODIOS_FOLDER_NAME = 'codios';
export const MARKDOWN_FOLDER_NAME = 'markdown';
export const TESTS_FOLDER_NAME = 'tests';
export const COMMENTS_FOLDER_NAME = 'comments';


export const progressToEmoji = {
    'done': "🟢",
    'skipped': "🏃",
    'watched': "🟢",
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


