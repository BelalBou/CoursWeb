export type Lesson = {
  id: string;
  chapterId: string;
  order: number;
  title: string;
  fileName: string;
  path: string;
  words: number;
};

export type CourseSection = {
  id: string;
  order: number;
  label: string;
  accent: string;
  description: string;
  lessons: Lesson[];
};

export type CourseMap = {
  title: string;
  subtitle: string;
  sections: CourseSection[];
};

export type LessonContent = {
  path: string;
  content: string;
  title: string;
};

declare global {
  interface Window {
    coursWeb: {
      getCourseMap: () => Promise<CourseMap>;
      readLesson: (lessonPath: string) => Promise<LessonContent>;
      openExternal: (url: string) => Promise<boolean>;
    };
  }
}
