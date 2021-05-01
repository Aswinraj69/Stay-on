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
                roomno:room.roomno
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
            db.get().collection(collections.FOOD_COLLECTION).find({hid:objectId(hid)}).toArray().then((result)=>{
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
            foodDetails.price=parseInt(foodDetails.price)
            let food={
                foodname:foodDetails.foodname,
                restaurant:foodDetails.restaurant,
                price:foodDetails.price,
                category:foodDetails.category,
                hid:objectId(foodDetails.hid)
            }
            db.get().collection(collections.HOTELFOOD_COLLECTION).insertOne(food).then((result)=>{
                resolve(result.ops[0]._id)
            })
        })
    },
    getHotelFood:(hid)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.HOTELFOOD_COLLECTION).find({hid:objectId(hid)}).toArray().then((result)=>{
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
            HotelfoodDetails.price=parseInt(HotelfoodDetails.price)
            db.get().collection(collections.HOTELFOOD_COLLECTION).updateOne({_id:objectId(id)},{$set:{
                
            foodname:HotelfoodDetails.foodname,
            price:HotelfoodDetails.price,
            restaurant:HotelfoodDetails.restaurant
            }}).then((result)=>{
                resolve(result)
            })
        })
    },
 
    
    //get bookings
    getbookings:(hId)=>{
        return new Promise((resolve,reject)=>{
            let response ={}
            db.get().collection(collections.ORDER_COLLECTION).find({hid:objectId(hId),status:"1"}).toArray().then(async(bookings)=>{
                response.rooms=bookings
                let foods=await db.get().collection(collections.FOODORDER_COLLECTION).find({hotelId:objectId(hId),status:"1"}).toArray()
                if(foods){
                    response.foods=foods
                    resolve(response)
                }else{
                    resolve(response)
                }
            })
        })
    },

    //refund
    refund:(hotelId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.REFUND_COLLECTION).find({hid:objectId(hotelId)}).toArray().then((refunds)=>{
                resolve(refunds)
            })
        })
    },

    //refund details
    getRefundDetails:(refundId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.REFUND_COLLECTION).findOne({_id:objectId(refundId)}).then((details)=>{
                resolve(details)
            })
        })
    },

    //delivered food
    changeFoodStatus:(foodId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.FOODORDER_COLLECTION).updateOne({_id:objectId(foodId)},{$set:{
                status:"2"
            }}).then((result)=>{
                resolve()
            })
        })
    },

    //get delivered foods
    getDeliveredFoods:(hotelId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.FOODORDER_COLLECTION).find({hotelId:objectId(hotelId),status:"2"}).toArray().then((response)=>{
                resolve(response)
            })
        })
    },

    //do chaeckout 
    doCheckout:(orderId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.ORDER_COLLECTION).updateOne({_id:objectId(orderId)},{$set:{
                status:"2"
            }}).then(async()=>{
                let order = await db.get().collection(collections.ORDER_COLLECTION).findOne({_id:objectId(orderId)})
                db.get().collection(collections.ROOM_COLLECTION).updateOne({_id:objectId(order.rid)},{$set:{
                    status:"0"
                }}).then(()=>{
                    db.get().collection(collections.FOODORDER_COLLECTION).remove({userId:objectId(order.uid)}).then(()=>{
                        db.get().collection(collections.CHECKOUT_COLLECTION).insertOne(order).then(()=>{
                            resolve()
                        })
                    })
                    
                })
            })
        })
    },

    //get the checkouted list
    getCheckoutList:(hotelId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.CHECKOUT_COLLECTION).find({hid:objectId(hotelId)}).toArray().then((result)=>{
                resolve(result)
            })
        })
    }

} 