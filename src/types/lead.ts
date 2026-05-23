import type { ApiPagination } from "./campaign";

export type LeadPresentationStatus =
  | "new"
  | "contacted"
  | "replied"
  | "booked"
  | "unsubscribed"
  | "sent"
  | "failed";

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

export const LEAD_SORT_BY_VALUES = [
  "created_at",
  "fullName",
  "email",
  "company",
  "country",
  "fitScore",
  "dateAdded",
] as const;

export type LeadSortBy = (typeof LEAD_SORT_BY_VALUES)[number];
export type LeadSortOrder = "asc" | "desc";

export interface GetLeadsQuery {
  page?: number;
  limit?: number;
  search?: string;
  emailStatus?: string;
  country?: string;
  state?: string;
  city?: string;
  industry?: string;
  seniority?: string;
  department?: string;
  company?: string;
  outreachStatus?: string;
  fitTag?: string;
  sortBy?: LeadSortBy;
  sortOrder?: LeadSortOrder;
}

/** Legacy list body before `data` + top-level `pagination`. */
export interface GetLeadsLegacyData {
  leads: LeadApiModel[];
  page?: number;
  limit?: number;
  total?: number;
}

/** GET `/leads`: success `{ data: LeadApiModel[], pagination }`; errors `{ message, code? }`. */
export interface GetLeadsResponse {
  success: boolean;
  message?: string;
  code?: string;
  data?: LeadApiModel[] | GetLeadsLegacyData;
  pagination?: ApiPagination;
}

export interface GetLeadByIdResponse {
  success: boolean;
  message?: string;
  code?: string;
  /** Single lead row or `{ lead }` (both accepted). */
  data?: LeadApiModel | { lead: LeadApiModel };
}
