const userSQL = {
    queryAll: 'select * from user',   // 查询所有用户

    queryByName: 'select * from  user where username=?',  // 通过用户名索引查询用户
    queryByNamePassword: 'select * from  user where username=? and password=?',  // 通过用户名和密码索引查询用户
    insert: 'insert into user set ? ',  // 插入新用户
    updateUser: 'update user set ? where username=?',// 更新用户信息
    deleteUser: 'delete from user where username=?' ,// 删除用户

    queryAllHotels:'select * from hotel', // 查询所有酒店信息
    queryByHotelName:'select * from  hotel where hname=?', //查询指定酒店信息
    InsertHotel:'insert into hotel set ? ', //插入新酒店信息

    queryAllRooms:'select * from room', // 查询所有酒店信息

    queryOrderByName:'select * from orders where username=?',  //根据用户名查询订单
    orderInset:'insert into orders set ? ',  // 插入一条订单记录

    loginInset:'insert into loginlog set ?', //插入一条日志记录
    queryAllLog:'select * from loginlog'  ,   //查询所有日志记录

    queryAllMsg:'select * from msg', // 查询所有公告
    msgInset:'insert into msg set ?', //插入一条公告
    queryByID: 'select * from  msg where  id=?',  // 通过用id索引查询公告
    deleteMsg: 'delete from msg where id=?' ,// 删除用户
    deleteMoreMsg: 'delete from msg where id in ?' ,// 删除用户

    queryAllJur:'select * from jurisdiction', // 查询权限表
    queryJurByID: 'select * from  jurisdiction  where id=?',  // 通过用id索引查询公告
    updateJur: 'update jurisdiction set ? where id=?',// 更新项目权限

    queryBlbl:'select * from blbl',//查询哔哩哔哩表

};

module.exports = userSQL;