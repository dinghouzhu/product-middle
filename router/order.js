const { pool, router, resJson } = require('../connect');
const userSQL = require('../dbSql/userSQL');

/*插入订单接口*/
router.post('/order', (req, res) => {
    // 获取前台页面传过来的参数
    let user = {
        username: req.query.username,
        room: req.query.room,
        type:req.query.type,
        hotelname:req.query.hotelname,
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

    let _data;

    pool.getConnection((err, conn) => {
        // 查询数据库该订单是否已存在
        conn.query(userSQL.queryOrderByName, user.username, (e, r) => {
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
                    conn.query(userSQL.orderInset, user, (err, result) => {
                        if (result) {
                            _data = {
                                code:200,
                                msg: '添加成功'
                            }
                        } else {
                            _data = {
                                code: -1,
                                msg: '添加失败',
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
        pool.releaseConnection(conn) // 释放连接池，等待别的连接使用
    })
});
module.exports=router;