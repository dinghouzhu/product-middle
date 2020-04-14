const { pool, router, resJson } = require('../connect');
const userSQL = require('../dbSql/userSQL');
const jwt=require('jsonwebtoken');
/*查询所有公告*/
router.post('/msg', (req, res) => {
    let _res = res;
    let _data;
    pool.getConnection((err, conn) => {
        conn.query(userSQL.queryAllMsg, (e, result,filed) => {
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
/*添加公告*/
router.post('/insertmsg', (req, res) => {
    // 获取前台页面传过来的参数
    let user = {
        username: req.body.username,
        level: req.body.level,
        title: req.body.title,
        msg: req.body.msg,
        date: req.body.date,

    };
    let _res = res;
    // 判断参数是否为空
    if (!user.username) {
        return resJson(_res, {
            code: -1,
            msg: '用户名不能为空！'
        })
    }
    if (!user.title) {
        return resJson(_res, {
            code: -1,
            msg: '标题不能为空！'
        })
    }


    let _data;
    pool.getConnection((err, conn) => {
        // 无需查询数据库该用户是否已存在
        //插入用户信息
        let secretOrPrivateKey = "dhz"; // 这是加密的key（此处为钥匙  锁和钥匙同值）
        let token = req.body.token;
        jwt.verify(token, secretOrPrivateKey, function (err, decode) {
            if (err) {
                _data = {
                    code: -2,
                    msg: 'token验证失效',
                };
                resJson(_res, _data)
            } else {
                conn.query(userSQL.msgInset, user, (err, result) => {
                    if (result) {
                        _data = {
                            code: 200,
                            msg: '公告插入成功',
                            data: {
                                result
                            }
                        }
                    } else {
                        _data = {
                            code: -1,
                            msg: '公告插入失败',
                            data: {
                                err: err
                            }
                        }
                    }
                });
                setTimeout(() => {
                    //把操作结果返回给前台页面
                    resJson(_res, _data)
                }, 200);
            }
            pool.releaseConnection(conn) // 释放连接池，等待别的连接使用
        })
    });
});

/*删除单条公告*/
router.post('/deleteMsg', (req, res) => {
    // 获取前台页面传过来的参数
    let user = {
        id: req.body.id
    };
    let _res = res;
    // 判断参数是否为空
    if (!user.id) {
        return resJson(_res, {
            code: -1,
            msg: '公告ID不能为空'
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
                conn.query(userSQL.queryByID, user.id, (e, r) => {
                    if (e) _data = {
                        code: -1,
                        msg: e
                    };
                    if (r) {
                        //判断用户列表是否为空
                        if (r.length) {
                            //如不为空，则说明存在此用户
                            conn.query(userSQL.deleteMsg, user.id, (err, result) => {
                                if (err) _data = {
                                    code: -1,
                                    msg: e
                                };
                                if (result) {
                                    _data = {
                                        code: 200,
                                        msg: '删除公告操作成功'
                                    }
                                }
                            })
                        } else {
                            _data = {
                                code: -1,
                                msg: '公告不存在，操作失败'
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

module.exports=router;