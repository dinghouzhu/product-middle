const { pool, router, resJson } = require('../connect');
const userSQL = require('../dbSql/userSQL');
const jwt=require('jsonwebtoken');
router.post("/test",(req,res)=>{
    let user={
        username:req.body.username
    };
    res.json({
        code:200,
        data:{
            msg:'success',
            user:user
        }
    })
});

/* 登陆接口 完成*/
router.post('/login', (req, res) => {
    let user = {
        username: req.body.username,
        password: req.body.password
    };
    let _res = res;
    // 判断参数是否为空
    if (!user.username) {
        return resJson(_res, {
            code: -1,
            msg: '用户名不能为空',
        })
    }
    if (!user.password) {
        return resJson(_res, {
            code: -1,
            msg: '密码不能为空'
        })
    }
    let _data;
    // 从连接池获取连接
    pool.getConnection((err, conn) => {
        conn.query(userSQL.queryByNamePassword, [user.username, user.password], (e, result) => {
            if (e) _data = {
                code: -1,
                msg: e
            };
            //通过用户名和密码索引查询数据，有数据说明用户存在且密码正确，只能返回登录成功，否则返回用户名不存在或登录密码错误
            if (result && result.length) {
                let content ={username:req.body.username}; // 要生成token的主题信息
                let secretOrPrivateKey="dhz"; // 这是加密的key（此处为锁  锁和钥匙同值）
                let token = jwt.sign(content, secretOrPrivateKey, {
                    expiresIn: 60*20*1  // 20分钟过期
                });
                _data = {
                    msg: '登录成功',
                    data: {
                        userInfo: {
                            name:user.username,
                            nickname:result[0].nickname,
                            sex:result[0].sex,
                            des:result[0].des,
                            age:result[0].age,
                            level:result[0].level,
                            token:token
                        }
                    }
                }
            } else {
                _data = {
                    code: -1,
                    msg: '用户名或登录密码错误'
                }
            }
            resJson(_res, _data)
        });
        pool.releaseConnection(conn) // 释放连接池，等待别的连接使用
    })
});
/*修改密码接口 完成*/
router.post('/updatePassword', (req, res) => {
    let user = {
        username: req.body.username,
        oldPassword: req.body.oldPassword,
        newPassword: req.body.newPassword,
        againPassword: req.body.againPassword
    };
    let _res = res;
    // 判断参数是否为空
    if (!user.username) {
        return resJson(_res, {
            code: -1,
            msg: '用户名不能为空'
        })
    }
    if (!user.oldPassword) {
        return resJson(_res, {
            code: -1,
            msg: '旧密码不能为空'
        })
    }
    if (!user.newPassword) {
        return resJson(_res, {
            code: -1,
            msg: '新密码不能为空'
        })
    }
    if (!user.againPassword || user.againPassword !== user.newPassword) {
        return resJson(_res, {
            code: -1,
            msg: '请确认新密码或两次新密码不一致'
        })
    }
    // 从连接池获取连接
    pool.getConnection((err, conn) => {
        // 查询数据库该用户是否已存在
        conn.query(userSQL.queryByNamePassword, [user.username, user.oldPassword], (e, r) => {
            if (e) _data = {
                code: -1,
                msg: e
            };
            if (r) {
                //判断用户列表是否为空
                if (r.length) {
                    //如不为空，则说明存在此用户且密码正确
                    conn.query(userSQL.updateUser, [{
                        password: user.newPassword
                    }, user.username], (err, result) => {
                        console.log(err)
                        if (result) {
                            _data = {
                                msg: '密码修改成功'
                            }
                        } else {
                            _data = {
                                code: -1,
                                msg: '密码修改失败'
                            }
                        }
                    })

                } else {
                    _data = {
                        code: -1,
                        msg: '用户不存在或旧密码输入错误'
                    }
                }
            }
            setTimeout(() => {
                //把操作结果返回给前台页面
                resJson(_res, _data)
            }, 200);
        });
        pool.releaseConnection(conn) // 释放连接池，等待别的连接使用
    })
});
/* 注册用户接口  完成*/
router.post('/register', (req, res) => {
    // 获取前台页面传过来的参数
    let user = {
        username: req.body.username,
        password: req.body.password,
        //以下为非必须数据
        nickname:req.body.nickname,
        des:req.body.des,
        habit:req.body.habit,
        sex:req.body.sex,
        age:req.body.age,
        IP:req.body.IP,
        level:1                   //默认为1,除管理员外
    };
    let _res = res;
    // 判断参数是否为空
    if (!user.username) {
        return resJson(_res, {
            code: -1,
            msg: '用户名不能为空'
        })
    }

    if (!user.password) {
        return resJson(_res, {
            code: -1,
            msg: '密码不能为空'
        })
    }
    let _data;

    pool.getConnection((err, conn) => {
        // 查询数据库该用户是否已存在
        let secretOrPrivateKey="dhz"; // 这是加密的key（此处为钥匙  锁和钥匙同值）
        let token=req.body.token;
        jwt.verify(token,secretOrPrivateKey,function (err,decode) {
            if (err){
                _data = {
                    code: -2,
                    msg:'token验证失效',
                };
                resJson(_res, _data)
            }else {
         conn.query(userSQL.queryByName, user.username, (e, r) => {
            if (e) _data = {
                code: -1,
                msg: e
            };
            if (r) {
                //判断用户列表是否为空
                if (r.length) {
                    //如不为空，则说明存在此用户
                    _data = {
                        code: -1,
                        msg: '用户已存在'
                    }
                } else {
                    //插入用户信息
                    conn.query(userSQL.insert, user, (err, result) => {
                        if (result) {
                            _data = {
                                code:200,
                                msg: '注册成功',
                                data:{
                                    result
                                }
                            }
                        } else {
                            _data = {
                                code: -1,
                                msg: '注册失败',
                                data:{
                                    err:err
                                }
                            }
                        }
                    })
                }
            }
            setTimeout(() => {
                //把操作结果返回给前台页面
                resJson(_res, _data)
            }, 200);
          });
         }
        });
        pool.releaseConnection(conn) // 释放连接池，等待别的连接使用
    })
});
/*删除用户接口 完成*/
router.post('/deleteUser', (req, res) => {
    // 获取前台页面传过来的参数
    let user = {
        username: req.body.username
    };
    let _res = res;
    // 判断参数是否为空
    if (!user.username) {
        return resJson(_res, {
            code: -1,
            msg: '用户名不能为空'
        })
    }
    let _data;
    // 整合参数
    // 从连接池获取连接
    pool.getConnection((err, conn) => {
        // 查询数据库该用户是否已存在
        let secretOrPrivateKey="dhz"; // 这是加密的key（此处为钥匙  锁和钥匙同值）
        let token=req.body.token;
        jwt.verify(token,secretOrPrivateKey,function (err,decode) {
            if (err){
                _data = {
                    code: -2,
                    msg:'token验证失效',
                };
                resJson(_res, _data)
            }else {
                conn.query(userSQL.queryByName, user.username, (e, r) => {
                    if (e) _data = {
                        code: -1,
                        msg: e
                    };
                    if (r) {
                        //判断用户列表是否为空
                        if (r.length) {
                            //如不为空，则说明存在此用户
                            conn.query(userSQL.deleteUser, user.username, (err, result) => {
                                if (err) _data = {
                                    code: -1,
                                    msg: e
                                };
                                if (result) {
                                    _data = {
                                        code: 200,
                                        msg: '删除用户操作成功'
                                    }
                                }
                            })
                        } else {
                            _data = {
                                code: -1,
                                msg: '用户不存在，操作失败'
                            }
                        }
                    }
                    setTimeout(() => {
                        //把操作结果返回给前台页面
                        resJson(_res, _data)
                    }, 200);
                });
            }
            });
        pool.releaseConnection(conn) // 释放连接池，等待别的连接使用
    })

});
/* 查询所有用户 完成*/
router.post('/userlist', (req, res) => {
    let _res = res;
    let _data;
    pool.getConnection((err, conn) => {
        conn.query(userSQL.queryAll, (e, result,filed) => {
            if (e) _data = {
                code: -1,
                msg: e
            };
            if (result && result.length) {
                _data = {
                    msg: '查询成功',
                    data: {
                        res:result
                    }
                }
            }else {
                _data = {
                    code: -1,
                    msg: '查询错误'
                }
            }
            resJson(_res, _data)
        });
        pool.releaseConnection(conn) // 释放连接池，等待别的连接使用
    })
});
//查询指定用户  精确查找
router.post('/searchUser', (req, res) => {
    // 获取前台页面传过来的参数
    let user = {
        username: req.query.username
    };
    let _res = res;
    // 判断参数是否为空
    if (!user.username) {
        return resJson(_res, {
            code: -1,
            msg: '用户名不能为空'
        })
    }
    let _data;
    // 整合参数
    // 从连接池获取连接
    pool.getConnection((err, conn) => {
        // 查询数据库该用户是否已存在
        conn.query(userSQL.queryByName, user.username, (e, r) => {
            if (e) _data = {
                code: -1,
                msg: e
            };
            if (r) {
                //判断用户列表是否为空
                if (r.length) {
                    //如不为空，则说明存在此用户
                    conn.query(userSQL.queryByName, user.username, (err, result) => {
                        if (err) _data = {
                            code: -1,
                            msg: e
                        };
                        if (result) {
                            _data = {
                                msg: '查询成功',
                                data:{
                                    username:user.username,
                                    nickname:result[0].nickname,
                                    sex:result[0].sex,
                                    des:result[0].des,
                                    age:result[0].age,
                                    level:result[0].level,
                                }

                            }
                        }
                    })
                } else {
                    _data = {
                        code: -1,
                        msg: '用户不存在，查询失败'
                    }
                }
            }
            setTimeout(() => {
                //把操作结果返回给前台页面
                resJson(_res, _data)
            }, 200);
        });
        pool.releaseConnection(conn) // 释放连接池，等待别的连接使用
    })
});
/*模糊查询用户接口 完成*/
router.post('/searchUsers', (req, res) => {
    let username = req.query.username;
    let _data;
    let _res = res;
    // 判断参数是否为空
    if (!username) {
        return resJson(_res, {
            code: -1,
            msg: '用户名不能为空'
        })
    }
    pool.query(`select * from user where username like '%${username}%'`, (err,result,fields)=>{

        _data = {
            msg: '查询成功',
            data:{
                result:result,
            }

        };
        setTimeout(() => {
            //把操作结果返回给前台页面
            resJson(_res, _data)
        }, 100);
        pool.releaseConnection(pool) // 释放连接池，等待别的连接使用
    })

});
/*修改用户信息接口 完成*/
router.post('/updateUser', (req, res) => {
    let user = {
        username: req.body.username,
        password: req.body.password,
        nickname: req.body.nickname,
        des: req.body.des,
        habit: req.body.habit,
        sex: req.body.sex,
        age: req.body.age,
    };
    let _res = res;
    // 判断参数是否为空
    if (!user.username) {
        return resJson(_res, {
            code: -1,
            msg: '用户名不能为空'
        })
    }
    if (!user.password) {
        return resJson(_res, {
            code: -1,
            msg: '密码不能为空'
        })
    }

    // 从连接池获取连接
    pool.getConnection((err, conn) => {
        // 查询数据库该用户是否已存在
        let secretOrPrivateKey="dhz"; // 这是加密的key（此处为钥匙  锁和钥匙同值）
        let token=req.body.token;
        jwt.verify(token,secretOrPrivateKey,function (err,decode) {
            if (err){
                _data = {
                    code: -2,
                    msg:'token验证失效',
                };
                resJson(_res, _data)
            }else {
                conn.query(userSQL.queryByName, user.username, (e, r) => {
                    if (e) _data = {
                        code: -1,
                        msg: e
                    };
                    if (r) {
                        //判断用户列表是否为空
                        if (r.length) {
                            //如不为空，则说明存在此用户且密码正确
                            conn.query(userSQL.updateUser, [{
                                username: user.username,
                                password: user.password,
                                nickname: user.nickname,
                                des: user.des,
                                habit: user.habit,
                                sex: user.sex,
                                age: user.age,
                            }, user.username], (err, result) => {
                                console.log(err);
                                if (result) {
                                    _data = {
                                        msg: '信息修改成功',
                                    }
                                } else {
                                    _data = {
                                        code: -1,
                                        msg: '信息修改失败',
                                        err:err,
                                        result:result
                                    }
                                }
                            })

                        } else {
                            _data = {
                                code: -1,
                                msg: '用户不存在或其他错误'
                            }
                        }
                    }
                    setTimeout(() => {
                        //把操作结果返回给前台页面
                        resJson(_res, _data)
                    }, 200);
                });
            }

        });

        pool.releaseConnection(conn) // 释放连接池，等待别的连接使用
    })
});
/* 间隔验证接口 完成*/
router.post('/again', (req, res) => {
    let user = {
        token:req.body.token
    };
    let _res = res;
    // 判断参数是否为空
    if (!user.token) {
        return resJson(_res, {
            code: -2,
            msg: 'token为空'
        })
    }
    // 从连接池获取连接
    pool.getConnection((err, conn) => {
        // 查询数据库该用户是否已存在
        let secretOrPrivateKey="dhz"; // 这是加密的key（此处为钥匙  锁和钥匙同值）
        let token=user.token;
        jwt.verify(token,secretOrPrivateKey,function (err,decode) {
            if (err){
                _data = {
                    code: -2,
                    msg:'token验证失效',
                };
                resJson(_res, _data)
            }else {
                _data = {
                    code: 200,
                    msg:'token验证成功',
                };
                resJson(_res, _data)
            }
        });

        pool.releaseConnection(conn) // 释放连接池，等待别的连接使用
    })
});
module.exports=router;