var express = require('express');
var router = express.Router();
var userHelper=require('../helpers/user-helper');

const verifyLogin=(req,res,next)=>{
    if(req.session.userLoggedIn){
        next()
    }else{
        res.redirect('/user')
    }
}

/* GET users listing. */
router.get('/', function(req, res, next) {
    userHelper.getCity().then((response)=>{
        res.render('user/index',{user:true,userdetails:req.session.user,cities:response.city,status:req.session.status,
            hotels:response.hotel,rooms:req.session.searchroom,luxury:response.luxury});
            req.session.status=null
        req.session.searchroom=null
    })
    
});

router.get('/login', function(req, res, next) {
    res.render('user/select-login',{user:true,userdetails:req.session.user});
    
});
router.get('/user',(req,res)=>{
    if(req.session.userLoggedIn){
        res.redirect('/')
    }else{
        res.render('user/login',{layout:null,passchanged:req.session.userPassChange,loginerr:req.session.userLoginErr});
        req.session.userPassChange=null
        req.session.userLoginErr=null
    }
})

router.post('/login', function(req, res, next) {
    userHelper.userLogin(req.body).then((response)=>{
        if(response.status){
            req.session.userLoggedIn=true
            req.session.user=response.user
            res.redirect('/')
        }else{
            req.session.userLoginErr=true
            res.redirect('/user')
        }
    })
});
router.get('/signup', function(req, res, next) {
    if(req.session.userLoggedIn){
        res.redirect('/')
    }else{
        res.render('user/signup',{layout:null,userSignUpErr:req.session.userSignUpErr});
        req.session.userSignUpErr=null
    }
});
router.post('/signup', function(req, res, next) {
    userHelper.userSignUp(req.body).then((response)=>{
        if(response.status){
            console.log(response);
            req.session.userLoggedIn=true
            req.session.user=response.user
            res.redirect('/')
        }else{
            req.session.userSignUpErr=true
            res.redirect('/signup')
        }
       
    })
});

router.get('/logout', function(req, res, next) {
   req.session.userLoggedIn=null
   req.session.user=null
   res.redirect('/')
});
router.get('/rooms/:id',function(req,res,next){
    userHelper.getrooms(req.params.id).then((rooms)=>{
        res.render('user/rooms',{user:true,rooms,userdetails:req.session.user})
    })
   
})
router.get('/book-food',function(req,res,next){

    res.render('user/food',{user:true,userdetails:req.session.user})
})
router.get('/room-details/:id',function(req,res,next){
    req.session.rid=req.params.id
    userHelper.roomDetails(req.params.id).then(async(result)=>{
            let five = await userHelper.getFive(req.params.id)
            let four = await userHelper.getFour(req.params.id)
            let three = await userHelper.getThree(req.params.id)
            let two = await userHelper.getTwo(req.params.id)
            let one = await userHelper.getOne(req.params.id)
            let rate = ((5*five)+(4*four)+(3*three)+(2*two)+(1*one))/10
            let reviews = await userHelper.getReviews(req.params.id)
            let dates = await userHelper.getDates(req.params.id)
            
            res.render('user/room-details',{user:true,roomdetails:result.room,hoteldetails:result.hotel,
                userdetails:req.session.user,foods:req.session.foods,bookingErr:req.session.bookingErr,
                five,four,three,two,one,rate,rated:req.session.rated,reviews,dates})
                req.session.bookingErr=null
                req.session.rated=null
        
    })
    
})
router.post('/booking-room', verifyLogin,function(req,res,next){
   userHelper.booking(req.body).then((response)=>{
       if(response.status){
        res.redirect('/confirm-booking')
       }else{
           req.session.bookingErr=true
           res.redirect('/room-details/'+req.body.rid)
       }
      
   })
})
router.get('/confirm-booking', verifyLogin, function(req,res,next){
    
    userHelper.getBooking(req.session.user._id).then(async(response)=>{
        let people=parseInt(response.bookingdetails.people)
        let roomprice=parseInt(response.roomdetails.roomprice)
        let checkin=new Date(response.bookingdetails.checkin)
        let day=86400000
        let checkout=new Date(response.bookingdetails.checkout)
        let milliseconds=checkout.getTime()-checkin.getTime()
        let days=milliseconds/day
        let total=days*roomprice
        
        //  let foodDetails=await userHelper.getfoodDetails(req.session.user._id)
        var today=new Date()
        var dd = String(today.getDate()).padStart(2, '0');
        var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
        var yyyy = today.getFullYear();
        today = dd +'/'+ mm +'/'+ yyyy;
        req.session.total=total
        res.render('user/confirm-booking',{user:true,userdetails:req.session.user,booked:response.bookingdetails,
            hotelDetails:response.hoteldetails,today,
            room:response.roomdetails,total})
    })
    
})

