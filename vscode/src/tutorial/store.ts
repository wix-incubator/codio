import { getProgress, getTutorial, persistProgress, getStepUri } from './filesystem';
import { PROGRESS_STATUS } from './consts';

let tutorialStore: undefined | TutorialStore;

export const createTutorialStore = async (): Promise<TutorialStore | undefined> => {
  try {
    const [progress, tutorial] = await Promise.all([getProgress(), getTutorial()]);
    //@TODO: Validate that loaded tutorial conforms to the tutorial datastructure
    if (progress && tutorial) return (tutorialStore = { progress, tutorial }), tutorialStore;
  } catch {
    return undefined;
  }
};

const updateStepProgressStatus = (stepId: string, status: ProgressStatus) => {
  tutorialStore.progress.progressByStepId[stepId] = {
    status,
  };
  updateChapterProgress();
  persistProgress(tutorialStore.progress);
};

export const markStepDone = (stepId: string) => {
  updateStepProgressStatus(stepId, PROGRESS_STATUS.done);
};

const isChapterLocked = (chapterId: ChapterId) =>
  tutorialStore.progress.progressByChapterId[chapterId]?.status === PROGRESS_STATUS.locked;

const isPreviousChapterDone = (chapterId: ChapterId) => {
  const previousChapterIndex = tutorialStore.tutorial.chapters.findIndex((id) => id === chapterId) - 1;
  if (previousChapterIndex >= 0) {
    const previousChapterId = tutorialStore.tutorial.chapters[previousChapterIndex];
    return isChapterDone(previousChapterId);
  }
};

const updateChapterProgress = () => {
  Object.entries(tutorialStore.tutorial.chaptersById).forEach(([chapterId, chapter]) => {
    const isChapterDone = chapter.steps.every((stepId) => isStepDone(stepId));
    if (isChapterDone) {
      tutorialStore.progress.progressByChapterId[chapterId] = {
        status: PROGRESS_STATUS.done,
      };
    } else if (isChapterLocked(chapterId) && isPreviousChapterDone(chapterId)) {
      tutorialStore.progress.progressByChapterId[chapterId] = {
        status: PROGRESS_STATUS.undone,
      };
    }
  });
};

const isStepDone = (stepId: StepId) =>
  tutorialStore.progress.progressByStepId[stepId]?.status === PROGRESS_STATUS.done ||
  tutorialStore.progress.progressByStepId[stepId]?.status === PROGRESS_STATUS.watched;
  
const isChapterDone = (chapterId: ChapterId) =>
  tutorialStore.progress.progressByChapterId[chapterId]?.status === PROGRESS_STATUS.done ||
  tutorialStore.progress.progressByChapterId[chapterId]?.status === PROGRESS_STATUS.watched;

export const calculateTutorialProgress = (store: TutorialStore): number => {
  const stepIds = Object.keys(store.tutorial.stepsById);
  const totalStepIds = stepIds.length;
  const totalDoneSteps = stepIds.reduce((doneSteps, stepId) => (isStepDone(stepId) ? doneSteps + 1 : doneSteps), 0);
  return Math.floor((totalDoneSteps / totalStepIds) * 100);
};
