import axios from "axios";
import { useEffect, useState } from "react";
import './about.css'

interface Users{
    username: string,
    id: number
}

const About = () => {

const [user, setUser] = useState<Users[]>([])
const [nextPage, setNextPage] = useState<string | null>(null)
const [perviosPage, setPerviosPage] = useState<string | null>(null)
const [count, setCount] = useState<number | null>(null)

const getUser = async ()=>{
    
    console.log("GET USERS FUNCTION RUNNING")

      try{

        const res = await axios.get('https://massagesbox.ir/showUsers/')
        console.log(res.data);
        console.log(res.data.results);
        setNextPage(res.data.next)
        setPerviosPage(res.data.previous)
        setCount(res.data.count)

  
        if (res.data?.results){
            setUser(res.data?.results)
        }
        
    }catch(e: any){
        console.log(e)
    }

    

}

const getUserPage = async (pageUrl:string) => {
    try {
        const res = await axios.get(pageUrl)

        setUser(res.data.results)
        setNextPage(res.data.next)
        setPerviosPage(res.data.previous)
    }
    catch(e){
        console.log(e)
    }
}

useEffect(() => {

    getUser();

}, []);

const totlaPage = count ?  Math.ceil(count / 5) : 0;

    return ( 

        <div className="boxUser">

        
        <div className="telev-user">
            <ul>
                {(user ?? []).map((users)=> (
                    <li key={users.id}>{users.username}</li>
                ))}  
            </ul>
        </div>

            <div className="buttons">

                <button 
                    disabled={!nextPage}
                    onClick={()=> nextPage && getUserPage(nextPage)}
                >
                        بعد
                </button>

                {Array.from({length: totlaPage}).map((_, index)=>(
                    <button 
                        key={index}
                        onClick={()=>getUserPage(
                        `https://massagesbox.ir/showUsers/?page_user=${index + 1}`
                    )}
                    >
                        {index + 1}
                    </button>
                ))}

                <button 
                    disabled={!perviosPage}
                    onClick={()=> perviosPage && getUserPage(perviosPage)}
                >
                    قبل
                </button>

            </div>

        </div>
     );

}
 
export default About;