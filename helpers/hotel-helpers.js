const collections = require('../config/collections')
const db = require('../config/connection')
const bcrypt = require('bcrypt')
const objectId = require('mongodb').ObjectID
const Razorpay = require('razorpay')
const SmsNoify = require('../config/smsNotify')
const twilio = require('twilio')
let otpAuth = require('../config/otpauth');
//for sending sms
const client = new twilio(SmsNoify.accountSId, SmsNoify.authToken);

//for sendingotp

var instance = new Razorpay({
    key_id: 'rzp_test_BTPYMRVQAXV143',
    key_secret: 'T3nUEiAc1nQ8TC5PYYMTZiyw',
});

module.exports = {

    hotelAuth: (loginDetails) => {
        return new Promise(async (resolve, reject) => {

            let response = {}
            let hotel = await db.get().collection(collections.HOTELS_COLLECTION).findOne({ username: loginDetails.username, status: "1" })

            if (hotel) {

                bcrypt.compare(loginDetails.password, hotel.password).then((status) => {
                    if (status) {
                        response.hotel = hotel
                        response.status = true
                        resolve(response)
                    } else {
                        resolve({ status: false })
                    }
                })
            } else {
                resolve({ status: false })
            }
        })
    },
    editProfile: (id) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.HOTELS_COLLECTION).findOne({ _id: objectId(id) }).then((hotel) => {
                resolve(hotel)
            })
        })
    },
    updateProfile: (hid, hotel) => {
        return new Promise((resolve, reject) => {

            db.get().collection(collections.HOTELS_COLLECTION).updateOne({ _id: objectId(hid) }, {
                $set: {
                    hotelname: hotel.hotelname,
                    city: hotel.city,
                    username: hotel.username,
                    hoteladdress: hotel.hoteladdress,
                    mobile: hotel.mobile,
                    fblink: hotel.fblink,
                    instalink: hotel.instalink,
                    youtubelink: hotel.youtubelink,
                    about: hotel.about

                }
            }).then((response) => {
                resolve(response)
            })
        })
    },
    getHotel: (id) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.ROOM_COLLECTION).find({ hid: id }).toArray().then((result) => {
                resolve(result)
            })
        })
    },
    addRooms: (rooms) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.ROOM_COLLECTION).insertOne(rooms).then((response) => {
                resolve(response.ops[0])
            })
        })
    },
    getRooms: (hid) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.ROOM_COLLECTION).find({ hid: hid }).toArray().then((result) => {

                resolve(result)
            })
        })
    },
    editRoom: (id) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.ROOM_COLLECTION).findOne({ _id: objectId(id) }).then((result) => {
                resolve(result)
            })
        })
    },
    updateroom: (roomid, room) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.ROOM_COLLECTION).updateOne({ _id: objectId(roomid) }, {
                $set: {
                    roomname: room.roomname,
                    avilableroom: room.availableroom,
                    roomprice: room.roomprice,
                    roomfeatures: room.roomfeatures,
                    category: room.category,
                    roomno: room.roomno
                }
            }).then((response) => {
                resolve(response)
            })
        })
    },
    deleteroom: (id) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.ROOM_COLLECTION).removeOne({ _id: objectId(id) }).then((response) => {
                resolve(response)
            })
        })
    },
    addFoodCategory: (details) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.FOOD_CATEGORY).insertOne(details).then((response) => {
                resolve(response)
            })
        })
    },
    getFoodCategory: (hid) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.FOOD_CATEGORY).find({ hid: hid }).toArray().then((result) => {
                resolve(result)
            })
        })
    },
    getCategory: () => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.FOOD_CATEGORY).find().toArray().then((result) => {
                resolve(result)
            })
        })
    },
    
   
    


    deleteCategory: (id) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.FOOD_CATEGORY).removeOne({ _id: objectId(id) }).then((result) => {
                resolve(result)
            })
        })
    },
    addHotelFood: (foodDetails) => {
        return new Promise((resolve, reject) => {
            foodDetails.price = parseInt(foodDetails.price)
            let food = {
                foodname: foodDetails.foodname,
                restaurant: foodDetails.restaurant,
                price: foodDetails.price,
                category: foodDetails.category,
                hid: objectId(foodDetails.hid)
            }
            db.get().collection(collections.HOTELFOOD_COLLECTION).insertOne(food).then((result) => {
                resolve(result.ops[0]._id)
            })
        })
    },
    getHotelFood: (hid) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.HOTELFOOD_COLLECTION).find({ hid: objectId(hid) }).toArray().then((result) => {
                resolve(result)
            })
        })
    },
    editHotelFood: (id) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.HOTELFOOD_COLLECTION).findOne({ _id: objectId(id) }).then((result) => {
                resolve(result)
            })
        })
    },
    deleteHotelFood: (id) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.HOTELFOOD_COLLECTION).removeOne({ _id: objectId(id) }).then((result) => {
                resolve(result)
            })
        })
    },
    updateHotelFood: (HotelfoodDetails, id) => {
        return new Promise((resolve, reject) => {
            HotelfoodDetails.price = parseInt(HotelfoodDetails.price)
            db.get().collection(collections.HOTELFOOD_COLLECTION).updateOne({ _id: objectId(id) }, {
                $set: {

                    foodname: HotelfoodDetails.foodname,
                    price: HotelfoodDetails.price,
                    restaurant: HotelfoodDetails.restaurant
                }
            }).then((result) => {
                resolve(result)
            })
        })
    },


    //get bookings
    getbookings: (hId) => {
        return new Promise((resolve, reject) => {
            let response = {}
            db.get().collection(collections.ORDER_COLLECTION).find({ hid: objectId(hId), status: "1" }).toArray().then(async (bookings) => {
                response.rooms = bookings
                let foods = await db.get().collection(collections.FOODORDER_COLLECTION).find({ hotelId: objectId(hId), status: "1" }).toArray()
                if (foods) {
                    response.foods = foods
                    resolve(response)
                } else {
                    resolve(response)
                }
            })
        })
    },

    //refund
    refund: (hotelId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.REFUND_COLLECTION).find({ hid: objectId(hotelId), status: "0" }).toArray().then((refunds) => {
                resolve(refunds)
            })
        })
    },

    //refunded
    getRefunded: (hotelId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.REFUND_COLLECTION).find({ hid: objectId(hotelId), status: "1" }).toArray().then((result) => {
                resolve(result)
            })
        })
    },

    //refund details
    getRefundDetails: (refundId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.REFUND_COLLECTION).findOne({ _id: objectId(refundId) }).then((details) => {
                resolve(details)
            })
        })
    },

    //delivered food
    changeFoodStatus: (foodId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.FOODORDER_COLLECTION).updateOne({ _id: objectId(foodId) }, {
                $set: {
                    status: "2"
                }
            }).then(async (result) => {
                let foodDetails = await db.get().collection(collections.FOODORDER_COLLECTION).findOne({ _id: objectId(foodId) })
                let user = await db.get().collection(collections.USER_COLLECTION).findOne({ _id: objectId(foodDetails.userId) })

                client.messages
                    .create({
                        body: 'Your booked food is out of delivery. ',
                        from: '+19182057325',
                        to: "+91" + user.mobile
                    }).then((msg) => {

                        resolve()
                    })

            })
        })
    },

    //get delivered foods
    getDeliveredFoods: (hotelId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.FOODORDER_COLLECTION).find({ hotelId: objectId(hotelId), status: "2" }).toArray().then((response) => {
                resolve(response)
            })
        })
    },

    //do chaeckout 
    doCheckout: (orderId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.ORDER_COLLECTION).updateOne({ _id: objectId(orderId) }, {
                $set: {
                    status: "2"
                }
            }).then(async () => {
                let order = await db.get().collection(collections.ORDER_COLLECTION).findOne({ _id: objectId(orderId) })
                db.get().collection(collections.ROOM_COLLECTION).updateOne({ _id: objectId(order.rid) }, {
                    $set: {
                        status: "0"
                    }
                }).then(() => {
                    db.get().collection(collections.FOODORDER_COLLECTION).remove({ userId: objectId(order.uid) }).then(() => {
                        db.get().collection(collections.CHECKOUT_COLLECTION).insertOne(order).then(() => {
                            db.get().collection(collections.ORDER_COLLECTION).removeOne({_id:objectId(orderId)}).then(()=>{
                                resolve()
                            })
                            
                        })
                    })

                })
            })
        })
    },

    //get the checkouted list
    getCheckoutList: (hotelId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.CHECKOUT_COLLECTION).find({ hid: objectId(hotelId) }).toArray().then((result) => {
                resolve(result)
            })
        })
    },

    //payment for refund
    createRefundOrder: (hId, refundDetails) => {
        return new Promise((resolve, reject) => {
            totalPaisa = refundDetails.total * 100
            var options = {
                amount: totalPaisa,
                currency: "INR",
                receipt: "" + hId
            };
            instance.orders.create(options, function (err, order) {
                db.get().collection(collections.PAYMENT_COLLECTION).insertOne(order).then(() => {
                    resolve(order)
                })
            })
        })
    },

    //verify payment
    verifyRefundPayment: (paymentDetails) => {
        return new Promise((resolve, reject) => {
            const crypto = require('crypto')
            let hmac = crypto.createHmac('sha256', 'T3nUEiAc1nQ8TC5PYYMTZiyw')
            hmac.update(paymentDetails['payment[razorpay_order_id]'] + '|' + paymentDetails['payment[razorpay_payment_id]'])
            hmac = hmac.digest("hex")

            if (hmac === paymentDetails['payment[razorpay_signature]']) {

                resolve()
            } else {
                reject()
            }
        })
    },

    //chnage refund status
    ChangeRefundStatus: (refundId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.REFUND_COLLECTION).updateOne({ _id: objectId(refundId) }, {
                $set: {
                    status: "1"
                }
            }).then(async () => {
                let refund = await db.get().collection(collections.REFUND_COLLECTION).findOne({ _id: objectId(refundId) })
                let user = await db.get().collection(collections.USER_COLLECTION).findOne({ _id: objectId(refund.userId) })
               
                client.messages
                    .create({
                        body: 'Amount have been refunded. -Stay On',
                        from: '+19182057325',
                        to: "+91" + user.mobile
                    }).then((msg) => {
                        resolve()
                    })
               
            })
        })
    },

    //change password
    changePassword: (details) => {
        return new Promise(async (resolve, reject) => {

            details.password2 = await bcrypt.hash(details.password2, 10)
            let password2 = details.password2
            let hotel = await db.get().collection(collections.HOTELS_COLLECTION).findOne({ _id: objectId(details.hid) })
            if (hotel) {
                bcrypt.compare(details.password1, hotel.password).then((status) => {
                    if (status) {
                        db.get().collection(collections.HOTELS_COLLECTION).updateOne({ _id: objectId(details.hid) }, {
                            $set: {
                                password: password2
                            }
                        }).then(() => {
                            resolve({ status: true })
                        })
                    } else {
                        resolve({ status: false })
                    }
                })
            } else {
                resolve({ status: false })
            }



        })
    },

    //do signup
    signUp: (details) => {
        return new Promise(async (resolve, reject) => {
            details.password = await bcrypt.hash(details.password, 10)
            let response = {}
            db.get().collection(collections.HOTELS_COLLECTION).findOne({ username: details.username }).then((hotel) => {
                if (hotel) {
                    resolve({ status: false })
                } else {
                    db.get().collection(collections.HOTELS_COLLECTION).findOne({ mobile: details.mobile }).then((result) => {
                        if (result) {
                            resolve({ status: false })
                        } else {
                            db.get().collection(collections.HOTELS_COLLECTION).insertOne(details).then(() => {
                                db.get().collection(collections.HOTELS_COLLECTION).findOne({ username: details.username }).then(async (hotelresult) => {
                                    let admin = await db.get().collection(collections.ADMIN_COLLECTION).findOne()

                                    client.messages
                                        .create({
                                            body: 'A hotel have been requested.',
                                            from: '+19182057325',
                                            to: "+91" + admin.mobile
                                        }).then((msg) => {
                                            response.hotel = hotelresult
                                            response.status = true
                                            resolve(response)
                                        })

                                })

                            })
                        }
                    })
                }
            })
        })
    },

    //get reviews
    getReviews: (hotelId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.RATING_COLLECTION).find({ hotelId: hotelId }).toArray().then((result) => {
                resolve(result)
            })
        })
    },

    //get total rating
    getTotalRating: (hotelId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.RATING_COLLECTION).find({ hotelId: hotelId }).toArray().then((result) => {
                let n = []
                result.forEach(element => {
                    n.push(parseInt(element.rate))
                });
                let total = n.reduce((a, b) => a + b, 0)
                let rate = total / 10
                resolve(rate)
            })
        })
    },

    getNoOfReview: (hotelId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.RATING_COLLECTION).find({ hotelId: hotelId }).toArray().then((result) => {
                let n = result.length
                resolve(n)
            })
        })
    },

    sentOtp:(mobile)=>{
        return new Promise(async(resolve,reject)=>{
            let response={}
            let hotel = await db.get().collection(collections.HOTELS_COLLECTION).findOne({mobile:mobile.mobile})
            
            if(hotel){
                client
                    .verify
                    .services(otpAuth.serviceID)
                    .verifications
                    .create({
                        to:"+91" + mobile.mobile,
                        channel:"sms"
                    }).then((data)=>{
                        response.data=data
                        response.hotel=hotel
                        resolve(response)
                    })
            }else{
                let data = {status:false}
                response.data=data
                resolve(response)
            }
        })
    },

     //verify the otp for forgot password
     verifyOtp:(mobile,otpDetails)=>{
        return new Promise((resolve,reject)=>{
          
            client
                .verify
                .services(otpAuth.serviceID)
                .verificationChecks
                .create({
                    to:mobile,
                    code:otpDetails.otp
                }).then((data)=>{
                    
                    resolve(data)
                    
                })
        })
    },

    //change password by forgot password
    changeForgotPassword:(details)=>{
        return new Promise(async(resolve,reject)=>{
            
            let hotel = await db.get().collection(collections.HOTELS_COLLECTION).findOne({_id:objectId(details.hotelId)})
            if(hotel){
                details.password = await bcrypt.hash(details.password,10)
                db.get().collection(collections.HOTELS_COLLECTION).updateOne({_id:objectId(details.hotelId)},{$set:{
                    password:details.password
                }}).then((response)=>{
                    resolve({status:true})
                })
            }else{
                resolve({status:false})
            }
        })
    },

    //get all bookings
    getTotalBookings:(hotelId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.CHECKOUT_COLLECTION).find({hid:objectId(hotelId)}).toArray().then((result)=>{
                
                let n = result.length
                resolve(n)
            })
        })
    },

    //get total number of rooms
    getTotalRooms:(hotelId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.ROOM_COLLECTION).find({hid:hotelId}).toArray().then((result)=>{
                let n = result.length
                resolve(n)
            })
        })
    },

    //get active bookings
    getActiveBookings:(hotelId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.ORDER_COLLECTION).find({hid:objectId(hotelId),status:"1"}).toArray().then((result)=>{
                let n = result.length
                resolve(n)
            })
        })
    },

    //get the number of available rooms
    getAvailableRooms:(hotelId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.ROOM_COLLECTION).find({hid:hotelId,status:"0"}).toArray().then((result)=>{
                let n = result.length
                resolve(n)
            })
        })
    },

    //get limited bookings for displaying in home page
    getAllBookings:(hotelId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.ORDER_COLLECTION).find({ hid: objectId(hotelId), status: "1" }).limit(5).toArray().then((result)=>{
                resolve(result)
            })
        })
    }

}