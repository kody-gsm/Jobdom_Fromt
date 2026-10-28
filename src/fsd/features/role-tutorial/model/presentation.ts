export type TutorialPresentationState = "loading" | "completed" | "tutorial";

export const shouldRenderTutorialChildren = (state: TutorialPresentationState) => state !== "tutorial";
