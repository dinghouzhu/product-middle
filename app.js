const { app, pool,router } =require('./connect');
const user = require('./router/user');
const hotel=require('./router/hotel');
const room=require('./router/room');
const order=require('./router/order');
const log=require('./router/log');
const msg=require('./router/msg');
const jur=require('./router/jurisdiction');
const blbl=require('./router/blbl');
const leavmsg=require('./router/leavmsg');
const link=require('./router/friendlink');
const authorizition=require('./utils/authMiddleware');

// 解析参数
const bodyParser = require('body-parser');
// json请求
app.use(bodyParser.json());
// 表单请求
app.use(bodyParser.urlencoded({extended: true}));




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
            msg:'get success'
        }
    })
});

app.post("/",function(req,res){
    console.log(JSON.stringify(req.body));
    res.json({
        code:200,
        data:{
            msg:'post success'
        }
    });
    res.end();
});

/*app.all('/', (req, res) => {
    pool.getConnection((err, conn) => {
        res.json({ type: 'test'});
        pool.releaseConnection(conn) // 释放连接池，等待别的连接使用
    })
});
*/
//app.use(authorizition);
app.use('/user', user);
app.use('/hotel', hotel);
app.use('/room', room);
app.use('/order', order);
app.use('/log', log);
app.use('/msg', msg);
app.use('/jur', jur);
app.use('/blbl',blbl);
app.use('/leavmsg',leavmsg);
app.use('/link',link);
const listen=9000;
app.listen(listen, () => {
    console.log('服务启动','localhost:'+listen)
});