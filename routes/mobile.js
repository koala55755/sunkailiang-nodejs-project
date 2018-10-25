var express = require('express');
var router = express.Router();
//引入multer 并设置好默认的一个tmp目录
var multer = require('multer');
const MongodbClient = require('mongodb').MongoClient;
const url = 'mongodb://127.0.0.1:27017';
var mobileModel = require('../model/mobileModel');
var async = require('async');
const upload = multer({
    dest : 'F:/images/'
});
const fs = require('fs');
const path = require('path');
//产品显示
router.post('/list',function(req,res){
    console.log(req.body);
    MongodbClient.connect(url,function(err,client){
        if(err){
            res.render('werror',{code:-999,msg:'网络异常，稍后重试'});
            return;
        }
        var db = client.db('test');
        var limitNum = req.body.pageSize;
        var skipNum = req.body.pageSize * req.body.page - req.body.pageSize;
        async.parallel([
            function(cb){
                db.collection('mobiles').find().limit(parseInt(limitNum)).skip(skipNum).toArray(function (err, result) {
                    if (err) {
                        // res.render('werror', { code: -999, msg: '网络异常，稍后重试' });
                        cb({code:-999,msg:'网络异常,稍后重试'});
                    } else {
                        // res.send(result);
                        cb(null,result);
                    }
                });
            },
            function(cb){
                db.collection('mobiles').find().count(function(err,num){
                    if(err){
                        cb({code:-999,msg:'网络异常,稍后重试'});
                    }else{
                        cb(null,num);
                    }
                });
            }

        ],function(err,rusults){
            if(err){
                res.render('werror', err);
            }else{
                res.send(rusults);
            }
        });
        
        client.close();
    })
});



//增加手机
router.post('/addData', upload.single('phoneImg'),function(req,res){
    fs.readFile(req.file.path,function(err,data){
        if(err){
            res.render('werror', { code: -10, msg: '网络异常,稍后重试' });
        }else{
            var  fileName = new Date().getTime()+"_"+req.file.originalname;
            var des_file = path.resolve(__dirname,'../public/mobiles/',fileName);
            fs.writeFile(des_file,data,function(err){
                if(err){
                    res.render('werror', { code: -999, msg: '网络异常,稍后重试' });
                }else{
                    req.body.src = fileName;
                    mobileModel.addData(req.body,function(err,data){
                        if(err){
                            res.render('werror', { code: -10, msg: '网络异常,稍后重试' });
                        }else{
                            res.redirect('/mobileManager');
                        }
                    });
                }
            });
        }
    });
});







//手机修改
router.post('/upData',function(req,res){
    console.log(req.body);
   mobileModel.upData(req.body,function(err,data){
    if(err){
        res.render('werror',{code:-10,msg:'网络异常,稍后重试'});
    }else{
        res.send('<script>alert("修改成功");location.replace("/mobileManager")</script>');
    }
   });
});
//手机删除
router.get('/dele',function(req,res){
    mobileModel.dele(req.query,function(err){
        if(err){
            res.render('werror', { code: -10, msg: '网络异常,稍后重试' });
        }else{
            res.send('<script>alert("删除成功");location.replace("/mobileManager")</script>');
        }
    })
});

//品牌数据导入
router.post('/brandsData',function(req,res){
    MongodbClient.connect(url,function(err,client){
        if(err){
            res.render('werror',err);
        }else{
            var db = client.db('test');
            db.collection('brands').find().toArray(function(err,data){
                if(err){
                    res.render('werror',err)
                }else{
                    res.send(data);
                }
            })
        }
        client.close();
    })
});

module.exports = router;