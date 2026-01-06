import apiClient from "./client";

export function otpSend(email) {
  return apiClient.post("/send-otp",{email})
}

export function otpVerify(verifyOtpPayload){
    return apiClient.post('/login',verifyOtpPayload)
}

