const {pool, router, resJson} = require('../connect');
const userSQL = require('../dbSql/userSQL');
/*查询所有留言*/
router.get('/leavmsg', (req, res) => {
    let _res = res;
    let _data;
    pool.getConnection((err, conn) => {
        conn.query("select id,des,author,email,datetime from leavmsg where zt = 1", (e, result, filed) => {
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
/*插入留言*/
router.post('/insertleavmsg', (req, res) => {
    // 获取前台页面传过来的参数
    let user = {
        author: req.body.author,
        name: req.body.strname,
        des: req.body.des,
        email: req.body.email,
        datetime: req.body.datetime,
    };
    let _res = res;
    let _data;
    pool.getConnection((err, conn) => {
        conn.query("insert into leavmsg set ?", user, (err, result) => {
            if (result) {
                _data = {
                    code: 200,
                    msg: '留言插入成功',
                    data: null
                }
            } else {
                _data = {
                    code: -1,
                    msg: '留言插入失败',
                    data: null
                }
            }
            resJson(_res, _data)
        });
        pool.releaseConnection(conn) // 释放连接池，等待别的连接使用
    })
});
/*删除单条留言*/
router.post('/deleteleavmsg', (req, res) => {
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
            msg: '留言ID不能为空'
        })
    }
    let _data;
    // 整合参数
    // 从连接池获取连接
    pool.getConnection((err, conn) => {
        conn.query('delete from leavmsg where id=?', user.id, (err, result) => {
            if (err) _data = {
                code: -1,
                msg: e
            };
            if (result) {
                _data = {
                    code: 0,
                    msg: '删除公告操作成功',
                    data: null
                }
            } else {
                _data = {
                    code: -1,
                    msg: '删除公告操作失败',
                    data: null
                }
            }
            resJson(_res, _data)
        });
        pool.releaseConnection(conn) // 释放连接池，等待别的连接使用
    })

});
/*审核通过*/
router.post('/confirm', (req, res) => {
    let user = {
        id: req.body.id,
        //value: req.body.value,
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
        conn.query('select * from  leavmsg  where id=?', user.id, (e, r) => {
            if (e) _data = {
                code: -1,
                msg: e
            };
            if (r) {
                //判断用户列表是否为空
                if (r.length) {
                    //如不为空，则说明存在此用户且密码正确
                    conn.query('update leavmsg set ? where id=?', [{
                        zt: 1,
                    }, user.id], (err, result) => {
                        console.log(err);
                        if (result) {
                            _data = {
                                code: 0,
                                msg: '状态修改成功',
                            }
                        } else {
                            _data = {
                                code: -1,
                                msg: '状态修改失败',
                            }
                        }
                    })

                } else {
                    _data = {
                        code: -1,
                        msg: '留言不存在或其他错误'
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
/*留言分页接口*/
router.post('/limitleavmsg', (req, res) => {
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
            conn.query("select * from leavmsg order by id desc limit " + offset + "," + pageSize, (e, result, filed) => {
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
            conn.query("SELECT count(*) as kk from leavmsg   ", (e, result, filed) => {
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
/*查询所有文章*/
router.get('/article', (req, res) => {
    let _res = res;
    let _data;
    pool.getConnection((err, conn) => {
        //where zt = 1
        conn.query("select id,title,author,content,datetime,tag,watch from article ", (e, result, filed) => {
            if (e) _data = {
                code: -1,
                msg: e
            };
            if (result && result.length > 0) {
                _data = {
                    msg: '查询成功',
                    data: result
                }
            } else if (result && result.length == 0) {
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
module.exports = router;