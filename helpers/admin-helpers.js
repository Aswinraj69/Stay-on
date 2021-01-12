const collections=require('../config/collections')
const db=require('../config/connection')
const bcrypt=require('bcrypt')
const objectId=require('mongodb').ObjectID
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
            db.get().collection(collections.HOTELS_COLLECTION).find().toArray().then((result)=>{
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
    }

}