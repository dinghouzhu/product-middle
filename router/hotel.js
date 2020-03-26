const { pool, router, resJson } = require('../connect');
const userSQL = require('../dbSql/userSQL');

/* 查询所有酒店信息接口*/
router.post('/hotel', (req, res) => {
    let _res = res;
    let _data;
    pool.getConnection((err, conn) => {
    conn.query(userSQL.queryAllHotels, (e, result,filed) => {
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

/*查询指定酒店   目前只支持精确查找*/
router.post('/searchHotel', (req, res) => {
    // 获取前台页面传过来的参数
    let hotel = {
        name: req.body.name
    };
    let _res = res;
    // 判断参数是否为空
    if (!hotel.name) {
        return resJson(_res, {
            code: -1,
            msg: '酒店名不能为空'
        })
    }
    let _data;
    // 整合参数
    // 从连接池获取连接
    pool.getConnection((err, conn) => {
        // 查询数据库该用户是否已存在
        conn.query(userSQL.queryByHotelName, hotel.name, (e, r) => {
            if (e) _data = {
                code: -1,
                msg: e
            };
            if (r) {
                //判断用户列表是否为空
                if (r.length) {
                    //如不为空，则说明存在此用户
                    conn.query(userSQL.queryByHotelName, hotel.name, (err, result) => {
                        if (err) _data = {
                            code: -1,
                            msg: e
                        };
                        if (result) {
                            _data = {
                                msg: '查询成功',
                                data:{
                                    result
                                }

                            }
                        }
                    })
                } else {
                    _data = {
                        code: -1,
                        msg: '不存在，查询失败'
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
