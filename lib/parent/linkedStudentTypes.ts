/** Client-safe veli paneli tipleri — prisma/logger import etmez. */

export type LinkedStudentSummary = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  organizationId: string | null;
  completedTopics: number;
  totalTopics: number;
};
