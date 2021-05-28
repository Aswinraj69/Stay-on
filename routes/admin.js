var express = require('express');
var router = express.Router();
var adminHelper=require('../helpers/admin-helpers')
const verifyLogin = (req, res, next) => {
  if (req.session.adminLoggedIn) {
    next()
  } else {
    res.redirect('/admin')
  }
}

/* GET home page. */
router.get('/', function(req, res, next) {
  if(req.session.adminLoggedIn){
    res.redirect('/admin/home')
  }else{ 
res.render('admin/login',{admin:true,layout:null,adminErr:req.session.adminErr});
req.session.adminErr=false
  }
  
});
router.get('/logout',function(req,res){
  req.session.adminLoggedIn=null
  res.redirect('/admin')
})
router.post('/', function(req, res, next) {
 adminHelper.adminLogin(req.body).then((response)=>{
  if(response.status){
    req.session.adminLoggedIn=true
    req.session.admin=response.admin
    res.redirect('/admin/home')
  }else{
    req.session.adminErr=true
    res.redirect('/admin')
  }
 })
});
router.get('/home',async function(req, res, next) {
  if(req.session.adminLoggedIn){
    let total_hotels = await adminHelper.getAllHotels()
    let total_users = await adminHelper.getUsers()
    let total_rooms = await adminHelper.getAllRooms()
    let active_hotels = await adminHelper.getActiveHotels()
    let hotels = await adminHelper.getLimitedHotels()
    res.render('admin/index',{admin:true,total_hotels,total_users,total_rooms,active_hotels, hotels,signedUp:req.session.hotelSignedUp
    ,contactedAdmin:req.session.contactedAdmin});
    
  }else{
    res.redirect('/admin')
  }
  
});
router.get('/hotels', function(req, res, next) {
  if(req.session.adminLoggedIn){
    adminHelper.getHotels().then((hotels)=>{
     
      res.render('admin/hotels',{admin:true,hotels:hotels,signedUp:req.session.hotelSignedUp,contactedAdmin:req.session.contactedAdmin});
    })
    
  }else{ 
    res.redirect('/admin')
  }
});
router.get('/users', async function(req, res, next) {
  if(req.session.adminLoggedIn){
    let users = await adminHelper.getAllUsers()
    res.render('admin/user',{admin:true,users,signedUp:req.session.hotelSignedUp,contactedAdmin:req.session.contactedAdmin});
  }else{
    res.redirect('/admin')
  }
  
});

//block user
router.get('/block-user/:id',verifyLogin,(req,res)=>{
  adminHelper.blockUser(req.params.id).then(()=>{
    res.redirect('/admin/users')
  })
})

//blockedusers
router.get('/blocked-users',verifyLogin,async(req,res)=>{
  let users = await adminHelper.getBlockedUsers()
  res.render('admin/blocked-users',{admin:true,users,signedUp:req.session.hotelSignedUp,contactedAdmin:req.session.contactedAdmin})
})

//unblock users
router.get('/unblock-user/:id',verifyLogin,(req,res)=>{
  adminHelper.unblockUser(req.params.id).then(()=>{
    res.redirect('/admin/blocked-users')
  })
})

//delete user
router.get('/delete-user/:id',verifyLogin,(req,res)=>{
  adminHelper.deleteUser(req.params.id).then(()=>{
    res.redirect('/admin/users')
  })
})



router.get('/addhotels',function(req,res,next){
  if(req.session.adminLoggedIn){
    adminHelper.getCity().then((city)=>{
      var today=new Date()
      var dd = String(today.getDate()).padStart(2, '0');
      var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
      var yyyy = today.getFullYear();
      today = dd +'/'+ mm +'/'+ yyyy;
      res.render('admin/add-hotels',{admin:true,date:today,city,signedUp:req.session.hotelSignedUp,contactedAdmin:req.session.contactedAdmin})
    })
   
  }else{
    res.redirect('/admin')
  }
  
})
router.post('/addhotels',verifyLogin,function(req,res,next){
  adminHelper.addHotels(req.body).then((response)=>{
    if(req.files.image){
     let image=req.files.image
      image.mv('./public/hotel/hotel-images/'+response._id+'.jpg')
    }
    res.redirect('/admin/home')
  })
})

router.get('/city',function(req,res){
  if(req.session.adminLoggedIn){
    adminHelper.getCities().then((cities)=>{
      res.render('admin/city',{admin:true,cities}) 
    })
    
  }else{
    res.redirect('/admin')
  }
  
})
router.get('/addcity',function(req,res){
  if(req.session.adminLoggedIn){
    res.render('admin/addcity',{admin:true,signedUp:req.session.hotelSignedUp,contactedAdmin:req.session.contactedAdmin})
  }else{
    res.redirect('/admin')
  }
  
})
router.post('/addcity',function(req,res){
  adminHelper.addCity(req.body).then((response)=>{
    res.redirect('/admin/city')
    if(req.files.image){
      let image=req.files.image
       image.mv('./public/hotel/city-images/'+response._id+'.jpg')
     }
  })
})

router.get('/editcity/:id',function(req,res){
  if(req.session.adminLoggedIn){
    adminHelper.editCity(req.params.id).then((city)=>{
      res.render('admin/editcity',{admin:true,city})
    })
    
  }else{
    res.redirect('/admin')
  }
  
})

