var express = require('express');
var router = express.Router();
var userHelper=require('../helpers/user-helper')
var hotelHelper=require('../helpers/hotel-helpers')
var url=require('url')
const verifyLogin=(req,res,next)=>{
    if(req.session.userLoggedIn){
        next()
    }else{
        res.redirect('/login')
    }
}

/* GET users listing. */
router.get('/', function(req, res, next) {
    userHelper.getCity().then((response)=>{
        
        res.render('user/index',{user:true,userdetails:req.session.user,cities:response.city,hotels:response.hotel});
    })
    
});

router.get('/login', function(req, res, next) {
    if(req.session.userLoggedIn){
        res.redirect('/')
    }else{
        res.render('user/login',{layout:null});
    }
    
});

router.post('/login', function(req, res, next) {
    userHelper.userLogin(req.body).then((response)=>{
        if(response.status){
            req.session.userLoggedIn=true
            req.session.user=response.user
            res.redirect('/')
        }else{
            res.redirect('/login')
        }
    })
});
router.get('/signup', function(req, res, next) {
    if(req.session.userLoggedIn){
        res.redirect('/')
    }else{
        res.render('user/signup',{layout:null});
    }
});
router.post('/signup', function(req, res, next) {
    userHelper.userSignUp(req.body).then((response)=>{
        console.log(response);
        req.session.userLoggedIn=true
        req.session.user=response
        res.redirect('/')
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
    userHelper.roomDetails(req.params.id).then((result)=>{
        userHelper.getHotelFood(result.room.hid).then((hotelfood)=>{
            res.render('user/room-details',{user:true,roomdetails:result.room,hoteldetails:result.hotel,
                food:result.food,userdetails:req.session.user,hotelfood,foods:req.session.foods})
                
        })
        
        
    })
    
})
router.post('/booking-room', verifyLogin,function(req,res,next){
   userHelper.booking(req.body).then(()=>{
       res.redirect('/confirm-booking')
   })
})
router.get('/confirm-booking', verifyLogin, function(req,res,next){
    userHelper.getBooking(req.session.user._id).then(async(response)=>{
        let people=parseInt(response.bookingdetails.people)
        let roomprice=parseInt(response.roomdetails.roomprice)
        let total = people*roomprice
        let foodDetails=await userHelper.getfoodDetails(req.session.user._id)
        var today=new Date()
        var dd = String(today.getDate()).padStart(2, '0');
        var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
        var yyyy = today.getFullYear();
        today = dd +'/'+ mm +'/'+ yyyy;
        res.render('user/confirm-booking',{user:true,userdetails:req.session.user,booked:response.bookingdetails,
            hotelDetails:response.hoteldetails,today,
            room:response.roomdetails,total})
    })
    
})

router.post('/searchfood',function(req,res){
   userHelper.getSearchFood(req.body).then((foods)=>{
    req.session.foods=foods
   res.json(foods)
   }) 
  })
module.exports = router;