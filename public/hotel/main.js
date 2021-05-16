

function refund(hid,total,accno,ifsc,holder,branch){
   
    $.ajax({
        url:'/hotel/refund-razorpay/'+hid,
        data:{
            total:total,
            accno:accno,
            ifsc:ifsc,
            holder:holder,
            branch:branch
        },
        method:'POST', 
        success:(response)=>{
           razorpayRefundPayment(response) 
        }
    })   
} 
function razorpayRefundPayment(order){
    var options = {
        "key": "rzp_test_BTPYMRVQAXV143", // Enter the Key ID generated from the Dashboard
        "amount": order.response.amount, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
        "currency": "INR",
        "name": "Travelix",
        "description": "Refund",
        "image": "https://99designs-blog.imgix.net/blog/wp-content/uploads/2019/04/attachment_86982101-e1555563023971.png?auto=format&q=60&fit=max&w=930",
        "order_id": order.response.id, //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
        "handler": function (response){
            // alert(response.razorpay_payment_id);
            // alert(response.razorpay_order_id);
            // alert(response.razorpay_signature)
            verifyRefundPaid(response,order.response,order)
        },
        "prefill": {
            "name": order.hotel.name,
            "email": order.hotel.username,
            "contact": order.hotel.mobile
        },
        "notes": {
            "address": ""
        },
        "theme": {
            "color": "#3399cc"
        }
    };
    var rzp1 = new Razorpay(options);
    rzp1.open();
    function verifyRefundPaid(payment,order,hotel){
        $.ajax({
            url:'/hotel/verify-payment',
            data:{
                payment,
                order
                
            },
            method:'POST',
            success:(response)=>{
                if(response.status){
                    location.href='/hotel/refund/'+hotel.hotel._id
                }else{
                    alert("Transaction failed")
                    location.href='/hotel/deposit/'+response.rId
                }
            }
        })
    }
}