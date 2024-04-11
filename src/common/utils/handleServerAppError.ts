import { AppDispatch } from "app/store"
import { appActions } from "app/app.reducer"
import { BaseResponseType } from "common/types/baseResponseType"

export const handleServerAppError = <D>(
  data: BaseResponseType<D>,
  dispatch: AppDispatch,
  doesShowGlobalError = true,
): void => {
  if (doesShowGlobalError) {
    dispatch(
      appActions.setAppError({
        error: data.messages.length ? data.messages[0] : "Some error occurred",
      }),
    )
  }
  dispatch(appActions.setAppStatus({ status: "failed" }))
}
