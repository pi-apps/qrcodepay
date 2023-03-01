import admin from 'lib/firebase'
import axios from 'axios'
import StellarSdk from 'stellar-sdk'
export default async function handler(req,res)
{
    return new Promise(resolve =>{

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
                    const amount = (data.amount - 0.01).toFixed(7)
                    const id = firebase.push({
                        username:username,
                        amount:amount,
                        destination:data.metadata.key,
                        txid:JSON.parse(req.body).txid,
                        created_at:data.created_at,
                        transfer:false
                    })
                    const transferdata = {
                        key:data.metadata.key,
                        amount:amount,
                        id:id.key
                    }
                    return transferdata
                }).then((data)=>{
                    const SecretKey = process.env.ESCROW_SECRET_KEY;
                    const sourceKeypair = StellarSdk.Keypair.fromSecret(SecretKey);
                    const server = new StellarSdk.Server('https://api.testnet.minepi.com');
                    server.loadAccount(sourceKeypair.publicKey()).then(
                        (account)=>{
                            const transaction = new StellarSdk.TransactionBuilder(account,{
                                fee:100000,
                                networkPassphrase:'Pi Testnet'
                            }).addOperation(StellarSdk.Operation.payment({
                                destination:data.key,
                                asset:StellarSdk.Asset.native(),
                                amount:data.amount
                            })).setTimeout(30).addMemo(
                                StellarSdk.Memo.text('QRcode Transfer!')
                            ).build()
                            transaction.sign(sourceKeypair)
                            server.submitTransaction(transaction).then(()=>{
                                const firebase = admin.database().ref('TestNet/PayHistory/'+data.id)
                                firebase.update({
                                    transfer:true
                                })
                                res.status(200).end()
                                return resolve()
                            }).catch((error)=>{
                                res.status(500).end()
                                return resolve()
                            })                        
                        }
                    ).catch((error)=>{
                        res.status(500).end()
                        return resolve()
                    })  ;
                    
                    
                }).catch((error) => {
                    console.log(error)
                    res.status(500).end()
                    return resolve()
                }) 
            }).catch((error) => {
                console.log(error)
                res.status(500).end()
                return resolve()
            })
            
            
        }
        else{
            res.status(400).end()
            return resolve()
        }

    })    
}