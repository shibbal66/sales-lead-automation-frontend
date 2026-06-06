import { AxiosError } from "axios";
import { getApiErrorMessage, showApiErrorToast } from "@/lib/apiToast";
import { usePlanLimitStore } from "@/store/planLimit/planLimitStore";

export const PLAN_LIMIT_CAMPAIGNS = "PLAN_LIMIT_CAMPAIGNS";

function readErrorCode(data: unknown): string | null {
  if (data && typeof data === "object" && "code" in data) {
    const code = (data as { code?: unknown }).code;
    if (typeof code === "string" && code.trim()) return code;
  }
  return null;
}

export function getApiErrorCode(error: unknown): string | null {
  if (error instanceof AxiosError) {
    const fromBody = readErrorCode(error.response?.data);
    if (fromBody) return fromBody;
  }

  return readErrorCode(error);
}

export function isPlanLimitError(error: unknown): boolean {
  const code = getApiErrorCode(error);
  return typeof code === "string" && code.startsWith("PLAN_LIMIT_");
}

export function getPlanLimitDialogTitle(code: string | null): string {
  if (code === PLAN_LIMIT_CAMPAIGNS) return "Campaign limit reached";
  return "Plan limit reached";
}

/** Shows the plan-limit dialog for quota errors; otherwise falls back to an error toast. */
export function showApiErrorOrPlanLimitDialog(error: unknown): boolean {
  if (isPlanLimitError(error)) {
    usePlanLimitStore.getState().openDialog({
      message: getApiErrorMessage(error),
      code: getApiErrorCode(error)
    });
    return true;
  }

  showApiErrorToast(error);
  return false;
}
