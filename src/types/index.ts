export interface CourseNode {
  id: string;
  title: string;
  nodeType: 'lecture' | 'quiz' | 'assignment';
  sortOrder: number;
}

export interface Edge {
  fromNodeId: string;
  toNodeId: string;
  rule: Record<string, any>;
}

export enum UserRole {
  STUDENT = 'student',
  INSTRUCTOR = 'instructor',
  ADMIN = 'admin',
  SUPERADMIN = 'superadmin',
}