router.post('/editcity/:id',function(req,res){
    adminHelper.updateCity(req.body,req.params.id).then((response)=>{
      res.redirect('/admin/city')
      if(req.files.image){
        let image=req.files.image
         image.mv('./public/hotel/city-images/'+req.params.id+'.jpg')
       }
    })
  
})


router.get('/edithotel/:id',function(req,res){
  if(req.session.adminLoggedIn){
    adminHelper.editHotel(req.params.id).then((hotels)=>{
      res.render('admin/edithotel',{admin:true,hotels,signedUp:req.session.hotelSignedUp,contactedAdmin:req.session.contactedAdmin})
    })
    
  }else{
    res.redirect('/admin')
  }
})

router.post('/addhotels/:id',function(req,res){
  adminHelper.updateHotel(req.params.id,req.body).then((response)=>{
    res.redirect('/admin/hotels')
    if(req.files.image){
      let image=req.files.image
       image.mv('./public/hotel/hotel-images/'+req.params.id+'.jpg')
     }
  })
})
router.get('/deletehotel/:id',function(req,res){
  adminHelper.deleteHotel(req.params.id).then(()=>{
    res.redirect('/admin/hotels')
  })
})
router.get('/deletecity/:id',function(req,res){
  adminHelper.deleteCity(req.params.id).then(()=>{
    res.redirect('/admin/city')
  })
})

//hotel requests
router.get('/hotel-request',verifyLogin,async(req,res)=>{
  let requests = await adminHelper.getAllRequests()
  res.render('admin/hotel-requests',{admin:true,requests,signedUp:req.session.hotelSignedUp,contactedAdmin:req.session.contactedAdmin})
})


//accept hotel
router.get('/accepthotel/:id',verifyLogin,(req,res)=>{
  adminHelper.acceptHotel(req.params.id).then(()=>{
    req.session.hotelSignedUp=null
    res.redirect('/admin/hotel-request')
  })
})

//reject hotel
router.get('/rejecthotel/:id',verifyLogin,(req,res)=>{
  adminHelper.rejectHotel(req.params.id).then(()=>{
    req.session.hotelSignedUp=null
    res.redirect('/admin/hotel-request')
  })
})


//block hotel
router.get('/blockhotel/:id',verifyLogin,(req,res)=>{
  adminHelper.blockHotel(req.params.id).then(()=>{
    res.redirect('/admin/hotels')
  })
})

//blocked hotels
router.get('/blocked-hotels',verifyLogin,async(req,res)=>{
  let hotels = await adminHelper.getBlockedHotels()
  res.render('admin/blocked-hotels',{admin:true,hotels,signedUp:req.session.hotelSignedUp,contactedAdmin:req.session.contactedAdmin})
})

//unblock hotel
router.get('/unblockhotel/:id',verifyLogin,(req,res)=>{
  adminHelper.unBlockHotel(req.params.id).then(()=>{
    res.redirect('/admin/blocked-hotels')
  })
})

//show rooms
router.get('/rooms',async(req,res)=>{
  let rooms = await adminHelper.getRooms()
  res.render('admin/rooms',{admin:true,rooms,signedUp:req.session.hotelSignedUp,contactedAdmin:req.session.contactedAdmin})
})

//change password
router.get('/change-password',verifyLogin,(req,res)=>{
  res.render('admin/change-password',{admin:true,adminDetails:req.session.admin,changeFail:req.session.adminPassFail
    ,passchanged:req.session.adminPassChanged,signedUp:req.session.hotelSignedUp,contactedAdmin:req.session.contactedAdmin})
  req.session.adminPassFail=null
  req.session.adminPassChanged=null
})

//post request for changing password
router.post('/change-password',verifyLogin,(req,res)=>{
  adminHelper.changePassword(req.body).then((response)=>{
    if(response.status){
      req.session.adminPassChanged=true
      res.redirect('/admin/change-password')
    }else{
      req.session.adminPassFail=true
      res.redirect('/admin/change-password')
    }
    

  })
})

//change mobile number
router.get('/change-mobile',verifyLogin,(req,res)=>{
  res.render('admin/change-mobile',{admin:true,adminDetails:req.session.admin,changed:req.session.adminNumChanged
    ,changeFail:req.session.adminNumChangeFail,signedUp:req.session.hotelSignedUp,contactedAdmin:req.session.contactedAdmin})
    req.session.adminNumChanged=null
    req.session.adminNumChangeFail=null
})

//change mobile post request
router.post('/change-mobile',verifyLogin,(req,res)=>{
  adminHelper.changeMobile(req.body).then((result)=>{
    if(result.status){
      req.session.adminNumChanged=true
      res.redirect('/admin/change-mobile')
    }else{
      req.session.adminNumChangeFail=true
      res.redirect('/admin/change-mobile')
    }
  })
})

//feedbacks
router.get('/feedbacks',verifyLogin,async(req,res)=>{
  let contacts = await adminHelper.getFeedbacks()
  res.render('admin/feedbacks',{admin:true,contacts,signedUp:req.session.hotelSignedUp,contactedAdmin:req.session.contactedAdmin})
  req.session.contactedAdmin=null
})

module.exports = router;
