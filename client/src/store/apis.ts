import axiosInstance from "../lib/axiosInstance"
import { endPoint } from "../utils/apiEndPointConstants"

const registerUser = async (payload: any) => {
    return await axiosInstance.post(endPoint.register, payload)
}

const loginUser = async (payload: any) => {
    return await axiosInstance.post(endPoint.login, payload)
}

const getUserDetails = async (userId: string) => {
    return await axiosInstance.get("/user/" + userId)
}

const requestVerifyAccount = async (userId: string) => {
    return await axiosInstance.get("/user/request-verification-otp/" + userId)
}

const verifyAccount = async (userId: string, otp: string) => {
    return await axiosInstance.post("/user/verify-account/" + userId, { otp })
}

const depositeMoney = async (payload: any) => {
    return await axiosInstance.post("/deposit/create-session", payload)
}
export { registerUser, loginUser, getUserDetails, requestVerifyAccount, verifyAccount, depositeMoney };