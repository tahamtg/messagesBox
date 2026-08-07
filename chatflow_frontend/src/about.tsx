import axios from "axios";
import { useEffect, useState } from "react";
import './about.css'

interface Users{
    username: string,
    id: number
}

const About = () => {

const [resualt, setResualt] = useState<Users[]>([]);

const [nextPage, setNextPage] = useState<number | null>(null);

const [previousPage, setPerviousPage] = useState<number  | null>(null);

const [count, setCount] = useState<number | null>(null);

const [page, setPage] = useState<number>(1);

const [totalPage, setTotalPage] = useState(0);

const getUser = async ()=>{

    console.log("GET USERS FUNCTION RUNNING")

      try{

        const res = await axios.get(`https://massagesbox.ir/massage/showUsers/?page_user=${page}`)

            console.log(res.data.resualt)
            setResualt(res.data.resualt)
            setNextPage(res.data.next_page)
            setPerviousPage(res.data.previous_page)
            setCount(res.data.count)
            setTotalPage(res.data.pages)

        
    }catch(e: any){
        console.log(e)
    }

}

useEffect(()=>{

    getUser()

},[page])

    return ( 

        <div className="boxUser">

        <div className="telev-user">
            <ul>
                {resualt.map((users)=> (
                    <li key={users.id}>{users.id}-{users.username}</li>
                ))}  
            </ul>
        </div>

        <div className="buttons">

            <button disabled={nextPage === null} onClick={(e)=>{if (nextPage!==null) {setPage(nextPage)}}} className="next">
                بعدی
            </button>

            {Array.from({length: totalPage}).map((_,index) => (
                <button onClick={()=> setPage(index + 1)} key={index}>{index + 1}</button>
            ))}

            <button disabled={previousPage === null} onClick={(e)=>{if (previousPage!==null) {setPage(previousPage)}}} className="previous">
                قبلی
            </button> 

        </div>

        </div>
     );

}
 
export default About;