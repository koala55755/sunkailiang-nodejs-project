var express = require('express');
var router = express.Router();
var multer = require('multer');
var async = require('async');
var brandModel = require('../model/brandModel');
var MongodbClient = require('mongodb').MongoClient;;
const url = 'mongodb://127.0.0.1:27017';
const upload = multer({
    dest: 'F:/images/'
});
const fs = require('fs');
const path = require('path');



//品牌显示
router.post('/list',function(req,res){
    MongodbClient.connect(url,function(err,client){
        if(err){
            res.render('werror', { code: -999, msg: '网络异常，稍后重试' });
            return;
        }
        var db = client.db('test');
        var limitNum = req.body.pageSize;
        var skipNum = req.body.pageSize * req.body.page - req.body.pageSize;
        async.parallel([
            function (cb) {
                db.collection('brands').find().limit(parseInt(limitNum)).skip(skipNum).toArray(function (err, result) {
                    if (err) {
                        // res.render('werror', { code: -999, msg: '网络异常，稍后重试' });
                        cb({ code: -999, msg: '网络异常,稍后重试' });
                    } else {
                        // res.send(result);
                        cb(null, result);
                    }
                });
            },
            function (cb) {
                db.collection('brands').find().count(function (err, num) {
                    if (err) {
                        cb({ code: -999, msg: '网络异常,稍后重试' });
                    } else {
                        cb(null, num);
                    }
                });
            }
        ],function(err,results){
                if (err) {
                    res.render('werror', err);
                } else {
                    res.send(results);
                }
        });
        client.close();
    })
});
//新增品牌
router.post('/addData', upload.single('phoneImg'), function (req, res) {
    fs.readFile(req.file.path, function (err, data) {
        if (err) {
            res.render('werror', { code: -10, msg: '网络异常,稍后重试' });
        } else {
            var fileName = new Date().getTime() + "_" + req.file.originalname;
            var des_file = path.resolve(__dirname, '../public/brands/', fileName);
            fs.writeFile(des_file, data, function (err) {
                if (err) {
                    res.render('werror', { code: -999, msg: '网络异常,稍后重试' });
                } else {
                    req.body.src = fileName;
                    brandModel.addData(req.body, function (err, data) {
                        if (err) {
                            res.render('werror', { code: -10, msg: '网络异常,稍后重试' });
                        } else {
                            res.redirect('/brandManager');
                        }
                    });
                }
            });
        }
    });
});
//删除商品 
router.get('/dele',function(req,res){
    brandModel.dele(req.query,function(err,data){
        if(err){
            res.render('werror',err)
        }else{
            res.send('<script>alert("删除成功");location.replace("/brandManager")</script>');
        }
    })
});






module.exports = router;