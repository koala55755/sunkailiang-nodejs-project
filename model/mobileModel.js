const MongodbClient = require('mongodb').MongoClient;
const url = 'mongodb://127.0.0.1:27017';
const async = require('async');
const mobileModel = {
    //新增加手机
    addData(data,cb){
        MongodbClient.connect(url,function(err,client){
            if(err){
                cb({code:-100,msg:'查询数据库失败'});   
                return;
            }
            console.log(1);
            var db = client.db('test');
            let saveData = {
                src : data.src,
                phoneName: data.phoneName,
                brand: data.brand,
                QA_price: data.QA_price,
                Sec_price: data.Sec_price
            }
            console.log(saveData);
            async.series([
                function (callback){
                    db.collection('mobiles').find().sort({ _id: -1 }).toArray(function (err, result) {
                        if (err) {
                            callback({ code: -100, msg: '查询数据库失败' });
                        } else if (result == '') {
                            saveData._id = 1;
                        } else {
                            var num = result[0]._id;
                            num++;
                            saveData._id = num;
                        }
                        callback(null);
                    })
                },
                function(callback){
                    db.collection('mobiles').insertOne(saveData,function(err){
                        if(err){
                            callback({code:-100,msg:'查询失败'});
                        }else{
                            callback(null);
                        }
                    })
                }
            ],function(err,results){
                if(err){
                    cb(err);
                }else{
                    cb(null);
                }
                client.close();
            });
        });
    },


    // 修改操作
    upData(data,cb){
        console.log(data);
       MongodbClient.connect(url,function(err,client){
            if(err){
                cb({code:-100,msg:'查询失败'});
            }else{
                var db = client.db('test');
                db.collection('mobiles').updateOne({_id : parseInt(data.id)},{$set:{phoneName:data.phoneName,brand:data.brand,QA_price:data.QA_price,Sec_price:data.Sec_price}});
                cb(null);
            }
            client.close();
       })
    },

    //删除
    dele(data,cb){
        MongodbClient.connect(url,function(err,client){
            if(err){
                cb({ code: -100, msg: '查询失败' });
            }else{
                var db = client.db('test');
                db.collection('mobiles').deleteOne({ _id: parseInt(data.id)},function(err){
                    if(err){
                        cb({ code: -100, msg: '查询失败' });
                    }else{
                        cb(null);
                    }
                });
            }
            client.close();
        });
    }

}




module.exports = mobileModel;