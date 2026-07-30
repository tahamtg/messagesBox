import axios from "axios";
import { useEffect, useState } from "react";
import './about.css'

interface Users{
    username: string,
    id: number
}

const About = () => {

const [page, setPage] = useState<number>(1);
const [user, setUser] = useState<Users[]>([])

const getUser = async ()=>{

const res = await axios.get(`https://massagesbox.ir/showUsers/?page=${page}`)
setUser(res.data.results)

}

useEffect(() => {

    getUser();

}, [page]);

    return ( 

        <div className="boxUser">

        
        <div className="telev-user">
            <ul>
                { user.map((users)=> (
                    <li key={users.id}>{users.username}</li>
                ))}  
            </ul>
        </div>

            <div className="buttons">

                <button onClick={()=> (setPage(prev => prev + 1))}>
                    بعد
                </button>

                <button onClick={()=> (setPage(prev => Math.max(1, prev - 1)))}>
                    قبل
                </button>

            </div>

        </div>
     );

}
 
export default About;