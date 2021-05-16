var express = require('express');
var router = express.Router();
var hotelHelper = require('../helpers/hotel-helpers');


const verifyLogin = (req, res, next) => {
  if (req.session.hotelLoggedIn) {
    next()
  } else {
    res.redirect('/hotel')
  }
}

/* GET users listing. */
router.get('/', function (req, res, next) {
  if (req.session.hotelLoggedIn) {
    res.redirect('/hotel/home')
  } else {
    res.render('hotel/login', { layout: null,signedUp:req.session.signedUp,passchanged: req.session.hotelPassChange,HotelLoginErr:req.session.HotelLoginErr });
    req.session.hotelPassChange=null
    req.session.HotelLoginErr=null
    req.session.signedUp=null
  }
});

//hotel login
router.post('/', function (req, res, next) {
  hotelHelper.hotelAuth(req.body).then((response) => {
    if (response.status) {
      req.session.hotelLoggedIn = true
      req.session.hotel = response.hotel
      res.redirect('/hotel/home')
    } else {
      req.session.HotelLoginErr = true
      res.redirect('/hotel')
    }
  })
});

//home page
router.get('/home',async function (req, res, next) {
  if (req.session.hotelLoggedIn) {
    let total_bookings = await hotelHelper.getTotalBookings(req.session.hotel._id)
    let total_rooms = await hotelHelper.getTotalRooms(req.session.hotel._id)
    let active_bookings = await hotelHelper.getActiveBookings(req.session.hotel._id)
    let rooms_available = await hotelHelper.getAvailableRooms(req.session.hotel._id)
    let bookings = await hotelHelper.getAllBookings(req.session.hotel._id)
    res.render('hotel/index', { hotel: true, hotel: req.session.hotel,
      bookingStatus:req.session.bookingStatus,
      cancelStatus:req.session.cancelStatus,total_bookings,total_rooms,active_bookings,rooms_available,bookings});
    req.session.bookingStatus=null
    
  } else {
    res.redirect('/hotel')
  }

});

//logout
router.get('/logout', function (req, res, next) {
  req.session.hotelLoggedIn = null
  res.redirect('/hotel')
});

