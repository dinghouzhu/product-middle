const mysql = require('mysql');
const express = require('express');
const app = express();                 //搭建web服务器
const router = express.Router();//对应框架中的路由
app.use(express.static(__dirname + '/static')); //分发静态文件

/**
 * 配置mysql
 */
const option = {
    host: 'localhost',
    user: 'root',
    password: '123456',
    port: '3306',
    timezone: "08:00", //加八小时
    database: 'aytravel',
    connectTimeout: 5000, //连接超时
    multipleStatements: false //是否允许一个query中包含多条sql语句
};
let pool;
repool();
function Res ({ code = 200, msg = '', data = {} }) {
    this.code = code;
    this.msg = msg;
    this.data = data;
}
function resJson (_res, result) {
    return _res.json(new Res(result))
}
// 断线重连机制
function repool() {
    // 创建连接池
    pool = mysql.createPool({
        ...option,
        waitForConnections: true, //当无连接池可用时，等待（true）还是抛错（false）
        connectionLimit: 100, //连接数限制
        queueLimit: 0 //最大连接等待数（0为不限制）
    });
    pool.on('error', err => {
        err.code === 'PROTOCOL_CONNECTION_LOST' && setTimeout(repool, 2000)
    });
    app.all('*', (_,__, next) => {
        pool.getConnection( err => {
            err && setTimeout(repool, 2000) || next()
        })
    })
}
module.exports = { app, pool, router, resJson };