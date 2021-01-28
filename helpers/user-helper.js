const collections=require('../config/collections')
const db=require('../config/connection')
const bcrypt=require('bcrypt')
const objectId=require('mongodb').ObjectID
const Razorpay=require('razorpay')
var instance= new Razorpay({
    key_id:'rzp_test_BTPYMRVQAXV143',
    key_secret:'T3nUEiAc1nQ8TC5PYYMTZiyw',
});

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
         db.get().collection(collections.ROOM_COLLECTION).find({hid:id,status:"0"}).toArray().then((result)=>{
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
            if(bookRoom){
                let room=await db.get().collection(collections.ROOM_COLLECTION).findOne({_id:objectId(bookRoom.rid)})
                response.roomdetails=room
                let hotel=await db.get().collection(collections.HOTELS_COLLECTION).findOne({_id:objectId(bookRoom.hid)})
                response.hoteldetails=hotel
                resolve(response)
            }else{
                reject()
            }
            
            
            
        })
    },
    bookedRooms:(uId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.ORDER_COLLECTION).find({uid:uId}).toArray().then((result)=>{
                resolve(result)
            })
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
    createPaymentOrder:(userId,total)=>{
        return new Promise((resolve,reject)=>{
            totalPaisa=total*100
            var options ={
                amount:totalPaisa,
                currency:"INR",
                receipt:""+userId
            };
            instance.orders.create(options,function(err,order){
                db.get().collection(collections.PAYMENT_COLLECTION).insertOne(order).then(()=>{
                    resolve(order)
                })
            })
        })
    },
    verifyPayment:(paymentDetails)=>{
        return new Promise((resolve,reject)=>{
            const crypto=require('crypto')
            let hmac = crypto.createHmac('sha256','T3nUEiAc1nQ8TC5PYYMTZiyw')
            hmac.update(paymentDetails['payment[razorpay_order_id]']+'|'+paymentDetails['payment[razorpay_payment_id]'])
            hmac=hmac.digest("hex")

            if(hmac===paymentDetails['payment[razorpay_signature]']){
                let orders={}
                let userId=paymentDetails['order[receipt]']
                var today=new Date()
                var dd = String(today.getDate()).padStart(2, '0');
                var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
                var yyyy = today.getFullYear();
                today = dd +'/'+ mm +'/'+ yyyy;
                db.get().collection(collections.BOOKING_COLLECTION).findOne({uid:userId}).then(async(bookdetails)=>{
                    let user=await db.get().collection(collections.USER_COLLECTION).findOne({_id:objectId(bookdetails.uid)})
                    let paisa=await parseInt(paymentDetails['order[amount]'])
                    let total=await paisa/100
                    orders.uid=userId
                    orders.customername=user.name
                    orders.mobile=user.mobile
                    orders.address=user.address
                    orders.checkin=bookdetails.checkin
                    orders.checkout=bookdetails.checkout
                    orders.people=bookdetails.people
                    orders.total=total
                    orders.status="1"
                    orders.date=today
                    let room=await db.get().collection(collections.ROOM_COLLECTION).findOne({_id:objectId(bookdetails.rid)})
                    orders.roomname=room.roomname
                    orders.rid=room._id
                    let hotel=await db.get().collection(collections.HOTELS_COLLECTION).findOne({_id:objectId(bookdetails.hid)})
                    orders.hotelname=hotel.hotelname
                    orders.hoteladdress=hotel.hoteladdress
                    orders.hid=hotel._id    
                    db.get().collection(collections.ORDER_COLLECTION).insertOne(orders).then(()=>{
                        db.get().collection(collections.BOOKING_COLLECTION).removeOne({uid:userId}).then(()=>{
                            resolve()
                        })
                    })
                })
            }else{
                reject()
            }
        })
    },
    ChangeRoomStatus:(userId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.ORDER_COLLECTION).findOne({uid:userId}).then((order)=>{
                db.get().collection(collections.ROOM_COLLECTION).updateOne({_id:objectId(order.rid)},{$set:{
                    status:"1"
                }}).then(()=>{
                    resolve()
                })
               
            })
        })
    },
    //user-profile update
    updateProfile:(userId,userdetails)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.USER_COLLECTION).updateOne({_id:objectId(userId)},{$set:{
                name:userdetails.name,
                username:userdetails.username,
                mobile:userdetails.mobile,
                address:userdetails.address
            }}).then((result)=>{
                db.get().collection(collections.USER_COLLECTION).findOne({_id:objectId(userId)}).then((result)=>{
                    resolve(result)
                })
              
            })
        })
    },

    //cancel booking
    cancelBooking:(bookId)=>{
        return new Promise((resolve,reject)=>{
            
            db.get().collection(collections.ORDER_COLLECTION).findOne({_id:objectId(bookId)}).then((result)=>{
                db.get().collection(collections.ROOM_COLLECTION).updateOne({_id:objectId(result.rid)},{$set:{
                    status:"0"
                }}).then(()=>{
                    db.get().collection(collections.ORDER_COLLECTION).removeOne({_id:objectId(bookId)}).then(()=>{
                        resolve()
                    })
                })
               
            }) 
            
        })
    },

    //refund
    refund:(bookId,refundDetails)=>{
        return new Promise(async(resolve,reject)=>{
            let hotel=await db.get().collection(collections.ORDER_COLLECTION).findOne({_id:objectId(bookId)})
            refundDetails.hid=hotel.hid
            db.get().collection(collections.REFUND_COLLECTION).insertOne(refundDetails).then(()=>{
                resolve()
            })
        })
    },

    //total for refund
    getTotal:(bookId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.ORDER_COLLECTION).findOne({_id:objectId(bookId)}).then((total)=>{
                resolve(total.total)
            })
        })
    }


}