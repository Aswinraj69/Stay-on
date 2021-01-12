var express = require('express');
var router = express.Router();
var adminHelper=require('../helpers/admin-helpers')


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
    res.redirect('/admin/home')
  }else{
    req.session.adminErr=true
    res.redirect('/admin')
  }
 })
});
router.get('/home', function(req, res, next) {
  if(req.session.adminLoggedIn){
    res.render('admin/index',{admin:true});
  }else{
    res.redirect('/admin')
  }
  
});
router.get('/hotels', function(req, res, next) {
  if(req.session.adminLoggedIn){
    adminHelper.getHotels().then((hotels)=>{
      console.log(hotels);
      res.render('admin/hotels',{admin:true,hotels:hotels});
    })
    
  }else{ 
    res.redirect('/admin')
  }
});
router.get('/users', function(req, res, next) {
  if(req.session.adminLoggedIn){
    res.render('admin/user',{admin:true});
  }else{
    res.redirect('/admin')
  }
  
});
router.get('/addhotels',function(req,res,next){
  if(req.session.adminLoggedIn){
    adminHelper.getCity().then((city)=>{
      var today=new Date()
      var dd = String(today.getDate()).padStart(2, '0');
      var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
      var yyyy = today.getFullYear();
      today = dd +'/'+ mm +'/'+ yyyy;
      res.render('admin/add-hotels',{admin:true,date:today,city})
    })
   
  }else{
    res.redirect('/admin')
  }
  
})
router.post('/addhotels',function(req,res,next){
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
    res.render('admin/addcity',{admin:true})
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
      res.render('admin/edithotel',{admin:true,hotels})
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


module.exports = router;
