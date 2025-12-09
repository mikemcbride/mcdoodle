// DB tables
export type Poll = {
  id: string;
  title: string;
  description: string;
  status: PollStatus;
  submissions?: Submission[];
  questions?: Question[];
};

export type Question = {
  id: string;
  value: string;
  order: number;
  poll_id: string;
};

export type Response = {
  id: string;
  value: ResponseOption;
  question_id: string;
  submission_id: string;
  poll_id: string;
};

export type Submission = {
  id: string;
  poll_id: string;
  person: string;
  responses: Response[];
};

export type User = {
  id?: string;
  isAdmin?: boolean;
  isVerified?: boolean;
  email: string;
  firstName: string;
  lastName: string;
  password?: string;
};

export type Verification = {
  id: string;
  email: string;
  status: VerificationStatus;
  createdAt: string;
}

// Helpers
export enum PollStatus {
  OPEN = 'open',
  CLOSED = 'closed',
};

export enum VerificationStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
}

export type ResponsePayload = {
  id?: string;
  question_id: string;
  submission_id: string;
  poll_id: string;
  value: string;
}

export type ResponseOption = 'yes' | 'no' | 'if_needed' | null

export type ResponseQueryParams = {
  id?: string;
  poll_id?: string;
}

export type AuthUser = {
  id: string;
  isAdmin: boolean;
  email?: string;
  firstName?: string;
  lastName?: string;
}

// used in the auth context
export interface IAuthContext {
  isAuthenticated: boolean;
  user: AuthUser | null;
  login: (val: AuthUser) => void;
  logout: (redirect?: boolean) => void;
  updateUser: (val: AuthUser) => void;
}

// used in the calendar component
export type Day = {
  date: string
  isCurrentMonth: boolean
  isToday: boolean
}

export type RankedResultRow = {
  date: string | undefined;
  yes: number;
  no: number;
  if_needed: number;
  not_no: number;
  total: number;
}

export type Vote = {
  question: string;
  date: string;
  response: ResponseOption;
}
