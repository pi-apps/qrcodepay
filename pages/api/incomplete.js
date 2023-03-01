import admin from 'lib/firebase'
import axios from 'axios'

const getUser = (token)=>{
    let username
    axios({
        method: 'get',
        url:'https://api.minepi.com/v2/me',
        headers: {'Authorization': 'Bearer '+ token},
    }).then((res)=>{
        console.log(res)
        username = res.data.username
    }
    ).catch(function (error) {
    console.log(error.toJSON());
    });
    return username
}

export default function handler(req,res)
{
    if(req.method ==='POST'){
        let pid = JSON.parse(req.body).pid,txid = JSON.parse(req.body).txid,auth = req.headers.authorization
        let username = getUser(auth)
        axios({
            method:'post',
            url:'https://api.minepi.com/v2/payments/'+pid+'/complete',
            headers: {"Authorization": `Key `+process.env.PI_API_KEY},
            data:{
                txid:txid
            }
        }).then((complete)=>{
            return complete.data;
        }).then((data)=>{
            const firebase = admin.database().ref('TestNet/PayHistory')
            
            firebase.push({
                username:username,
                txid:JSON.parse(req.body).txid,
                created_at:data.created_at
            })
            
        }).catch((error) => {
            console.log(error)
        })
        res.status(200).send()
        
    }
    else{
        res.status(400).send()
    }
}