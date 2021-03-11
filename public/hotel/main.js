

function payment(hid,total,accno,ifsc,holder,branch){
    $.ajax({
        url:'/hotel/razorpay/'+hid,
        data:{
            total:total,
            accno:accno,
            ifsc:ifsc,
            holder:holder,
            branch:branch
        },
        dataType:json,
        method:'post', 
        success:(response)=>{
           razorpayPayment(response) 
        }
    })   
}