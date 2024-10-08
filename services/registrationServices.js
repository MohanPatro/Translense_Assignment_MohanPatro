const sequelize = require("../helpers/connection");
const Vendor = require("../models/vendorModel");
const Owner = require("../models/ownerModel");
const baseResponse = require("../helpers/baseResponse");
const Joi = require("joi");


exports.createModelObject=async(Model,data,transaction)=>{
    try{
        // console.log("hello i am in the services")

        if (!data || typeof data !== 'object') {
            throw new Error('Invalid data provided for model creation');
        }
        
        const newData= await Model.create(data,{transaction});

        return newData
    }
    catch(error)
    {
        throw new Error(error);
    }
}

exports.getAllVendorDetailsWithOwners=async()=>{
    try{
        
        const vendorsDetailWithOwners = await Vendor.findAll({
            include: [
              {
                model: Owner,
              },
            ],
          });

        //   console.log("checkinh point ")
        return vendorsDetailWithOwners;
    }
    catch(error)
    {
        
        throw error;
    }
}



exports.getVendrDetailsById=async(vendorId)=>{
    try{

        const vendor = await Vendor.findByPk(vendorId, {
            include: [
              {
                model: Owner,
              },
            ],
          });

          return vendor;
    }
    catch(error)
    {
        // console.log(error)
        throw error;
    }
}

exports.updateModelByFilter=async(Model,data,filter,transaction)=>{
    try{
        const oldData=await Model.findOne({
            where:filter
        })

        if(oldData)
        {
            Object.assign(oldData,data);

            await oldData.save({transaction});

            return oldData;
        }
        else{
            throw new Error("Unable to get entity");
        }
        
    }
    catch(error)
    {
        throw error;
    }
}

exports.checkIfExistsWithFilter=async(Model,filter)=>{
    try{
        const data = await Model.findOne({
              where:filter
            });
        
            if(data && data.length>0)
            {
                return true;
            }
            else{
                return false;
            }
    }
    catch(error)
    {
        throw error;
    }
}