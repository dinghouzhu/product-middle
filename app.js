const { app, pool } =require('./connect');
const user = require('./router/user');
const hotel=require('./router/hotel');
const room=require('./router/room');
const order=require('./router/order');

// const cors = require('cors');
// app.use(cors); // 解决跨域
app.all('*', (req, res, next) => {
    //处理全局拦截
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "authorization,Content-Type");
    res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By", ' 3.2.1');
    res.header("Content-Type", "application/json;charset=utf-8");
    next()
});

app.get('/', (req,res) => {  //首页路由
    //res.sendFile(__dirname+'/'+'index.html')
    res.json({
        code:200,
        data:{
            msg:'success'
        }
    })
});



/*app.all('/', (req, res) => {
    pool.getConnection((err, conn) => {
        res.json({ type: 'test'});
        pool.releaseConnection(conn) // 释放连接池，等待别的连接使用
    })
});
*/
app.use('/user', user);
app.use('/hotel', hotel);
app.use('/room', room);
app.use('/order', order);
app.listen(8080, () => {
    console.log('服务启动','localhost:8080')
});