//hotel profile
router.get('/profile/:id', function (req, res, next) {
  if (req.session.hotelLoggedIn) {
    hotelHelper.getHotel(req.params.id).then(async(profile) => {
      let total_rating = await hotelHelper.getTotalRating(req.params.id)
      let reviews = await hotelHelper.getNoOfReview(req.params.id)
      res.render('hotel/hotelprofile', {total_rating,reviews, hotel: true, hotel: req.session.hotel, profile ,
        bookingStatus:req.session.bookingStatus,cancelStatus:req.session.cancelStatus  });
      req.session.bookingStatus=null
    })

  } else {
    res.redirect('/hotel')
  }

});
router.get('/editprofile/:id', function (req, res) {
  if (req.session.hotelLoggedIn) {
    hotelHelper.editProfile(req.params.id).then((hotelDetails) => {
      res.render('hotel/editprofile', { hotel: true, hotelDetails, hotel: req.session.hotel,cancelStatus:req.session.cancelStatus  });
    })

  } else {
    res.redirect('/hotel')
  }
})
router.post('/editprofile/:id', function (req, res) {
  hotelHelper.updateProfile(req.params.id, req.body).then((response) => {
    res.redirect('/hotel/profile/' + req.params.id)
    if (req.files.image) {
      let image = req.files.image
      image.mv('./public/hotel/hotel-images/' + req.params.id + '.jpg')
    }
  })
})
router.get('/rooms', function (req, res) {
  if (req.session.hotelLoggedIn) {
    hotelHelper.getRooms(req.session.hotel._id).then((rooms) => {
      res.render('hotel/rooms', { hotel: true, rooms, hotel: req.session.hotel ,bookingStatus:req.session.bookingStatus,cancelStatus:req.session.cancelStatus  })
      req.session.bookingStatus=null
    })
  } else {
    res.redirect('/hotel')
  }

})
router.get('/addrooms', function (req, res) {
  if (req.session.hotelLoggedIn) {
    res.render('hotel/add-rooms', { hotel: true, hotel: req.session.hotel })
  } else {
    res.redirect('/hotel')
  }

})
router.get('/food', function (req, res) {
  if (req.session.hotelLoggedIn) {
    hotelHelper.getFoodCategory(req.session.hotel._id).then((category) => {
      hotelHelper.getAllFood(req.session.hotel._id).then((food) => {
        hotelHelper.getHotelFood(req.session.hotel._id).then((hotelfoods) => {
          res.render('hotel/food', { hotel: true, hotel: req.session.hotel, categories: category, food: food, hotelfoods
             ,bookingStatus:req.session.bookingStatus
            ,cancelStatus:req.session.cancelStatus  })
          req.session.bookingStatus=null
        })

      })

    })

  } else {
    res.redirect('/hotel')
  }

})
router.get('/addfood', function (req, res) {
  if (req.session.hotelLoggedIn) {
    hotelHelper.getCategory().then((categories) => {
      res.render('hotel/add-food', { hotel: true, hotel: req.session.hotel, categories })
    })

  } else {
    res.redirect('/hotel')
  }

})
router.post('/addfood', function (req, res) {
  hotelHelper.addFood(req.body).then((id) => {
    res.redirect('/hotel/food')
    if (req.files) {
      let image = req.files.image
      image.mv('./public/hotel/food-images/' + id + '.jpg')
    }
  })

})
router.get('/addfoodcategory', function (req, res) {
  if (req.session.hotelLoggedIn) {
    res.render('hotel/add-food-category', { hotel: true, hotel: req.session.hotel })
  } else {
    res.redirect('/hotel')
  }

})
router.post('/addfoodcategory', function (req, res) {
  hotelHelper.addFoodCategory(req.body).then(() => {
    res.redirect('/hotel/food')
  })

})
router.post('/addrooms', function (req, res) {
  hotelHelper.addRooms(req.body).then((response) => {
    console.log(response)
    res.redirect('/hotel/rooms')
    if (req.files) {
      let image1 = req.files.image1
      let image2 = req.files.image2
      let image3 = req.files.image3
      let image4 = req.files.image4
      let image5 = req.files.image5
      image1.mv('./public/hotel/rooms-images/' + response._id + '1.jpg')
      image2.mv('./public/hotel/rooms-images/' + response._id + '2.jpg')
      image3.mv('./public/hotel/rooms-images/' + response._id + '3.jpg')
      image4.mv('./public/hotel/rooms-images/' + response._id + '4.jpg')
      image5.mv('./public/hotel/rooms-images/' + response._id + '5.jpg')
    }
  })
}),

  router.get('/editroom/:id', function (req, res) {
    if (req.session.hotelLoggedIn) {
      hotelHelper.editRoom(req.params.id).then((room) => {
        res.render('hotel/editroom', { hotel: true, room, hotel: req.session.hotel })
      })
    } else {
      res.redirect('/hotel')
    }
  })
router.post('/editroom/:id', function (req, res) {
  hotelHelper.updateroom(req.params.id, req.body).then((response) => {
    if (req.files) {
      let image1 = req.files.image1
      let image2 = req.files.image2
      let image3 = req.files.image3
      let image4 = req.files.image4
      let image5 = req.files.image5
      image1.mv('./public/hotel/rooms-images/' + req.params.id + '1.jpg')
      image2.mv('./public/hotel/rooms-images/' + req.params.id + '2.jpg')
      image3.mv('./public/hotel/rooms-images/' + req.params.id + '3.jpg')
      image4.mv('./public/hotel/rooms-images/' + req.params.id + '4.jpg')
      image5.mv('./public/hotel/rooms-images/' + req.params.id + '5.jpg')
    }
    res.redirect("/hotel/rooms")
  })

})
router.get('/deleteroom/:id', function (req, res) {
  if (req.session.hotelLoggedIn) {
    hotelHelper.deleteroom(req.params.id).then((resp) => {
      res.redirect('/hotel/rooms')
    })
  } else {
    res.redirect('/hotel')
  }

})

router.get('/editfood/:id', verifyLogin, function (req, res) {
  hotelHelper.showFood(req.params.id).then((fooddetails) => {
    hotelHelper.getCategory().then((categories) => {
      res.render('hotel/editfood', { hote: true, hotel: req.session.hotel, fooddetails, categories })
    })

  })
})
router.post('/editfood/:id', function (req, res) {
  hotelHelper.updateFood(req.body, req.params.id).then(() => {
    if (req.files) {
      let image = req.files.image
      image.mv('./public/hotel/food-images/' + req.params.id + '.jpg')
    }
    res.redirect('/hotel/food')
  })

})
router.get('/deletefood/:id', function (req, res) {
  hotelHelper.deleteFood(req.params.id).then(() => {
    res.redirect('/hotel/food')
  })
})
router.get('/deletecategory/:id', function (req, res) {
  hotelHelper.deleteCategory(req.params.id).then(() => {
    res.redirect('/hotel/food')
  })
})

