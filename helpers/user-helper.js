const collections=require('../config/collections')
const db=require('../config/connection')
const bcrypt=require('bcrypt')
const objectId=require('mongodb').ObjectID

module.exports={
    userSignUp:(logDetails)=>{
            return new Promise(async(resolve,reject)=>{
                logDetails.password=await bcrypt.hash(logDetails.password,10)
                db.get().collection(collections.USER_COLLECTION).insertOne(logDetails).then((response)=>{
                    resolve(response.ops[0])
                })
            }) 
        },
    userLogin:(loginDetails)=>{
        return new Promise(async(resolve,reject)=>{
            
            let response={}
            let user=await db.get().collection(collections.USER_COLLECTION).findOne({username:loginDetails.username})
            
            if(user){
                
                bcrypt.compare(loginDetails.password,user.password).then((status)=>{
                    if(status){
                         response.user=user
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
    getCity:()=>{
        return new Promise(async(resolve,reject)=>{
           let response={}
           let city = await db.get().collection(collections.CITY_COLLECTION).find().toArray()
           response.city=city
           let hotel = await db.get().collection(collections.HOTELS_COLLECTION).find().toArray()
           response.hotel=hotel    
          resolve(response)   
           
        })
    },
    getrooms:(id)=>{
        return new Promise((resolve,reject)=>{
         db.get().collection(collections.ROOM_COLLECTION).find({hid:id}).toArray().then((result)=>{
             resolve(result)
         })
        })
    },
    roomDetails:(id)=>{
        return new Promise((resolve,reject)=>{
            let response={}
            db.get().collection(collections.ROOM_COLLECTION).findOne({_id:objectId(id)}).then((result)=>{
               response.room=result
               db.get().collection(collections.HOTELS_COLLECTION).findOne({_id:objectId(result.hid)}).then((hotelDetails)=>{
                   response.hotel=hotelDetails
                   db.get().collection(collections.FOOD_COLLECTION).find({hid:result.hid}).toArray().then((food)=>{
                        response.food=food
                        resolve(response)
                   })
               })
            })
        })
    },
    booking:(bookdetails)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.BOOKING_COLLECTION).insertOne(bookdetails).then(()=>{
                resolve()
            })
        })
    },
    getBooking:(uId)=>{
        return new Promise(async(resolve,reject)=>{
            let response={}
            let bookRoom=await db.get().collection(collections.BOOKING_COLLECTION).findOne({uid:uId})
            response.bookingdetails=bookRoom
            let room=await db.get().collection(collections.ROOM_COLLECTION).findOne({_id:objectId(bookRoom.rid)})
            response.roomdetails=room
            let hotel=await db.get().collection(collections.HOTELS_COLLECTION).findOne({_id:objectId(bookRoom.hid)})
            response.hoteldetails=hotel
            resolve(response)
        })
    },
    getfoodDetails:(uId)=>{
        return new Promise(async(resolve,reject)=>{
            let foodItems= await db.get().collection(collections.BOOKING_COLLECTION).aggregate([
                {
                    $match:{uid:uId}
                },
                {
                    $lookup:{
                        from:collections.FOOD_COLLECTION,
                        let:{foodList:[objectId("5fef09688a397c2f4cb9f858"),objectId("5ff023784fa4da06205b278d")]},
                        pipeline:[
                            {
                                $match:{
                                    $expr:{
                                        $in:['$_id',"$$foodList"]
                                    }
                                }
                            }
                        ],
                        as:'foodItems'
                    }
                }
            ]).toArray()
            
            resolve(foodItems)
        })
    },
    getHotelFood:(hid)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.HOTELFOOD_COLLECTION).find({hid:hid}).limit(4).toArray().then((result)=>{
                resolve(result)
            })
           
        })
    },
    getSearchFood:(query)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.HOTELFOOD_COLLECTION).find({foodname:{$regex:query.food,$options:"i"}}).toArray().then((result)=>{
                resolve(result)
            })
         
        })
    },


}