router.get('/razorpay/:id',verifyLogin,(req,res,next)=>{
    
    userHelper.createPaymentOrder(req.params.id,req.session.total).then((response)=>{
       
        let user=req.session.user
        res.json({response:response,user:user})
    })
})

router.post('/verify-payment',verifyLogin,(req,res,next)=>{
    userHelper.verifyPayment(req.body).then(()=>{
        req.session.bookingStatus=true
        res.json({status:true})
    }).catch((err)=>{
        res.json({status:false})
    })
})
//user-profile
router.post('/editprofile/:id',verifyLogin,function(req,res){
    userHelper.updateProfile(req.params.id,req.body).then((result)=>{
        req.session.user=result
        if(req.files){
            let image=req.files.image
            image.mv('./public/user/user-images/'+req.params.id+'.jpg')
          }
          res.redirect('/profile/'+req.params.id)
    })
})



//user profile
router.get('/profile/:id',verifyLogin,(req,res,next)=>{
    userHelper.bookedRooms(req.params.id).then(async(response)=>{
        let foods = await userHelper.getBookedFoods(req.params.id)
        
        var today=new Date()
        var dd = String(today.getDate()).padStart(2, '0');
        var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
        var yyyy = today.getFullYear();
        today = dd +'/'+ mm +'/'+ yyyy;
        
        res.render('user/profile',{user:true,userdetails:req.session.user,today,bookings:response,foods})

    }).catch((err)=>{
        console.log(err);
        res.render('user/profile',{user:true,userdetails:req.session.user})
    })
    
})

//cancel booking
router.get('/cancel-booking/:id',verifyLogin,(req,res,next)=>{
    userHelper.getTotal(req.params.id).then((total)=>{
        res.render('user/refund',{user:true,userdetails:req.session.user,bookId:req.params.id,total})
    })
   
})
router.get('/edit-user-profile/:id',verifyLogin,(req,res,next)=>{
    res.render('user/edit-profile',{user:true,userdetails:req.session.user})
})

//refund
router.post('/cancel-booking/:id',verifyLogin,(req,res)=>{
    userHelper.refund(req.params.id,req.body).then(()=>{ 
        userHelper.cancelBooking(req.params.id).then(()=>{
            req.session.cancelStatus=true
        res.redirect('/profile/'+req.session.user._id)
        })
    })
})

//search rooms
router.post('/search-room',(req,res)=>{
    userHelper.searchRoom(req.body).then((rooms)=>{
        if(rooms.status){
            req.session.status=true
            res.redirect('/')
        }else{
            req.session.searchroom=rooms
            res.redirect('/')
        }
        
    })
})

//city rooms
router.get('/city-rooms/:id',(req,res)=>{
    userHelper.cityRooms(req.params.id).then((rooms)=>{
        if(rooms.status){
            req.session.status=true
            res.redirect('/')
        }else{
            req.session.searchroom=rooms
            res.redirect('/')
        }
       
    })
})

//contact page
router.get('/contact',(req,res)=>{
    res.render('user/contact',{user:true,userdetails:req.session.user,contacted:req.session.contacted})
    req.session.contacted=null
})

//contact post request
router.post('/contact',(req,res)=>{
    userHelper.contactAdmin(req.body).then(()=>{
        req.session.contacted=true
        req.session.contactedAdmin=true
        res.redirect('/contact')
    })
})

//foods
router.get('/food',verifyLogin,(req,res)=>{
    userHelper.getFood(req.session.user._id).then((foods)=>{
        if(foods.status===false){
            res.render('user/food',{user:true,userdetails:req.session.user,status:true,nofood:true})
        }else{
            userHelper.getCartItem(req.session.user._id).then((items)=>{
                userHelper.getTotalAmount(req.session.user._id).then(async(total)=>{
                    searchfood=req.session.searchFood
                    noSearch=req.session.noSearch
                    res.render('user/food',{user:true,userdetails:req.session.user,foods,items,total,searchfood,noSearch})
                    req.session.searchFood=null
                    req.session.noSearch=null
                })
               
            })
        }
        
    })
    
})

//add food to cart
router.get('/add-food/:id',verifyLogin,(req,res)=>{
    userHelper.addFood(req.params.id,req.session.user._id).then(()=>{
        res.redirect('/food')
    })
})

