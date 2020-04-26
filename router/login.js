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
/*返回日志接口*/
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

/*日志分页接口*/
router.post('/limit', (req, res) => {
    let _res = res;
    let _data;
    let current_page = 1; //默认为1  第几页;
    let pageSize = req.body.pageSize; //一页条数;
    if (req.body.page) {
        current_page = parseInt(req.body.page);
    }

    let last_page = current_page - 1;
    if (current_page <= 1) {
        last_page = 1;
    }
    let next_page = current_page + 1;
    let str = 'SELECT left(paragraph,50) as paragraph FROM loginlog limit ' + pageSize + ' offset ' + pageSize * (current_page - 1);

    pool.getConnection((err, conn) => {
        conn.query(str, (e, result,filed) => {
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

module.exports=router;