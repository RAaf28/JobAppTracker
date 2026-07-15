export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface Company {
  id: string;
  name: string;
  industry?: string | null;
  website?: string | null;
  location?: string | null;
  size?: string | null;
  notes?: string | null;
}

export interface Resume {
  id: string;
  name: string;
  version: string;
  fileUrl?: string | null;
  createdAt: string;
}

export interface Interview {
  id: string;
  stage: string;
  date: string;
  time?: string | null;
  interviewer?: string | null;
  meetingLink?: string | null;
  notes?: string | null;
  outcome?: 'Passed' | 'Failed' | 'Pending' | null;
  applicationId: string;
  application?: {
    position: string;
    company: {
      name: string;
    };
  };
}

export interface Application {
  id: string;
  position: string;
  jobType: string;
  status:
    | 'Wishlist'
    | 'Applied'
    | 'Online Assessment'
    | 'HR Interview'
    | 'Technical Interview'
    | 'Final Interview'
    | 'Offer'
    | 'Accepted'
    | 'Rejected'
    | 'Withdrawn';
  salaryMin?: number | null;
  salaryMax?: number | null;
  location: string;
  source?: string | null;
  appliedDate: string;
  deadline?: string | null;
  coverLetter?: string | null;
  notes?: string | null;
  companyId: string;
  company: Company;
  resumeId?: string | null;
  resume?: Resume | null;
  interviews?: Interview[];
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalApplications: number;
  interviews: number;
  offers: number;
  rejections: number;
  responseRate: number;
  appsThisMonth: number;
}

export interface ChartData {
  appsByMonth: { month: string; count: number }[];
  appsByStatus: { status: string; count: number }[];
  appsByCompany: { company: string; count: number }[];
}

export interface DashboardData {
  stats: DashboardStats;
  upcomingInterviews: (Interview & {
    application: {
      position: string;
      company: { name: string };
    };
  })[];
  charts: ChartData;
}
