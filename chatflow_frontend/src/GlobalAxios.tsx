import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { UseLoading } from "./LoadingContext";

declare module "axios" {
    interface AxiosRequestConfig {
        silent?: boolean;
    }
}

const PUBLIC_PATHS = ["/login", "/sign"];

const GlobalAxios = () => {

    const request = useRef(0)
    const { setLoading } = UseLoading()
    const navigate = useNavigate()
    const navigateRef = useRef(navigate)

    useEffect(() => {
        navigateRef.current = navigate
    }, [navigate])

    useEffect(() => {
        const finish = () => {
            request.current = Math.max(0, request.current - 1)
            setLoading(request.current > 0)
        }

        const interceptorRequest = axios.interceptors.request.use(
            (config) => {
                if (!config.silent) {
                    request.current += 1
                    setLoading(true)
                }
                return config
            },
            (error) => Promise.reject(error)
        )

        const responseInterceptor = axios.interceptors.response.use(
            (response) => {
                if (!response.config.silent) {
                    finish()
                }
                return response
            },
            (error) => {
                if (!error.config?.silent) {
                    finish()
                }

                if (
                    axios.isAxiosError(error) &&
                    error.response?.status === 401 &&
                    !PUBLIC_PATHS.includes(window.location.pathname)
                ) {
                    navigateRef.current("/login", { replace: true })
                }

                return Promise.reject(error)
            }
        )

        return () => {
            axios.interceptors.request.eject(interceptorRequest)
            axios.interceptors.response.eject(responseInterceptor)
        }
    }, [setLoading])

    return null
}

export default GlobalAxios
