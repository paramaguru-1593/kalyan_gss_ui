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
    getPaymentInformation: "/Enrollment_tbs/getPaymentInformation",
    confirmPayment: "/Collection_tbs/confirmPayment",
    // externals
    getSchemesByMobileNumber: "/externals/getSchemesByMobileNumber",
    customerKycInfo: "/customerkycinfo",
    customerKycUpdation: "/customerkycupdation",
    customerBankDetailUpdation: "/customerbankdetail_updation",
    updatePersonalDetails: "/update-personal-details",
    // profile completeness
    profileCompleteness: "/profile-completeness",
    // customer ledger report (by enrollment no)
    getCustomerLedgerReport: "/externals/getCustomerLedgerReport",
}

export default ApiEndpoits;