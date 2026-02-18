import { createSlice } from "@reduxjs/toolkit";
import Constants from "../../utils/constants";

export const authSlice = createSlice({
    name: 'auth',
    initialState: {
        isLoggedIn: localStorage.getItem(Constants.localStorageKey.accessToken) ? true : false,
        userData: {
            userId: localStorage.getItem(Constants.localStorageKey.userId),
            accessToken: localStorage.getItem(Constants.localStorageKey.accessToken),
            loginEmail: localStorage.getItem(Constants.localStorageKey.loginEmail),
        },
        resetPassword:{
            isLoading: false,
            data:""
        },
        confirmPassword:{
            isLoading: false,
            data:""
        },
        isLoginLoading: false,
        dialerList: [],
        tlListDetails : {
            isLoading : false,
            data : [],
        }
    },
    reducers: {
        login: (state, payload) => {
            state.isLoginLoading = true
        },
        loginSuccess: (state, { payload }) => {
            state.isLoginLoading = false
            state.isLoggedIn = true
            state.userData.userId = payload.id
            state.userData.accessToken = payload?.access_token
            state.userData.loginEmail = payload.email
        },
        loginFail: (state, payload) => {
            state.isLoginLoading = false
        },
        logout: (state, payload) => {
            state.isLoggedIn = false
            state.userData = {}
        },
    }
})

export const {
    login,
    logout,
    loginFail,
    loginSuccess
} = authSlice.actions
export default authSlice.reducer