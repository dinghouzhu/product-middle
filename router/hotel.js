const { pool, router, resJson } = require('../connect');
const userSQL = require('../dbSql/userSQL');

/*
* 查询所有酒店信息接口
* */

router.post('/hotel', (req, res) => {
    let _res = res;
    let _data;
    pool.getConnection((err, conn) => {
    conn.query(userSQL.queryAllGoods, (e, result,filed) => {
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