//change-food-quantity
router.post('/change-food-quantity',(req,res)=>{
    userHelper.changeFoodQuantity(req.body).then(()=>{
        
        res.json({status:true})
    })
})

//remove food 
router.post('/remove-food',(req,res)=>{
    userHelper.removeFood(req.body).then((response)=>{
        res.json(response)
    })
})

//place order
router.get('/order',verifyLogin,async(req,res)=>{
    let cartItems = await userHelper.getCartItem(req.session.user._id)
    let total = await userHelper.getTotalAmount(req.session.user._id)
    let hotel = await userHelper.getHotel(req.session.user._id)
    
    res.render('user/place-order',{user:true,userdetails:req.session.user,cartItems,total,hotelDetail:hotel})
})

//post request for placing the order
router.post('/order',async(req,res)=>{
    let cartItems = await userHelper.getCartItem(req.session.user._id)
    let total = await userHelper.getTotalAmount(req.session.user._id)
   userHelper.placeOrder(req.body,cartItems,total)
   res.redirect('/pay')
})

//payment for food
router.get('/pay',verifyLogin,async(req,res)=>{
    let total = await userHelper.getTotalAmount(req.session.user._id)
    res.render('user/pay',{user:true,userdetails:req.session.user,total})
})


//razorpay new
router.post('/razorpaynew/:id',verifyLogin,(req,res)=>{
    userHelper.createPaymentFoodOrder(req.params.id,req.body.total).then((response)=>{
        
        let user=req.session.user
        res.json({response:response,user:user})
    })
})

//verify food-payment
router.post('/verify-food-payment',verifyLogin,(req,res,next)=>{
    
    userHelper.verifyFoodPayment(req.body).then(()=>{
        
        userHelper.ChangeFoodStatus(req.body['order[receipt]']).then(()=>{
            req.session.FoodBookingStatus=true
            res.json({status:true})
        })
    }).catch((err)=>{
        res.json({status:false})
    })
})

//search food
router.post('/search-food',verifyLogin,(req,res)=>{
   userHelper.getSearchFood(req.body).then((result)=>{
       if(result.status===false){
           req.session.noSearch=true
       }else{
        req.session.searchFood = result
       }
     
       res.redirect('/food')
   })
})

//rate the room
router.post('/rate',verifyLogin,(req,res)=>{
    userHelper.rateAndReview(req.body).then(()=>{
        req.session.rated=true
        req.session.rateNotify=true
        res.redirect('/room-details/'+req.body.roomId)
    })
})

//forgot password
router.get('/forgot-pass',(req,res)=>{
    res.render('user/forgot-pass',{layout:null,userotperr:req.session.userOtpErr})
    req.session.userOtpErr=null
})

//post request for forgot password
router.post('/forgot-pass',(req,res)=>{
    userHelper.sentOtp(req.body).then((response)=>{
        if (response.data.status) {
          req.session.userMobile = response.data.to
          req.session.userPassChanger = response.user
          req.session.userOtpSent = true
          res.redirect('/verify-otp')
        } else {
          req.session.userOtpErr = true
          res.redirect('/forgot-pass')
        }
      })
})

//verify otp
router.get('/verify-otp',(req,res)=>{
    if(req.session.userOtpSent){
        res.render('user/verify-otp',{layout:null,wronguserotp:req.session.wrongUserOtp})
        req.session.wrongUserOtp=null
    }else{
        res.redirect('/forgot-pass')
    }
})

//post request for otp
router.post('/verify-otp',(req,res)=>{
    userHelper.verifyOtp(req.session.userMobile,req.body).then((response)=>{
        if (response.valid) {
            req.session.verifiedUserOtp = true
            res.redirect('/new-pass')
        }else{
            req.session.wrongUserOtp=true
            res.redirect('/verify-otp')
        }
    })
  })

//neww password
router.get('/new-pass',(req,res)=>{
    if(req.session.verifiedUserOtp){
        res.render('user/new-pass',{layout:null,details:req.session.userPassChanger})
    }else{
        res.render('error')
    }
    
})


//new password post request
router.post('/new-pass',(req,res)=>{
    userHelper.changeForgotPassword(req.body).then((response)=>{
     if (response.status) {
         req.session.userPassChange = true
         res.redirect('/user')
       } else {
         req.session.userChangeErr = true
         res.redirect('/new-pass')
       }
    })
  })


//change password
router.post('/change-pass',verifyLogin,(req,res)=>{
   userHelper.changePassword(req.body).then((response)=>{
       console.log(response);
        if(response.status){
            res.json({status:true})
        }else{
            res.json({status:false})
        }
   })

})

module.exports = router;