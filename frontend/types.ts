
export type UserRole = 'STUDENT' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  department: string;
  avatar?: string;
}

export type IssueStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' | 'CANCELLED';
export type IssueCategory = 'MEDICAL' | 'ACADEMIC' | 'HOSTEL' | 'FINANCE' | 'TECHNICAL' | 'OTHERS';

export interface Issue {
  id: string;
  title: string;
  description: string;
  category: IssueCategory;
  status: IssueStatus;
  studentId: string;
  studentName: string;
  reactions: number;
  createdAt: string;
  updatedAt: string;
  replies: Reply[];
}

export interface Reply {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  content: string;
  timestamp: string;
}

export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  text: string;
  timestamp: string;
  likes?: number;
  likedBy?: string[];
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  publishDate: string;
  category: 'URGENT' | 'INFO' | 'EVENT';
  createdBy: string;
  createdAt: string;
}

export type OpportunityType = 'INTERNSHIP' | 'FULL-TIME' | 'RESEARCH';
export type OpportunityMode = 'Remote' | 'On-Campus' | 'Hybrid';
export type ApplicationStatus = 'APPLIED' | 'REVIEWED' | 'ACCEPTED' | 'REJECTED';

export interface Opportunity {
  id: string;
  _id?: string;
  title: string;
  company: string;
  type: OpportunityType;
  deadline: string;
  location: string;
  mode: OpportunityMode;
  stipend?: string;
  description: string;
  skills: string[];
  eligibility: string;
  duration: string;
  applyUrl?: string;
  isInternal: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Application {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  opportunityId: string;
  opportunityTitle: string;
  resumePath?: string;
  statementOfInterest: string;
  status: ApplicationStatus;
  appliedAt: string;
  updatedAt: string;
