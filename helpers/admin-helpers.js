const collections=require('../config/collections')
const db=require('../config/connection')
const bcrypt=require('bcrypt')
const objectId=require('mongodb').ObjectID
const SmsNoify = require('../config/smsNotify')
const twilio = require('twilio')
const client = new twilio(SmsNoify.accountSId, SmsNoify.authToken);
module.exports={
    // signUp:(logDetails)=>{
    //     return new Promise(async(resolve,reject)=>{
    //         logDetails.password=await bcrypt.hash(logDetails.password,10)
    //         db.get().collection(collections.ADMIN_COLLECTION).insertOne(logDetails).then((response)=>{
    //             resolve(response.ops[0])
    //         })
    //     }) 
    // }        
    adminLogin:(adminData)=>{ 
        return new Promise(async(resolve,reject)=>{
            let response={}
           let admin=await db.get().collection(collections.ADMIN_COLLECTION).findOne({username:adminData.username})
           if(admin){
               bcrypt.compare(adminData.password,admin.password).then((status)=>{
                   if(status){
                        response.admin=admin
                        response.status=true
                        resolve(response)
                   }else{
                       resolve({status:false})
                   }
               })
           }else{
               resolve({status:false})
           }
        })
    },
    addHotels:(hotel)=>{
        return new Promise(async(resolve,reject)=>{
            hotel.password=await bcrypt.hash(hotel.password,10)
            db.get().collection(collections.HOTELS_COLLECTION).insertOne(hotel).then((result)=>{
                resolve(result.ops[0])
            })
        })
    },
    getHotels:()=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.HOTELS_COLLECTION).find({status:"1",block:"0"}).toArray().then((result)=>{
                resolve(result)
            })
        })
    },
    addCity:(city)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.CITY_COLLECTION).insertOne(city).then((response)=>{
                resolve(response.ops[0])
            })
        })
    },
    getCities:()=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.CITY_COLLECTION).find().toArray().then((result)=>{
                resolve(result)
            })
            
        })
    },
    editHotel:(id)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.HOTELS_COLLECTION).findOne({_id:objectId(id)}).then((result)=>{
                resolve(result)
            })
        })
    },
    updateHotel:(id,hotelDetails)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.HOTELS_COLLECTION).updateOne({_id:objectId(id)},{$set:{
                username:hotelDetails.username,
                hotelname:hotelDetails.hotelname,
                city:hotelDetails.city,
                hoteladdress:hotelDetails.hoteladdress,
                mobile:hotelDetails.mobile
            }}).then((result)=>{
                resolve(result)
            })
        })
    },
    deleteHotel:(id)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.HOTELS_COLLECTION).removeOne({_id:objectId(id)}).then((result)=>{
                resolve(result)
            })
        })
    },
    deleteCity:(id)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.CITY_COLLECTION).removeOne({_id:objectId(id)}).then((result)=>{
                resolve(result)
            })
        })
    },
    getCity:()=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.CITY_COLLECTION).find().toArray().then((result)=>{
                resolve(result)
            })
        })
    },
    editCity:(id)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.CITY_COLLECTION).findOne({_id:objectId(id)}).then((result)=>{
                resolve(result)
            })
        })
    },
    updateCity:(city,id)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.CITY_COLLECTION).updateOne({_id:objectId(id)},{$set:{
                city:city.city
            }}).then((result)=>{
                resolve(result)
            })
        })
    },

    //get all hotel request
    getAllRequests:()=>{
        return new Promise((resolve,reject)=>[
            db.get().collection(collections.HOTELS_COLLECTION).find({status:"0"}).toArray().then((result)=>{
                resolve(result)
            })
        ])
    },

    //accept hotel
    acceptHotel:(hotelId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.HOTELS_COLLECTION).updateOne({_id:objectId(hotelId)},{$set:{
                status:"1"
            }}).then(async()=>{
               let hotel = await db.get().collection(collections.HOTELS_COLLECTION).findOne({_id:objectId(hotelId)})
                client.messages
                .create({
                    body: 'Your request on Stay oN have been accepted. Please login with credentials',
                    from: '+19182057325',
                    to: "+91" + hotel.mobile
                }).then((msg) => {
                    
                    resolve()
                })
                
            })
        })
    },

    //reject hotel
    rejectHotel:(hotelId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.HOTELS_COLLECTION).updateOne({_id:objectId(hotelId)},{$set:{
                status:"2"
            }}).then(async()=>{
                let hotel = await db.get().collection(collections.HOTELS_COLLECTION).findOne({_id:objectId(hotelId)})
                client.messages
                .create({
                    body: 'Your request on Stay oN have been Rejected due to some verification error.',
                    from: '+19182057325',
                    to: "+91" + hotel.mobile
                }).then((msg) => {
                    
                    resolve()
                })
            })
        })
    },
    //block hotel
    blockHotel:(hotelId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.HOTELS_COLLECTION).updateOne({_id:objectId(hotelId)},{$set:{
                block:"1",
                status:"0"
            }}).then(()=>{
                db.get().collection(collections.ROOM_COLLECTION).updateMany({hid:hotelId},{$set:{
                    status:"1"
                }}).then(()=>{
                    resolve()
                })
               
            })
        }) 
    },

    //get blocked hotels
    getBlockedHotels:()=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.HOTELS_COLLECTION).find({block:"1"}).toArray().then((result)=>{
                resolve(result)
            })
        })
    },
    unBlockHotel:(hotelId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.HOTELS_COLLECTION).updateOne({_id:objectId(hotelId)},{$set:{
                block:"0",
                status:"1"
            }}).then(()=>{
                db.get().collection(collections.ROOM_COLLECTION).updateMany({hid:hotelId},{$set:{
                    status:"0"
                }}).then(()=>{
                    resolve()
                })
            })
        })
    },

    //get all users
    getAllUsers:()=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.USER_COLLECTION).find({block:'0'}).toArray().then((result)=>{
                resolve(result)
            })
        })
    },

    //block user
    blockUser:(userId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.USER_COLLECTION).updateOne({_id:objectId(userId)},{$set:{
                block:"1"
            }}).then(()=>{
                resolve()
            })
        })
    },

    //get all blocked users
    getBlockedUsers:()=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.USER_COLLECTION).find({block:'1'}).toArray().then((result)=>{
                resolve(result)
            })
        }) 
    },

    unblockUser:(userId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.USER_COLLECTION).updateOne({_id:objectId(userId)},{$set:{
                block:"0"
            }}).then(()=>{
                resolve()
            })
        })  
    },

    //delete user
    deleteUser:(userId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.USER_COLLECTION).removeOne({_id:objectId(userId)}).then(()=>{
                resolve()
            })
        })
    },

    //get al rooms
    getRooms:()=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.ROOM_COLLECTION).find().toArray().then((result)=>{
                resolve(result)
            })
        })
    },

    //change password
    changePassword:(details)=>{
        return new Promise(async(resolve,reject)=>{

            details.password2 = await bcrypt.hash(details.password2,10)
            let password2 = details.password2
            let admin = await db.get().collection(collections.ADMIN_COLLECTION).findOne({_id:objectId(details.aid)})
            if(admin){
                bcrypt.compare(details.password1,admin.password).then((status)=>{
                    if(status){
                        db.get().collection(collections.ADMIN_COLLECTION).updateOne({_id:objectId(details.aid)},{$set:{
                            password:password2
                        }}).then(()=>{
                            resolve({status:true})
                        })
                    }else{
                        resolve({status:false})
                    }
                })
            }else{
                resolve({status:false})
            }
          
                
          
        })
    },

    //change mobile number
    changeMobile:(details)=>{
        return new Promise(async(resolve,reject)=>{
            let admin = await db.get().collection(collections.ADMIN_COLLECTION).findOne({_id:objectId(details.aid)})
            
            if(admin){
               
                
                bcrypt.compare(details.password,admin.password).then((status)=>{
                    
                    if(status){
                        db.get().collection(collections.ADMIN_COLLECTION).updateOne({_id:objectId(details.aid)},{$set:{
                            mobile:details.mobile
                        }}).then(()=>{
                            resolve({status:true})
                        })
                    }else{
                        resolve({status:false})
                    }
                })
            }else{
                resolve({status:false})
            }
        })
    },

    //get all the feedbacks
    getFeedbacks:()=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.CONTACT_COLLECTION).find().toArray().then((result)=>{
                resolve(result)
            })
        })
    },

    //get all hotels
    getAllHotels:()=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.HOTELS_COLLECTION).find().toArray().then((result)=>{
                let n = result.length
                resolve(n)
            })
        })
    },

    getUsers:()=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.USER_COLLECTION).find().toArray().then((result)=>{
                let n = result.length
                resolve(n)
            })
        })
    },

    getAllRooms:()=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.ROOM_COLLECTION).find().toArray().then((result)=>{
                let n = result.length
                resolve(n)
            })
        }) 
    },


    getActiveHotels:()=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.HOTELS_COLLECTION).find({status:"1"}).toArray().then((result)=>{
                let n = result.length
                resolve(n)
            })
        })
    },

    getLimitedHotels:()=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.HOTELS_COLLECTION).find({status:"1"}).limit(5).toArray().then((result)=>{
                resolve(result)
            })
        })
    }
    
} 