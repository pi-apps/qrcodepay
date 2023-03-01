import { useRouter } from "next/router"
import { useState,useEffect } from "react"
import Script from "next/script"

export default function Payment(){
    const router = useRouter()
    const {key,amount} = router.query
    const [piready,setpistatus] = useState(false)
    const [piauth,setpiauth] = useState(null)
    const [incomplete,setincomplete] = useState(false)
    function onIncompletePaymentFound(payment) {
      setincomplete(true)
        fetch(
          process.env.NEXT_PUBLIC_BASE_URL +'api/incomplete',{
            method: 'POST',
            headers:{
              'Authorization': piauth.accessToken
            },
            body: JSON.stringify({pid: payment.identifier,txid:payment.transaction.txid})
          }
        ).then(()=>{
          setincomplete(false)
        })
        
    };

    function PiInit(){

      switch (process.env.NEXT_PUBLIC_MODE){
        case 'sandbox':
          Pi.init({ version:'2.0',sandbox:true})
          setpistatus(true)
          break;
        case 'product':
          Pi.init({ version:'2.0',sandbox:false})
          setpistatus(true)
          break;
      }
        
      }
    
    useEffect(()=>{
        try {
            if(!router.isReady) return;
            if(piready){            
            const scopes = ['username', 'payments'];
            const user = window.Pi.authenticate(scopes, onIncompletePaymentFound).then(function(auth){              
              setpiauth(auth) //改順序
                           
                
          })
          }      
          
        } catch (err) {
            console.log(err)
        }
      },[piready,router.isReady])

      useEffect(()=>{
        if(piauth==null) return;
        window.Pi.createPayment({
          // Amount of π to be paid:
          amount: ((parseInt(amount)+100000)*0.0000001).toFixed(7),
          // An explanation of the payment - will be shown to the user:
          memo: "Send "+ (parseFloat(amount)*0.0000001).toFixed(7), // e.g: "Digital kitten #1234",
          // An arbitrary developer-provided metadata object - for your own usage:
          metadata: { type:1,key:key }, // e.g: { kittenId: 1234 }
        }, {
          // Callbacks you need to implement - read more about those in the detailed docs linked below:
          onReadyForServerApproval: function(paymentId) { 
            fetch(
              process.env.NEXT_PUBLIC_BASE_URL +'api/approval',{
                method: 'POST',
                headers:{
                  'Authorization': piauth.accessToken
                },
                body: JSON.stringify({pid: paymentId})
              }
            )
           },
          onReadyForServerCompletion: function(paymentId, txid) {
            fetch(
              process.env.NEXT_PUBLIC_BASE_URL +'api/paycomplete',{
                method: 'POST',
                headers:{
                  'Authorization': piauth.accessToken
                },
                body: JSON.stringify({pid: paymentId,txid:txid})
              }
            )
          },
          onCancel: function(paymentId) { /* ... */ },
          onError: function(error, payment) { /* ... */ },
        })
      },[piauth])
    return(<>
    <Script src="https://sdk.minepi.com/pi-sdk.js" onReady={PiInit}/>
    </>)
}