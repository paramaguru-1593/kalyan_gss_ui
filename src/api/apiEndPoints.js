const ApiEndpoits = {
    login: "/v1/login",
    logout: "/v1/logout",
    // otp
    sendOtp: "/v1/otp/send",
    verifyOtp: "/v1/otp/verify",
    // gold rate
    storeGoldRate: "/getstoregoldrate",
    // schemes endpoints
    storeBasedSchemeData: "/v2/storebasedscheme_data",
    // terms and conditions for a scheme (backend route is GET /externals/gettermsandcondition)
    getTermsAndCondition: "/externals/gettermsandcondition",
    enrollNew: "/enroll_new",
    getPaymentInformation: "/Enrollment_tbs/getPaymentInformation",
    confirmPayment: "/Collection_tbs/confirmPayment",
    // externals
    getSchemesByMobileNumber: "/v2/getSchemesByMobileNumber",
    customerKycInfo: "/v2/customerkycinfo",
    getCustomerDetails: "/customer/GetCustomerDetails",
    customerKycUpdation: "/v2/customerkycupdation",
    customerBankDetailUpdation: "/v2/customerbankdetail_updation",
    updatePersonalDetails: "/update-personal-details",
    // profile completeness
    profileCompleteness: "/profile-completeness",
    // customer ledger report (by enrollment no)
    getCustomerLedgerReport: "/v2/getCustomerLedgerReport",
    getPincodeDetails: "/externals/get-pincode-details",
    paymentRequest: "/payment/request",
    paymentDetails: "/v1/payment/response-details",
    receiptByReference: "/v1/payment/receipt-by-reference",
    transactionHistory: "/v1/payment/transactions",
}

export default ApiEndpoits;