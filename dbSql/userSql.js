const userSQL = {
    queryAll: 'select * from user',   // 查询所有用户
    queryByName: 'select * from  user where username=?',  // 通过用户名索引查询用户
    queryByNamePassword: 'select * from  user where username=? and password=?',  // 通过用户名和密码索引查询用户
    insert: 'insert into user set ? ',  // 插入新用户
    updateUser: 'update user set ? where username=?',// 更新用户信息
    deleteUser: 'delete from user where username=?' ,// 删除用户

    queryAllHotels:'select * from hotel', // 查询所有酒店信息
    queryByHotelName:'select * from  hotel where hname=?',

};

module.exports = userSQL;