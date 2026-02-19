const ApiEndpoits = {
    login: "/v1/login",
    logout: "/v1/logout",
    // gold rate
    storeGoldRate: "/getstoregoldrate",
    // schemes endpoints
    storeBasedSchemeData: "/storebasedscheme_data",
    // terms and conditions for a scheme (backend route is GET /externals/gettermsandcondition)
    getTermsAndCondition: "/externals/gettermsandcondition",
    enrollNew: "/enroll_new",
    confirmPayment: "/Collection_tbs/confirmPayment",
    // externals
    getSchemesByMobileNumber: "/externals/getSchemesByMobileNumber",
}

export default ApiEndpoits;