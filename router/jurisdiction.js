const { pool, router, resJson } = require('../connect');
const userSQL = require('../dbSql/userSQL');

/*此页面接口为权限接口*/
/*权限表信息*/
router.post('/jur', (req, res) => {
    let _res = res;
    let _data;
    pool.getConnection((err, conn) => {
        conn.query(userSQL.queryAllJur, (e, result,filed) => {
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

/*修改权限*/
router.post('/update', (req, res) => {
    let user = {
        id: req.body.id,
        value: req.body.value,
    };
    let _res = res;
    // 判断参数是否为空
    if (!user.id) {
        return resJson(_res, {
            code: -1,
            msg: 'id不能为空'
        })
    }
    // 从连接池获取连接
    pool.getConnection((err, conn) => {
        // 查询数据库该用户是否已存在
                conn.query(userSQL.queryJurByID, user.id, (e, r) => {
                    if (e) _data = {
                        code: -1,
                        msg: e
                    };
                    if (r) {
                        //判断用户列表是否为空
                        if (r.length) {
                            //如不为空，则说明存在此用户且密码正确
                            conn.query(userSQL.updateJur, [{
                                value: user.value,
                            }, user.id], (err, result) => {
                                console.log(err);
                                if (result) {
                                    _data = {
                                        msg: '权限修改成功',
                                    }
                                } else {
                                    _data = {
                                        code: -1,
                                        msg: '权限修改失败',
                                        err:err,
                                        result:result
                                    }
                                }
                            })

                        } else {
                            _data = {
                                code: -1,
                                msg: '项目不存在或其他错误'
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
module.exports=router;