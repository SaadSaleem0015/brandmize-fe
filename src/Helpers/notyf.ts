import axios from "axios";
import { Notyf } from "notyf";
import "notyf/notyf.min.css";

export const notyf = new Notyf({
    duration: 8000,
    dismissible: true,
});

export function notifyResponse(
    response: any,
    successMessage: string = "Operation performed successfully.",
    errorMessage: string = "There was an error."
) {

    // ✅ If this is an Axios error
    if (axios.isAxiosError(response)) {

        const apiMessage =
            response.response?.data?.detail ||
            response.response?.data?.message ||
            response.message;

        notyf.error(apiMessage || errorMessage);
        return;
    }

    // ✅ Normal API response
    if (response?.success === true) {

        notyf.success(
            typeof response?.detail === "string"
                ? response.detail
                : successMessage
        );
        return;
    }

    // ✅ API returned success:false
    if (response?.success === false) {

        notyf.error(
            typeof response?.detail === "string"
                ? response.detail
                : errorMessage
        );
        return;
    }

    // ✅ Fallback
    notyf.error(errorMessage);
}
