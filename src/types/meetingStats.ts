export interface MeetingStatsPeriodRange {
  from: string;
  to: string;
}

export interface MeetingStatsData {
  meetings_this_week: {
    count: number;
    vs_last_week: number;
  };
  meetings_this_month: {
    count: number;
    vs_last_month_percent: number;
  };
  conversion_rate: {
    percent: number;
    vs_last_month_points: number;
  };
  periods: {
    this_week: MeetingStatsPeriodRange;
    last_week: MeetingStatsPeriodRange;
    this_month: MeetingStatsPeriodRange;
    last_month: MeetingStatsPeriodRange;
  };
  meta: {
    conversion_definition: string;
  };
}

export interface GetMeetingStatsResponse {
  success: boolean;
  message?: string;
  data?: MeetingStatsData;
}
