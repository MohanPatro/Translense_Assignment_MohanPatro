const { DataTypes } = require('sequelize');
const sequelize=require('../helpers/connection');

const Vendor=require('./vendorModel');
const Owner=sequelize.define('Owner',{
    ownerName:{
        type:DataTypes.STRING,
    },
    address:{
        type:DataTypes.TEXT
    },
    country:{
        type:DataTypes.STRING
    },
    state:{
        type:DataTypes.STRING
    },
    city:{
        type:DataTypes.STRING
    },
    email:{
        type:DataTypes.STRING
    },
    mobileNumber:{
        type:DataTypes.BIGINT
    },
    profileImageUrl:{
        type:DataTypes.STRING
    },
    isDeleted:{
        type:DataTypes.INTEGER,     // 0 - means nor deleted  1- indicates deteletd
        defaultValue:0
    }

})


Vendor.hasMany(Owner,{foreignKey:'vendor_id'})

Owner.belongsTo(Vendor,{foreignKey:'vendor_id'});

// Owner.sync({alter:true});

module.exports=Owner;
