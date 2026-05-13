export interface TopicNode {
  id: string;
  subjectId: string;
  name: string;
  code: string;
  description: string | null;
  order: number;
  examQuestionCount: number | null;
}

export interface SubjectNode {
  id: string;
  sectionId: string;
  name: string;
  code: string;
  description: string | null;
  order: number;
  topics: TopicNode[];
}

export interface SectionNode {
  id: string;
  examId: string;
  name: string;
  code: string;
  description: string | null;
  order: number;
  subjects: SubjectNode[];
}

export interface ExamNode {
  id: string;
  name: string;
  code: string;
  description: string | null;
  status: string;
  startDate: string | null;
  sections: SectionNode[];
}

export type EntityType = 'exam' | 'section' | 'subject' | 'topic';

export type ExamContentModal =
  | {
      type: EntityType;
      parentId?: string;
      parentExamId?: string;
      parentSectionId?: string;
      edit?: ExamNode | SectionNode | SubjectNode | TopicNode;
    }
  | null;