router.get('/addhotelfood', verifyLogin, function (req, res, next) {
  hotelHelper.getCategory().then((categories) => {
    res.render('hotel/hotelfood', { hotel: true, hotel: req.session.hotel, categories })
  })
})

router.post('/addhotelfood/', function (req, res) {
  hotelHelper.addHotelFood(req.body).then((id) => {
    if (req.files) {
      let image = req.files.image
      image.mv('./public/hotel/food-images/' + id + '.jpg')
    }
    res.redirect('/hotel/food')
  })
})

router.get('/edithotelfood/:id', verifyLogin, function (req, res) {
  hotelHelper.editHotelFood(req.params.id).then((result) => {
    hotelHelper.getCategory().then((categories) => {
      res.render('hotel/edit-hotel-food', { hotel: true, hotel: req.session.hotel, foods: result, category: categories })
    })

  })

})
router.get('/deletehotelfood/:id', function (req, res) {
  hotelHelper.deleteHotelFood(req.params.id).then(() => {
    res.redirect('/hotel/food')
  })
})
router.post('/edithotelfood/:id', function (req, res) {
  hotelHelper.updateHotelFood(req.body, req.params.id).then(() => {
    if (req.files) {
      let image = req.files.image
      image.mv('./public/hotel/food-images/' + req.params.id + '.jpg')
    }
    res.redirect('/hotel/food')
  })

})


router.get('/booking/:id', verifyLogin, (req, res) => {
  hotelHelper.getbookings(req.params.id).then((bookings) => {
    
    res.render('hotel/booking', { hotel: true, bookings: bookings.rooms, hotel: req.session.hotel,bookingStatus:req.session.bookingStatus,cancelStatus:req.session.cancelStatus,
                                        foods:bookings.foods  })
    req.session.bookingStatus=null
  })

})

//refund
router.get('/refund/:id',verifyLogin,(req,res)=>{
  hotelHelper.refund(req.params.id).then(async(refunds)=>{
    let refunded = await hotelHelper.getRefunded(req.params.id)
    res.render('hotel/refund',{hotel:true, hotel: req.session.hotel,refunds,bookingStatus:req.session.bookingStatus 
      ,cancelStatus:req.session.cancelStatus,refunded })
    req.session.bookingStatus=null
  })
  
})

//cash deposit to reuested customer
router.get('/deposit/:id',verifyLogin,(req,res)=>{
  hotelHelper.getRefundDetails(req.params.id).then((details)=>{
    if(details){
      req.session.cancelStatus=true
      req.session.refundId=req.params.id
    }else{
      req.session.cancelStatus=null
    }
    res.render('hotel/deposit',{hotel:true, hotel:req.session.hotel,details,bookingStatus:req.session.bookingStatus,cancelStatus:req.session.cancelStatus })
    req.session.bookingStatus=null
  })
  
})
//razorpay order
router.post('/refund-razorpay/:id',verifyLogin,(req,res,next)=>{
  
  hotelHelper.createRefundOrder(req.params.id,req.body).then((response)=>{
      
      let hotel=req.session.hotel
      res.json({response:response,hotel:hotel}) 
  })
 
})

//verify payment
router.post('/verify-payment',verifyLogin,(req,res,next)=>{
  hotelHelper.verifyRefundPayment(req.body).then(()=>{
      
      hotelHelper.ChangeRefundStatus(req.session.refundId).then(()=>{
        
          res.json({status:true})
      })
  }).catch((err)=>{
      res.json({rId:req.session.refundId})
  })
  
})


//food delivery
router.get('/food-delivered/:id',verifyLogin,(req,res)=>{
  hotelHelper.changeFoodStatus(req.params.id).then((result)=>{
    res.redirect('/hotel/booking/'+req.session.hotel._id)
  })
})

//hotel delivered foods
router.get('/delivered-food/:id',verifyLogin,async(req,res)=>{
  let delivered_foods = await hotelHelper.getDeliveredFoods(req.params.id)
  res.render('hotel/delivered-food',{hotel: true, hotel: req.session.hotel,bookingStatus:req.session.bookingStatus
    ,cancelStatus:req.session.cancelStatus,foods:delivered_foods})
})

//checkout rooms
router.get('/checkout/:id',verifyLogin,(req,res)=>{
  hotelHelper.doCheckout(req.params.id).then(()=>{
    res.redirect('/hotel/booking/'+req.session.hotel._id)
  })
})

