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

        const res = await axios.get("https://massagesbox.ir/massage/showUsers/")

        if (res.data){
            setUser(res.data)
        }
        
    }catch(e: any){
        console.log(e)
    }

    

}


    return ( 

        <div className="boxUser">

        <div className="telev-user">
            <ul>
                {(user ?? []).map((users)=> (
                    <li key={users.id}>{users.username}</li>
                ))}  
            </ul>
        </div>

        </div>
     );

}
 
export default About;