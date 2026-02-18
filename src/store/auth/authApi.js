import ApiEndpoits from "../../api/apiEndPoints";
import { POST } from "../../api/apiHelper";
import Constants from "../../utils/constants";
import { login, loginFail, loginSuccess, logout } from "./authSlice";

export const loginByEmail = (data, navigate, onFail, onSuccess) => {
    return async (dispatch) => {
        dispatch(login());
        const request = {
            email: data.email,
            password: data.password,
            remember_me: data.remember_me ?? false,
        };

        try {
            const response = await POST(ApiEndpoits.login, request);

            if (response?.status === 200 && response?.data?.status === "success") {
                localStorage.setItem(Constants.localStorageKey.accessToken, response?.data?.access_token);
                localStorage.setItem(Constants.localStorageKey.userId, response?.data?.id);
                localStorage.setItem(Constants.localStorageKey.loginEmail, response?.data?.agent_email ?? data.email);
                localStorage.setItem(Constants.localStorageKey.agentRole, response?.data?.role ?? "");
                localStorage.setItem(Constants.localStorageKey.mlUserId, response?.data?.id);
                localStorage.setItem(Constants.localStorageKey.tokenType, response?.data?.token_type ?? "Bearer");
                if (response?.data?.customer_role != null) {
                    localStorage.setItem(Constants.localStorageKey.customerRole, response?.data?.customer_role);
                }

                dispatch(loginSuccess({ ...response?.data, email: response?.data?.agent_email ?? data.email }));
                onSuccess?.(response?.data);
            } else {
                dispatch(loginFail());
                const errorPayload = response?.data ?? { message: "Login failed." };
                onFail?.(errorPayload);
            }
            return response?.data;
        } catch (error) {
            dispatch(loginFail());
            console.error(error, "error on login api");
            const message = error?.response?.data?.message || error?.message || "Email or password is incorrect. Please try again.";
            onFail?.({ message });
        }
    };
};

export const logoutApp = (data, navigate) => {

    return async (dispatch) => {

        const userId = parseInt(localStorage.getItem(Constants.localStorageKey.userId))
        
        const response = await POST(ApiEndpoits.logout,{
            user_id: userId
        })

        if (response?.status === 200) {
            dispatch(logout())
            dispatch({type:"RESET_STATE"})

            localStorage.clear()
            sessionStorage.clear()

            navigate("/")
        }

        return response.data
    }
}
