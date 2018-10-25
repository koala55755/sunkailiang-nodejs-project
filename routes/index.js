var express = require('express');
var router = express.Router();
var usersModel = require('../model/usersModel.js');
// var mobileModel = require('../model/mobileModel.js');

/* GET home page. */
router.get('/', function(req, res, next) {
 // res.render('index', { title: 'Express' });
  if (req.cookies.username) {
    res.render('index', 
    { 
      username : req.cookies.username,
      nickname:req.cookies.nickname,
      isAdmin: parseInt(req.cookies.isAdmin) ? '管理员' : '普通用户'
   });
  } else {
    res.redirect('/login');
  }
});
//注册页面
router.get('/register',function(req,res){
  res.render('register');
});
router.get('/login', function (req, res) {
  res.render('login');
});


//用户管理页面
router.get('/userManager',function(req,res){
  //同首页,需要判断是否是用户登录,判断用户是否是管理员
  if(req.cookies.username && parseInt(req.cookies.isAdmin)){
    // 查询数据库
    let page = req.query.page || 1;  //页码
    let pageSize = req.query.pageSize || 5;
    usersModel.getUserList({
      page:page,
      pageSize:pageSize
    }, function (err, data) {
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
        });
      }
    });
  }else{
    res.render('login');
  }
});

// 手机管理
router.get('/mobileManager', function (req, res) {
  //同首页,需要判断是否是用户登录,判断用户是否是管理员
  if (req.cookies.username) {
    res.render('mobileManager',{
      username : req.cookies.username,
      nickname : req.cookies.nickname,
      isAdmin : parseInt(req.cookies.isAdmin) ? '管理员' : '普通用户'
    });
  } else {
    res.render('/login');
  }
}); 


//品牌管理
router.get('/brandManager',function(req,res){
  if (req.cookies.username){
    res.render('brandManager',{
      username: req.cookies.username,
      nickname: req.cookies.nickname,
      isAdmin: parseInt(req.cookies.isAdmin) ? '管理员' : '普通用户'
    })
  } else{
    res.render('/login');
  }
})

module.exports = router;