import { useEffect, useRef } from "react";
import axios from "axios";
import { UseLoading } from "./LoadingContext";

const GlobalAxios = ()=>{

    const request = useRef(0)
    const {loading, setLoading} = UseLoading()

    useEffect(()=>{
        const interceptorRequest = axios.interceptors.request.use((config)=>{
            if (request.current += 1){
                setLoading(true)
            }
            return config;
        },
            (error)=> Promise.reject(error)
        )

            const responseInterceptor = axios.interceptors.response.use(
                (response) => {
                    request.current = Math.max(0, request.current - 1);
                    setLoading(request.current  > 0);
                    return response;
                },
                (error) => {
                    request.current = Math.max(0, request.current - 1);
                    setLoading(request.current > 0);
                    return Promise.reject(error);
                }
            );
    
    
    return ()=> {
        axios.interceptors.request.eject(interceptorRequest);
        axios.interceptors.response.eject(responseInterceptor);
    }

    },[setLoading])

    return null;

}

export default GlobalAxios