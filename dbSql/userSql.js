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


};

module.exports = userSQL;