const { pool, router ,resJson} = require('../connect');
const userSQL = require('../dbSql/userSQL');
const jwt=require('jsonwebtoken');

/*插入日志接口 */
router.post('/loginlog', (req, res) => {
    // 获取前台页面传过来的参数
    let user = {
        username: req.body.username,
        nickname:req.body.nickname,
        date:req.body.date,
        IP:req.body.IP,

    };
    let _res = res;
    // 判断参数是否为空
    if (!user.username) {
        return resJson(_res, {
            code: -1,
            msg: '用户名不能为空！'
        })
    }

    if (!user.IP) {
        return resJson(_res, {
            code: -1,
            msg: 'IP不能为空！'
        })
    }
    let _data;
    pool.getConnection((err, conn) => {
        // 无需查询数据库该用户是否已存在
                            //插入用户信息
                            conn.query(userSQL.loginInset, user, (err, result) => {
                                if (result) {
                                    _data = {
                                        code:200,
                                        msg: '日志插入成功',
                                        data:{
                                            result
                                        }
                                    }
                                } else {
                                    _data = {
                                        code: -1,
                                        msg: '日志插入失败',
                                        data:{
                                            err:err
                                        }
                                    }
                                }
                            });
                    setTimeout(() => {
                        //把操作结果返回给前台页面
                        resJson(_res, _data)
                    }, 200);

        pool.releaseConnection(conn) // 释放连接池，等待别的连接使用
    })
});
/*查询所有日志接口*/
router.post('/log', (req, res) => {
    let _res = res;
    let _data;
    pool.getConnection((err, conn) => {
        conn.query(userSQL.queryAllLog, (e, result,filed) => {
            if (e) _data = {
                code: -1,
                msg: e
            };
            if (result && result.length) {
                _data = {
                    code: 0,
                    msg: '查询成功',
                    data: result
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
/*日志分页接口*/
router.post('/limitlog', (req, res) => {
    let page=parseInt(req.body.page);
    if (!page || page ===1) {
        page = 0;
    }
    //为了方便写死页面展示条数
    let pageSize=10;
    let offset=(page-1)*pageSize;
    if (page ===0){
        offset=0
    }
    let _res = res;
    let _data;
    pool.getConnection((err, conn) => {
        conn.query("select * from loginlog order by id desc limit "+ offset+",5", (e, result,filed) => {
            if (e) _data = {
                code: -1,
                msg: e
            };
            if (result && result.length) {
                _data = {
                    code: 0,
                    msg: '查询成功',
                    data: result
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
/*删除日志接口*/
router.post('/deleteLog', (req, res) => {
    // 获取前台页面传过来的参数
    let user = {
        id: req.body.id
    };
    let _res = res;
    // 判断参数是否为空
    if (!user.id) {
        return resJson(_res, {
            code: -1,
            msg: '日志ID不能为空'
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
                conn.query(userSQL.queryLogById, user.id, (e, r) => {
                    if (e) _data = {
                        code: -1,
                        msg: e
                    };
                    if (r) {
                        //判断用户列表是否为空
                        if (r.length) {
                            //如不为空，则说明存在此用户
                            conn.query(userSQL.deleteLog, user.id, (err, result) => {
                                if (err) _data = {
                                    code: -1,
                                    msg: e
                                };
                                if (result) {
                                    _data = {
                                        code: 200,
                                        msg: '删除日志操作成功'
                                    }
                                }
                            })
                        } else {
                            _data = {
                                code: -1,
                                msg: '日志不存在，操作失败'
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