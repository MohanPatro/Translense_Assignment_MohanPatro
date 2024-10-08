const { DataTypes } = require('sequelize');
const sequelize=require('../helpers/connection');

const Vendor=sequelize.define('vendor',{
    vendor_id: {
        type: DataTypes.INTEGER, 
        primaryKey: true, 
        autoIncrement: true 
    },
    business_name:{
        type:DataTypes.STRING
    },
    country:{
        type:DataTypes.STRING,
    } ,
    state:{
        type: DataTypes.STRING,
    },
    city:{
        type: DataTypes.TEXT,
    } ,
    address:{
        type: DataTypes.TEXT,
    },
    email: {
         type: DataTypes.STRING, 
         unique: true 
        },
    mobile_number:{
        type:DataTypes.STRING
    },
    opening_time: {
        type:DataTypes.TIME
    },
    closing_time:{
        type:DataTypes.TIME
    },
    image_url:{
        type:DataTypes.STRING
    },
    isDeleted:{
        type:DataTypes.INTEGER,     // 0 - means nor deleted  1- indicates deteletd
        defaultValue:0
    }

})


// Vendor.sync({alter:true});

module.exports=Vendor;