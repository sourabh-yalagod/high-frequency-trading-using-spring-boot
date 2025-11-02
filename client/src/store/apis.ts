import axiosInstance from "../lib/axiosInstance"
import { endPoint } from "../utils/apiEndPointConstants"

const registerUser = async (payload: any) => {
    return await axiosInstance.post(endPoint.register, payload)
}

const loginUser = async (payload: any) => {
    return await axiosInstance.post(endPoint.login, payload)
}

const getUserDetails = async (userId: string) => {
    return await axiosInstance.get("/" + userId)
}
export { registerUser, loginUser, getUserDetails };