const collections=require('../config/collections')
const db=require('../config/connection')
const bcrypt=require('bcrypt')
const objectId=require('mongodb').ObjectID

module.exports={

    hotelAuth:(loginDetails)=>{
        return new Promise(async(resolve,reject)=>{
            console.log(loginDetails);
            let response={}
            let hotel=await db.get().collection(collections.HOTELS_COLLECTION).findOne({username:loginDetails.username})
            
            if(hotel){
                
                bcrypt.compare(loginDetails.password,hotel.password).then((status)=>{
                    if(status){
                         response.hotel=hotel
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
    editProfile:(id)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.HOTELS_COLLECTION).findOne({_id:objectId(id)}).then((hotel)=>{
                resolve(hotel)
            })
        })
    },
    updateProfile:(hid,hotel)=>{
        return new Promise((resolve,reject)=>{

            db.get().collection(collections.HOTELS_COLLECTION).updateOne({_id:objectId(hid)},{$set:{
                hotelname:hotel.hotelname,
                city:hotel.city,
                username:hotel.username,
                hoteladdress:hotel.hoteladdress,
                mobile:hotel.mobile,
                fblink:hotel.fblink,
                instalink:hotel.instalink,
                youtubelink:hotel.youtubelink,
                about:hotel.about

            }}).then((response)=>{
                resolve(response)
            })
        })
    },
    getHotel:(id)=>{
        return new Promise ((resolve,reject)=>{
            db.get().collection(collections.ROOM_COLLECTION).find({hid:id}).toArray().then((result)=>{
                resolve(result)
            })
        })
    },
    addRooms:(rooms)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.ROOM_COLLECTION).insertOne(rooms).then((response)=>{
                resolve(response.ops[0])
            })
        })
    },
    getRooms:(hid)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.ROOM_COLLECTION).find({hid:hid}).toArray().then((result)=>{

                resolve(result)
            })
        })
    },
    editRoom:(id)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.ROOM_COLLECTION).findOne({_id:objectId(id)}).then((result)=>{
                resolve(result)
            })
        })
    },
    updateroom:(roomid,room)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.ROOM_COLLECTION).updateOne({_id:objectId(roomid)},{$set:{
                roomname:room.roomname,
                avilableroom:room.availableroom,
                roomprice:room.roomprice,
               roomfeatures:room.roomfeatures,
                category:room.category,
            }}).then((response)=>{
                resolve(response)
            })
        })
    },
    deleteroom:(id)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.ROOM_COLLECTION).removeOne({_id:objectId(id)}).then((response)=>{
                resolve(response)
            })
        })
    },
    addFoodCategory:(details)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.FOOD_CATEGORY).insertOne(details).then((response)=>{
                resolve(response)
            })
        })
    }, 
    getFoodCategory:(hid)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.FOOD_CATEGORY).find({hid:hid}).toArray().then((result)=>{
                resolve(result)
            })
        })
    },
    getCategory:()=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.FOOD_CATEGORY).find().toArray().then((result)=>{
                resolve(result)
            })
        })
    },
    addFood:(foodDetails)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.FOOD_COLLECTION).insertOne(foodDetails).then((result)=>{
                resolve(result.ops[0]._id)
            })
        })
    },
    getAllFood:(hid)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.FOOD_COLLECTION).find({hid:hid}).toArray().then((result)=>{
                resolve(result)
            })
        })
    },
    showFood:(id)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.FOOD_COLLECTION).findOne({_id:objectId(id)}).then((result)=>{
                resolve(result)
            })
        })
    },

    updateFood:(foodDetails,id)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.FOOD_COLLECTION).updateOne({_id:objectId(id)},{$set:{
                price:foodDetails.price,
                foodname:foodDetails.foodname,
                category:foodDetails.category,
                package:foodDetails.package
            }}).then((result)=>{
                resolve(result)
            })
        })
    },
    deleteFood:(id)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.FOOD_COLLECTION).removeOne({_id:objectId(id)}).then((result)=>{
                resolve(result)
            })
        })
    },
    deleteCategory:(id)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.FOOD_CATEGORY).removeOne({_id:objectId(id)}).then((result)=>{
                resolve(result)
            })
        })
    },
    addHotelFood:(foodDetails)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.HOTELFOOD_COLLECTION).insertOne(foodDetails).then((result)=>{
                resolve(result.ops[0]._id)
            })
        })
    },
    getHotelFood:(hid)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.HOTELFOOD_COLLECTION).find({hid:hid}).toArray().then((result)=>{
                resolve(result)
            })
        })
    },
    editHotelFood:(id)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.HOTELFOOD_COLLECTION).findOne({_id:objectId(id)}).then((result)=>{
                resolve(result)
            })
        })
    },
    deleteHotelFood:(id)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.HOTELFOOD_COLLECTION).removeOne({_id:objectId(id)}).then((result)=>{
                resolve(result)
            })
        })
    },
    updateHotelFood:(HotelfoodDetails,id)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.HOTELFOOD_COLLECTION).updateOne({_id:objectId(id)},{$set:{
            foodname:HotelfoodDetails.foodname,
            price:HotelfoodDetails.price,
            restaurant:HotelfoodDetails.restaurant
            }}).then((result)=>{
                resolve(result)
            })
        })
    },

} 