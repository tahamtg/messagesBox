import axios from "axios";
import React, {
    useState,
    useEffect,
    useContext,
    useRef
} from "react";
import { useNavigate, useParams } from "react-router-dom";
import { string } from "yup";
import avatar from '../public/images.png'
import add from '../public/icons8-plus-24.png'

interface directProp {
    chat_key: string,
    username: string,
    username_key: string,
    avatar: string,
}

const Directs = () => {

const [getDirect, setGetDirect] = useState<directProp[]>([])
const navigate = useNavigate()
const [isAdd, setIsAdd] = useState<boolean | null>(false)
const [usersKey, setUsersKey] = useState<string | null>(null)
const socket = useRef(null)


try{

    const getINFO = async ()=>{

        const res = await axios.get<directProp[]>("https://massagesbox.ir/massage/get_directs/",
            {
                withCredentials:true
            }
        );

        setGetDirect(res.data);

    }

}catch(e:any){

    console.log(e)
    
}

return ( 

<> 

<div className="add_direct">

    {
    isAdd ? <button>
        {add}<span>اضافه کردن چت یا مخاطب با پرایمکی!</span>
    </button> : <input placeholder="پرایمری کی کاربر مورد نظر را بنویسید" type="text" 
    name="text" id="text" value={usersKey!} onChange={(e)=> (setUsersKey(e.target.value))}/>
    }

</div>

<div className="directs-page">

{getDirect.map((direct) => 

    ( 
    <div className="direct-item" key={direct.chat_key} onClick={()=> navigate( `/chat/${direct.chat_key}`)}> 

    <img src={ direct.avatar ? `https://massagesbox.ir${direct.avatar}` : avatar } alt={direct.username} /> 

    <span> {direct.username} </span> 
    
    </div> 
    )

)} 

</div>

</> 

);

}
 
export default Directs;