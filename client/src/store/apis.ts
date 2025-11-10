import axios from "axios"
import axiosInstance from "../lib/axiosInstance"
import { endPoint } from "../utils/apiEndPointConstants"
import { useMutation } from "@tanstack/react-query"
import { userToastMessages } from "../utils/userToastMessages"

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
const getOrderbook = async (symbol: string) => {
    return await axiosInstance.get('/order/order-book/' + symbol?.toLocaleUpperCase())
}
const placeOrder = async (order: any) => {
    return await axiosInstance.post("/order/publish", order)
}

const getOrders = async (userId: string) => {
    return await axiosInstance.get("/order/" + userId)
}

const updateUsername = (userId: string) => {
    axiosInstance.post("/user/update-user/" + userId)
}
const usePlaceOrder = () => {
    return useMutation({
        mutationFn: (order: any) => placeOrder(order),
        onSuccess: (response) => {
            userToastMessages('success', response?.data?.message || "Order is Queued, Please wait.");
        },
        onError: (error: any) => {
            userToastMessages('error', error?.response?.data?.message || "Order failed to push to queue!");
        },
    });
};
const updateUserBalance = async (userId: string) => {
    await axiosInstance.get("/user/update-balance/" + userId)
}

export { registerUser, loginUser, getUserDetails, requestVerifyAccount, verifyAccount, updateUsername, depositeMoney, updateUserBalance, usePlaceOrder, getOrderbook, placeOrder, getOrders };