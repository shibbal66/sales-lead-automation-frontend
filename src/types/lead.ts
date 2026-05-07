export interface LeadApiModel {
  id: number;
  created_at: string;
  fullName: string;
  firstName: string;
  lastName: string;
  title: string;
  email: string;
  emailStatus: string;
  linkedin: string;
  city: string;
  state: string;
  country: string;
  company: string;
  domain: string;
  industry: string;
  employees: string;
  revenue: string;
  companyPhone: string;
  compantyState: string;
  seniority: string;
  department: string;
  dateAdded: string;
  fitTag: string;
  fitScore: string;
  fitReason: string;
  emailSource: string;
  emailSent: string;
  emailSentDate: string;
  emailSubject: string;
  emailBody: string;
  linkedinSent: string;
  linkedSentDate: string;
  linkedinMessage: string;
  replyReceived: string;
  replyDate: string;
  companyCity: string;
  notes: string;
  outreachStatus: string;
}

export interface GetLeadsResponse {
  success: boolean;
  message?: string;
  data?: {
    leads: LeadApiModel[];
    page?: number;
    limit?: number;
    total?: number;
  };
}

export interface GetLeadByIdResponse {
  success: boolean;
  message?: string;
  data?: {
    lead: LeadApiModel;
  };
}
