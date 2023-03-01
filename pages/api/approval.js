import axios from "axios"
import { resolve } from "styled-jsx/css"

export default async function handler(req,res)
{
    return new Promise(resolve=>{
        if(req.method ==='POST'){         
            axios({
                method:'post',
                url:'https://api.minepi.com/v2/payments/'+JSON.parse(req.body).pid+'/approve',
                headers: {'Authorization': 'Key '+process.env.PI_API_KEY},
            }).then(()=>{
                res.status(200).send()
                return resolve()
            })
        }
        else{
            res.status(400).send()
            return resolve()
        }
    })
    
}