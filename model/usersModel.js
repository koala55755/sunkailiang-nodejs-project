const MongodbClient = require('mongodb').MongoClient;
const url = 'mongodb://127.0.0.1:27017';
const async = require('async');
const usersModel = {
    /**
     *注册操作
     *
     * @param {Object} data 注册信息
     * @param {Function} cb 注册信息
     */
    add(data,cb) {
        MongodbClient.connect(url, function (err, client) {
            if (err){
                console.log('链接数据库失败'+err);
                cb({code:-100,msg:'链接数据库失败'});
                return;
            }
            const db = client.db('test');
            let saveData = {
                username:data.username,
                password:data.password,
                phone:data.phone,
                is_admin:data.isAdmin,
                nickname:data.nickname
            }

            //1.查看数据库中是否存在这个用户名
            //2.对data里面的isAdmin 修改为is_admin
            //3.写一个_id为1,之后每一个_id在前一个基础上自增
             async.series([

                //判断用户名是否注册
                function(callback) {
                    db.collection('users').find({username:saveData.username}).count(function(err,num){
                        if(err){
                            callback({code:-100,msg:'查询是否注册失败'});
                        } else if(num > 0){
                            callback({code:-101,msg:'用户已存在'});
                        } else {
                            console.log('可以注册');
                            callback(null);
                        }
                    })
                },
                //查询最后一条数据的_id
                function(callback) {
                    db.collection('users').find().sort({ _id: -1 }).toArray(function (err, result) {
                       if(err){
                           callback({code:-100,msg:'查询失败'});
                       }else{
                        // console.log(result);
                        // saveData._id = 1;
                        // console.log(result == [] );
                           if (result == '') {
                               saveData._id = 1;
                               console.log(saveData._id);
                           } else {
                               var num = result[0]._id;
                               console.log(result[0]._id);
                               num++;
                               saveData._id = num;
                           }
                           callback(null);
                       }
                    });
                },
                function(callback) {
                    db.collection('users').insertOne(saveData,function(err){
                        if(err){
                            callback({code:-100,msg:'增加数据库失败'});
                        }else{
                            callback(null);
                        }
                    })
                }
            ],function(err,results) {
                if(err){
                    console.log(err);   
                    cb(err);
                }else{
                    cb(null);
                }
                client.close();
            });
            
        });
    },
    /**
     *
     * @param {Object} data
     * @param {Function} cb
     */
    login(data,cb){
        MongodbClient.connect(url, function (err, client){
            if (err) {
                console.log('链接数据库失败' + err);
                cb({ code: -100, msg: '链接数据库失败' });
                return;
            }
            const db = client.db('test');
            db.collection('users').find({username:data.username,password:data.password}).toArray(function(err,data){
                if(err){
                    cb({code:-100,msg:'查询数据库信息失败'});
                }else if(data.length <= 0){
                    cb({code:-111,msg:'用户名或者密码错误'});
                }else{
                    cb(null,{
                        username:data[0].username,
                        isAdmin:data[0].is_admin,
                        nickname:data[0].nickname
                    });
                }
            });
            client.close();
        })
    },
    /**
     *
     * @param {Object} data
     * @param {Function} cb
     */
    getUserList(data,cb){
        MongodbClient.connect(url,function(err,client){
            if(err){
                cb({code:-100,msg:'连接数据库失败'});
            }else{
                var db = client.db('test');
                var limitNum = parseInt(data.pageSize);
                var skipNum = data.page * data.pageSize - data.pageSize;
                async.parallel([
                    function(callback) {
                        //查询所有记录
                        db.collection('users').find().count(function(err,num){
                            if(err){
                                callback({ code: -100, msg: '查询数据库失败' });
                            }else{
                                callback(null,num);
                            }
                        })
                        
                    },
                    function (callback) {
                        db.collection('users').find().limit(limitNum).skip(skipNum).toArray(function (err, data) {
                            if (err) {
                                callback({ code: -100, msg: '查询数据库失败' });
                            } else {
                                callback(null, data);
                            }
                        });
                    }
                ],function(err,results){
                    if(err){
                        cb(err);
                    }else{
                        cb(null,{
                            totalPage : Math.ceil(results[0] / data.pageSize),
                            userList : results[1],
                            page : data.page
                        });
                    }
                })
                
            }
            client.close();
            console.log('获取完成');
        })
    },


    userSeek(data,cb){
        MongodbClient.connect(url, function (err, client) {
            if (err) {
                cb({ code: -100, msg: '连接数据库失败' });
            } else {
                var db = client.db('test');
                var usernameReg = new RegExp(data.username);
                db.collection('users').find({ username: usernameReg}).toArray(function(err,data){
                    if(err){
                        cb({ code: -100, msg: '连接数据库失败'});
                    }else{
                        cb(null,{
                            totalPage : 1,
                            userList : data,
                            page : 1
                        })
                    }
                })
            }
            client.close();
        })
    },

    del(data,cb){
        console.log(data);
        MongodbClient.connect(url,function(err,client){
            if(err){
                cb({code:-100,msg:'查询数据库失败'});
            }else{
                var db = client.db('test');
                db.collection('users').deleteOne({ _id: parseInt(data.id) },function(err){
                    if(err){
                        cb({code:-100,msg:'网络异常,请稍后重试'});
                    }else{
                        cb(null);
                    }
                })
            }
            client.close();
        })
    },

    upData(data,cb){
        // console.log(data);
        var sex = parseInt(data.sex) ? '女' : '男'; 
        MongodbClient.connect(url,function(err,client){
            if(err){
                cb({code:-100,msg:'查询数据库失败'});
            }else{
                var db = client.db('test');
                db.collection('users').updateOne({ '_id': parseInt(data.id) }, { $set: { 'phone': data.phone, 'nickname': data.nickname, 'age': data.age,'sex':sex}});
                cb(null);
            }
            client.close();
        });
    }
}
module.exports = usersModel;