const {pool, router, resJson} = require('../connect');
const userSQL = require('../dbSql/userSQL');
/*查询所有友链*/
router.get('/alllinks', (req, res) => {
    let _res = res;
    let _data;
    pool.getConnection((err, conn) => {
        conn.query("select * from friendlink where zt = 1 order by id desc", (e, result, filed) => {
            if (e) _data = {
                code: -1,
                msg: e
            };
            if (result && result.length > 0) {
                _data = {
                    msg: '查询成功',
                    data: result
                }
            } else if (result && result.length === 0) {
                _data = {
                    msg: '查询成功',
                    data: []
                }
            } else {
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
/*插入友链*/
router.post('/insertlink', (req, res) => {
    // 获取前台页面传过来的参数
    let user = {
        name: req.body.name,
        des: req.body.des,
        imgurl: req.body.imgurl,
        datenow: req.body.datetime,
        address: req.body.address,
        email: req.body.email,
        habits: req.body.habits,
        type: req.body.type
    };
    let _res = res;
    let _data;
    pool.getConnection((err, conn) => {
        conn.query("insert into friendlink set ?", user, (err, result) => {
            if (result) {
                _data = {
                    code: 200,
                    msg: '请求成功',
                    data: null
                }
            } else {
                _data = {
                    code: -1,
                    msg: '请求失败',
                    data: null
                }
            }
            resJson(_res, _data)
        });
        pool.releaseConnection(conn) // 释放连接池，等待别的连接使用
    })
});
/*删除单条友链*/
router.post('/deletelink', (req, res) => {
    // 获取前台页面传过来的参数
    console.log(req);
    let user = {
        id: req.body.id
    };
    let _res = res;
    // 判断参数是否为空
    if (!user.id) {
        return resJson(_res, {
            code: -1,
            msg: '友链ID不能为空'
        })
    }
    let _data;
    // 整合参数
    // 从连接池获取连接
    pool.getConnection((err, conn) => {
        conn.query('delete from friendlink where id=?', user.id, (err, result) => {
            if (err) _data = {
                code: -1,
                msg: e
            };
            if (result) {
                _data = {
                    code: 0,
                    msg: '删除操作成功',
                    data: null
                }
            } else {
                _data = {
                    code: -1,
                    msg: '删除操作失败',
                    data: null
                }
            }
            resJson(_res, _data)
        });
        pool.releaseConnection(conn) // 释放连接池，等待别的连接使用
    })

});
/*审核通过或者编辑数据*/
router.post('/confirmlink', (req, res) => {
    let user = {
        id: req.body.id,
        des:req.body.des,
        name:req.body.name,
        zt:req.body.zt,
        email:req.body.email,
        datenow:req.body.datenow,
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
        conn.query('select * from  friendlink  where id=?', user.id, (e, r) => {
            if (e) _data = {
                code: -1,
                msg: e
            };
            if (r) {
                //判断用户列表是否为空
                if (r.length) {
                    conn.query('update friendlink set ? where id=?', user.zt?[{zt:user.zt}, user.id]:[{
                        des:user.des,
                        name:user.name,
                        email:user.email,
                        datenow:user.datenow,
                    }, user.id], (err, result) => {
                        if (result) {
                            _data = {
                                code: 0,
                                msg: '状态修改成功',
                                data:null
                            }
                        } else {
                            _data = {
                                code: -1,
                                msg: '状态修改失败',
                                data:null
                            }
                        }
                    })

                } else {
                    _data = {
                        code: -1,
                        msg: '数据不存在或其他错误',
                        data:null
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
/*友链分页接口*/
router.post('/limitlinks', (req, res) => {
    let page = parseInt(req.body.page);
    let pageSize = parseInt(req.body.pageSize);
    if (!page || page === 1) {
        page = 0;
    }
    let offset = (page - 1) * pageSize;
    if (page === 0) {
        offset = 0
    }
    let _res = res;
    let _data;
    //"select count (*) from leavmsg " ,
    pool.getConnection((err, conn) => {
        const P1 = new Promise((resolve, reject) => {
            conn.query("select * from friendlink order by id desc limit " + offset + "," + pageSize, (e, result, filed) => {
                if (e) _data = {
                    code: -1,
                    msg: e
                };
                if (result && result.length > 0) {
                    _data = {
                        code: 0,
                        msg: '查询成功',
                        data: {
                            result: result
                        }
                    };
                    resolve(_data)
                } else if (result && result.length === 0) {
                    _data = {
                        code: 0,
                        msg: '查询成功',
                        data: {
                            result: []
                        }
                    };
                    resolve(_data)
                } else {
                    _data = {
                        code: -1,
                        msg: '查询错误',
                        data: null
                    };
                    reject(_data)
                }
                //   resJson(_res, _data)
            });
        });

        const P2 = new Promise((resolve, reject) => {
            conn.query("SELECT count(*) as kk from friendlink   ", (e, result, filed) => {
                if (e) _data = {
                    code: -1,
                    msg: e
                };
                console.log(result, "数据条数");
                if (result && result.length > 0) {
                    _data = {
                        code: 0,
                        msg: '查询成功',
                        data: {
                            total: result
                        }
                    };
                    resolve(_data)
                } else if (result && result.length === 0) {
                    _data = {
                        code: 0,
                        msg: '查询成功',
                        data: {
                            total: 0
                        }
                    };
                    resolve(_data)
                } else {
                    _data = {
                        code: -1,
                        msg: '查询错误',
                        data: null
                    };
                    reject(_data)
                }
                //   resJson(_res, _data)
            });
        });
        Promise.all([P1, P2]).then(result => {
            _data = {
                code: 0,
                msg: '查询成功',
                data: {
                    result: result[0].data.result,
                    total: result[1].data.total[0].kk
                }
            };
            resJson(_res, _data)
        }, err => {
            _data = {
                code: -1,
                msg: '查询错误',
                data: null
            };
            resJson(_res, _data)
        });

        pool.releaseConnection(conn) // 释放连接池，等待别的连接使用
    })
});

module.exports = router;