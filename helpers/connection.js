const Sequelize=require('sequelize');


const database=process.env.DATABASE
const user=process.env.USERNAME
const password=process.env.PASSWORD
const host=process.env.HOST

const sequelize=new Sequelize(database,user,password,{
    host:host,
    dialect:'mysql'
})

sequelize.authenticate()
    .then(() => {
        console.log('Connection to the database has been established successfully.');
    })
    .catch((error) => {
        console.error('Unable to connect to the database:', error);
    });


module.exports=sequelize;