//checkout history
router.get('/checkout-history/:id',verifyLogin,async(req,res)=>{
  let bookings = await hotelHelper.getCheckoutList(req.params.id)
  res.render('hotel/checkout-history',{hotel: true, hotel: req.session.hotel,bookingStatus:req.session.bookingStatus
    ,cancelStatus:req.session.cancelStatus,bookings})
})

//change password
router.get('/change-password/:id',verifyLogin,(req,res)=>{
  res.render('hotel/change-password',{hotel: true, hotel: req.session.hotel,bookingStatus:req.session.bookingStatus
    ,cancelStatus:req.session.cancelStatus,changeFail:req.session.passChangeErr,passChanged: req.session.hotelPassChange})
    req.session.passChangeErr=null
    req.session.hotelPassChange=null
})

//post request for changing the password
router.post('/change-password',verifyLogin,(req,res)=>{
  hotelHelper.changePassword(req.body).then((response)=>{ 
    if (response.status) {
      req.session.hotelPassChange = true
      res.redirect('/hotel/change-password/'+req.session.hotel._id)
    } else {
      req.session.passChangeErr = true
      res.redirect('/hotel/change-password/'+req.session.hotel._id)
    }
  })
})

//request to sigup
router.get('/signup',(req,res)=>{
  var today=new Date()
      var dd = String(today.getDate()).padStart(2, '0');
      var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
      var yyyy = today.getFullYear();
      today = dd +'/'+ mm +'/'+ yyyy;
  res.render('hotel/signup',{layout:null,signupErr:req.session.SignupErr,today})
  req.session.signupErr=null
})

//post request for signup
router.post('/signup',(req,res)=>{
  hotelHelper.signUp(req.body).then((response)=>{
    if(response.status){
      req.session.signedUp=true
      if(req.files){
        let image=req.files.image
         image.mv('./public/hotel/hotel-images/'+response.hotel._id+'.jpg')
         let license =req.files.license
         license.mv('./public/hotel/license-images/'+response.hotel._id+'.jpg')
       }
      res.redirect('/hotel')
    }else{
      req.session.SignupErr=true
      res.redirect('/hotel/signup')
    }
  })
})

//rating and review
router.get('/rating/:id',verifyLogin,async(req,res)=>{
  let reviews = await hotelHelper.getReviews(req.params.id)
  res.render('hotel/rating',{hotel: true, hotel: req.session.hotel,bookingStatus:req.session.bookingStatus
    ,cancelStatus:req.session.cancelStatus,reviews})
})


//forgot password
router.get('/forgot-pass',(req,res)=>{
  res.render('hotel/forgot-pass',{layout:null, otperr:req.session.hotelOtpErr})
  req.session.hotelOtpEr=null
})

//forgot password post request
router.post('/forgot-pass',(req,res)=>{
  hotelHelper.sentOtp(req.body).then((response)=>{
    if (response.data.status) {
      req.session.hotelMobile = response.data.to
      req.session.hotelPassChanger = response.hotel
      req.session.hotelOtpSent = true
      res.redirect('/hotel/verify-otp')
    } else {
      req.session.hotelOtpErr = true
      res.redirect('/hotel/forgot-pass')
    }
  })
})

//verify otp
router.get('/verify-otp',(req,res)=>{
  if(req.session.hotelOtpSent){
    res.render('hotel/verify-otp',{layout:null,wrongotp: req.session.wrongHotelOtp})
    req.session.wrongHotelOtp=null
  }else{
    res.redirect('/hotel/forgot-pass')
  }
  
})

//post request for otp
router.post('/verify-otp',(req,res)=>{
  hotelHelper.verifyOtp(req.session.hotelMobile,req.body).then((response)=>{
      if (response.valid) {
          req.session.verifiedHotelOtp = true
          res.redirect('/hotel/new-pass')
      }else{
          req.session.wrongHotelOtp=true
          res.redirect('/hotel/verify-otp') 
      }
  })
})

//for new password
router.get('/new-pass',(req,res)=>{
  if(req.session.verifiedHotelOtp){
    res.render('hotel/new-pass',{layout:null,details: req.session.hotelPassChanger})
  }else{
    res.render('/error')
  }
})

//new password post request
router.post('/new-pass',(req,res)=>{
  hotelHelper.changeForgotPassword(req.body).then((response)=>{
   if (response.status) {
       req.session.hotelPassChange = true
       res.redirect('/hotel')
     } else {
       req.session.hotelChangeErr = true
       res.redirect('/hotel/new-pass')
     }
  })
})
module.exports = router;
