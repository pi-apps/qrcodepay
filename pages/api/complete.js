import admin from 'lib/firebase'
import axios from 'axios';

export default async function handler(req,res)
{
    return new Promise(resolve=>{

        if(req.method ==='POST'){
            let pid = JSON.parse(req.body).pid,txid = JSON.parse(req.body).txid,auth = req.headers.authorization
            axios({
                method: 'get',
                url:'https://api.minepi.com/v2/me',
                headers: {'Authorization': 'Bearer '+ auth},
            }).then((res)=>{
                let username = res.data.username
                return username
            }
            ).then((username)=>{
                let headers = {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "Authorization": `Key `+process.env.PI_API_KEY,
                }
                fetch('https://api.minepi.com/v2/payments/'+pid+'/complete',
                {
                    method:'POST',
                    headers: headers,
                    body:JSON.stringify({'txid':txid})
                }).then((complete)=>{
                    return complete.json();
                }).then((data)=>{
                    const firebase = admin.database().ref('TestNet/Donation')
                    
                    firebase.push({
                        username:username,
                        txid:JSON.parse(req.body).txid,
                        created_at:data.created_at
                    })
                    res.status(200).send()
                    return resolve()
                }).catch((error) => {
                    console.log(error)
                }) 
            })
            
        }
        else{
            res.status(400).send()
            return resolve()
        }

    })    
}