const MongodbClient = require('mongodb').MongoClient;
const url = 'mongodb://127.0.0.1:27017';
const async = require('async');
const brandModel = {
    addData(data, cb) {
        MongodbClient.connect(url, function (err, client) {
            if (err) {
                cb({ code: -100, msg: '查询数据库失败' });
                return;
            }
            console.log(1);
            var db = client.db('test');
            let saveData = {
                src: data.src,
                brand: data.brand,
            }
            console.log(saveData);
            async.series([
                function (callback) {
                    db.collection('brands').find().sort({ _id: -1 }).toArray(function (err, result) {
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
                function (callback) {
                    db.collection('brands').insertOne(saveData, function (err) {
                        if (err) {
                            callback({ code: -100, msg: '查询失败' });
                        } else {
                            callback(null);
                        }
                    })
                }
            ], function (err, results) {
                if (err) {
                    cb(err);
                } else {
                    cb(null);
                }
                client.close();
            });
        });
    },
    dele(data,cb){
        MongodbClient.connect(url,function(err,client){
            if(err){
                cb({code:-100,msg:'访问数据库失败'});
                return;
            }
            var db = client.db('test');
            db.collection('brands').deleteOne({ _id: parseInt(data.id) },function(err){
                if(err){
                    cb({code:-100,msg:'网络异常,稍后重试'});
                }else{
                    cb(null);
                }
            })
        });
    }
}


module.exports = brandModel;