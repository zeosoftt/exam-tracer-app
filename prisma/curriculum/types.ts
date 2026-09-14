/** Exam → Section → Subject → Topic seed tanımı */

export type CurriculumTopic = {
  code: string;
  name: string;
  examQuestionCount?: number;
};

export type CurriculumSubject = {
  code: string;
  name: string;
  topics: CurriculumTopic[];
};

export type CurriculumSection = {
  code: string;
  name: string;
  subjects: CurriculumSubject[];
};

export type CurriculumExam = {
  code: string;
  name: string;
  description: string;
  sections: CurriculumSection[];
};
