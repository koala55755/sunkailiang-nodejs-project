var express = require('express');
var router = express.Router();
var usersModel = require('../model/usersModel');
/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
  // if(req.cookies.username){
  //   res.render('index',{
  //     username:req.cookies.username,
  //     nickname:req.cookies.nickname,
  //     isAdmin:req.cookies.isAdmin ? '(管理员)' : ''
  //   });
  // }else{
  //   res.redirect('/login');
  // }

});

// 注册验证
router.post('/register',function(req,res){
  //res.render('获取post数据');
  console.log(req.body);
  //用户名为5到12位字符
  if(!/^\w{5,12}$/.test(req.body.username)){
    res.render('werror',{code:-100,msg:'错误:请输入5到12位字符用户'});
    return;
  }
  usersModel.add(req.body,function(err){
    if(err) {
      res.render('werror',err);
    }else{
      res.redirect('/login');
    }
  });
 //res.send();
});

//登录
router.post('/login',function(req,res){
  // console.log(req.body);
  usersModel.login(req.body,function(err,data){
    if(err){
      res.render('werror',err)
    }else{
      res.cookie('username', data.username , {
        maxAge : 1000 * 60 * 1000000
      });
      res.cookie('nickname', data.nickname , {
        maxAge: 1000 * 60 * 1000000
      });
      res.cookie('isAdmin', data.isAdmin , {
        maxAge: 1000 * 60 * 1000000
      });
      res.redirect('/');
    }
  });
});


//退出登录
router.get('/logout',function(req,res){
  //清除cookies
  // if(!req.cookies.username){
  //   res.redirect('/login');
  // }
  res.clearCookie('username');
  res.clearCookie('nickname');
  res.clearCookie('isAdmin');
  // res.redirect('/login');
  res.send('<script>location.replace("/")</script>');
});

//搜索功能
router.get('/userSeek',function(req,res){
  if (req.query.username == ''){
    res.redirect('/userManager');
  }else{
    usersModel.userSeek(req.query, function (err, data) {
      if (err) {
        res.render('werror', err);
      } else {
        res.render('userManager', {
          username: req.cookies.username,
          nickname: req.cookies.nickname,
          isAdmin: parseInt(req.cookies.isAdmin) ? '管理员' : '普通用户',
          userList: data.userList,
          totalPage: data.totalPage,
          page: data.page,
          // exit : 1
        });
      }
    });
  }
  
});


//删除功能
router.get('/del',function(req,res){
  usersModel.del(req.query,function(err){
    if(err){
      res.render('werror',err)
    }else{
      // res.render('userManager');
      res.send('<script>alert("删除成功");location.replace("/userManager")</script>');
    }
  });
});


//修改功能
router.post('/upData',function(req,res){
  usersModel.upData(req.body,function(err,data){
    if(err){
      res.render('werror',err)
    }else{
      res.send('<script>alert("修改成功");location.replace("/userManager")</script>');
    }
  });
});

module.exports = router;
