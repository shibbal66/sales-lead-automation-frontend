import {
  buildAnalyticsPeriodQuery,
  buildAnalyticsPeriodQueryKey,
  isCustomAnalyticsRangeValid
} from "@/lib/analytics";
import { showApiErrorToast } from "@/lib/apiToast";
import type { AnalyticsPeriod } from "@/types/analytics";

type ApiResult<T> = {
  success: boolean;
  message?: string;
  data?: T;
};

type PeriodQuerySliceConfig<TData> = {
  data: TData | null;
  period: AnalyticsPeriod;
  customFrom: string;
  customTo: string;
  queryKey: string;
  isFetching: boolean;
  hydrated: boolean;
};

type StoreSet = (partial: object) => void;
type StoreGet = () => PeriodQuerySliceConfig<TData>;

export function createPeriodQuerySliceHandlers<TData>(
  get: StoreGet,
  set: StoreSet,
  keys: {
    data: string;
    period: string;
    customFrom: string;
    customTo: string;
    queryKey: string;
    isFetching: string;
    hydrated: string;
  },
  fetcher: (query: ReturnType<typeof buildAnalyticsPeriodQuery>) => Promise<ApiResult<TData>>
) {
  const fetch = async (options: { force?: boolean } = {}) => {
    const state = get();
    const { period, customFrom, customTo, queryKey, hydrated } = state;

    if (period === "custom" && !isCustomAnalyticsRangeValid(customFrom, customTo)) {
      return;
    }

    const nextQueryKey = buildAnalyticsPeriodQueryKey(period, customFrom, customTo);
    if (!options.force && hydrated && queryKey === nextQueryKey) {
      return;
    }

    set({ [keys.isFetching]: true });
    try {
      const query = buildAnalyticsPeriodQuery(period, customFrom, customTo);
      const response = await fetcher(query);
      if (!response.success || !response.data) {
        showApiErrorToast(response);
        return;
      }
      set({
        [keys.data]: response.data,
        [keys.hydrated]: true,
        [keys.queryKey]: nextQueryKey
      });
    } catch (error) {
      showApiErrorToast(error);
    } finally {
      set({ [keys.isFetching]: false });
    }
  };

  const invalidate = () => {
    set({ [keys.hydrated]: false });
  };

  return { fetch, invalidate };
}
