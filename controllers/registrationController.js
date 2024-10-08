const sequelize = require("../helpers/connection");
const Vendor = require("../models/vendorModel");
const Owner = require("../models/ownerModel");
const baseResponse = require("../helpers/baseResponse");
const registrationServices=require('../services/registrationServices');
const Joi = require("joi");
const { Op } = require("sequelize");

var otpStore = {};
let generatedOTP = null;
let otpExpires = null;
const OTP_EXPIRATION_TIME = 5 * 60 * 1000;




exports.addVendorAndOwnerDetails = async (req, res) => {
    let transaction;
    let isTranSactionCommited=1;
  try {
    const vendorOwnerSchema = Joi.object({
      vendor_information: Joi.object({
        business_name: Joi.string().required(),
        country: Joi.string().required(),
        state: Joi.string().required(),
        city: Joi.string().required(),
        address: Joi.string().required(),
        email: Joi.string().email().required(),
        mobile_number: Joi.string()
          .pattern(/^[0-9]{10}$/)
          .required(),
        opening_time: Joi.string().required(),
        closing_time: Joi.string().required(),
      })
        .required()
        .unknown(true),

      owner_information: Joi.object({
        ownerName: Joi.string().required(),

        address: Joi.string().required(),
        country: Joi.string().required(),
        state: Joi.string().required(),
        city: Joi.string().required(),
        email: Joi.string().email().required(),
        mobileNumber: Joi.string()
          .pattern(/^[0-9]{10}$/)
          .required(),
      })
      .required()
        .unknown(true),
    }).unknown(true);

    let message = "";
    let status;
    const { error } = vendorOwnerSchema.validate(req.body);

    if (error) {
      message = "Validation error";
      status = 400;
      await baseResponse(res, status, message, null, error);
    }

    const { vendor_information, owner_information } = req.body;

    let filter={
        email: vendor_information?.email,
      }


    const checkVendorExists=await registrationServices.checkIfExistsWithFilter(Vendor,filter);

    if (checkVendorExists) {
      status = 401;
      message = "Vendor Already exists with given email";
      // return res.status(401).json({success:false, message: 'Vendor Already exists with given email'});
      await baseResponse(res, status, message);
    }

    filter= {
        email: owner_information.email,
      }

   const checkOwnerExists=await registrationServices.checkIfExistsWithFilter(Owner,filter);

    if (checkOwnerExists) {
      status = 401;
      message = "Owner Already exists with given email";
      // return res.status(401).json({success:false, message: 'Owner Already exists with given email'});
      await baseResponse(res, status, message);
    }
    transaction = await sequelize.transaction();
    isTranSactionCommited=0;

    
    const vendorData={
        business_name: vendor_information.business_name,
        country: vendor_information.country,
        state: vendor_information.state,
        city: vendor_information.city,
        address: vendor_information.address,
        email: vendor_information.email,
        mobile_number: vendor_information.mobile_number,
        opening_time: vendor_information.opening_time,
        closing_time: vendor_information.closing_time,
        image_url:  req.files && req.files["vendor_image"]
          ? `uploads/${req.files["vendor_image"][0]?.filename}`
          : null,
      }
    const savedVendorData = await registrationServices.createModelObject(Vendor,vendorData,transaction)

    //   console.log(savedVendorData)

    const ownerData= {
        vendor_id: savedVendorData.vendor_id,
        ownerName: owner_information.ownerName,
        address: owner_information.address,
        country: owner_information.country,
        state: owner_information.state,
        city: owner_information.city,
        email: owner_information.email,
        mobileNumber: owner_information.mobileNumber,
        profileImageUrl:  req.files && req.files["owner_image"]
          ? `uploads/${req.files["owner_image"][0]?.filename}`
          : null,
      }

    const savedOwner=await registrationServices.createModelObject(Owner,ownerData,transaction);
    // console.log(savedOwner)

    await transaction.commit();
    isTranSactionCommited=1;

    message = "Vendor and Owner details added successfully!";
    status = 201;
    //   res.status(201).json({ message: 'Vendor and Owner details added successfully!' });
    await baseResponse(res, status, message, {});
  } catch (error) {
    console.log(error);
    if(isTranSactionCommited!=1)
    {
        await transaction.rollback();

    }
    await baseResponse(res, 500, "Internal Server Error", {}, error);
  }
};




exports.getAllVendorDetails = async (req, res) => {
  try {
    const vendorsDetailWithOwners=await registrationServices.getAllVendorDetailsWithOwners();

    // console.log(vendorsDetailWithOwners)

    if (!vendorsDetailWithOwners || vendorsDetailWithOwners.length === 0) {
        return await baseResponse(res, 404, "No vendors found", null);
    }
    

    await baseResponse(res, 200, "Vendors retrieved successfully", vendorsDetailWithOwners);
  } catch (error) {
    await baseResponse(
      res,
      500,
      "Internal Server Error",
      null,
      error.message
    );
  }
};




exports.getendorDetailsById = async (req, res) => {
  const vendorId = req.params.id;
  let message = "";
  let status;

  try {
    
    const vendor=await registrationServices.getVendrDetailsById(vendorId)

    // console.log(venor);

    if (!vendor) {
      message = "Vendor not found";
      status = 404;
      await baseResponse(res, status, message);
    }


    message = "Vendor retrieved successfully";
    status = 200;

    await baseResponse(res, status, message, vendor);

  } catch (error) {
    await baseResponse(
      res,
      500,
      "Internal Server Error",
      null,
      error.message
    );
  }
};




exports.sendOtp = async (req, res) => {
  try {
    const { mobileNumber } = req.body;

    generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();
    otpExpires = Date.now() + OTP_EXPIRATION_TIME;

    otpStore[mobileNumber] = { generatedOTP, otpExpires };
    console.log(otpStore[mobileNumber]);

    let message = "OTP sent successfully!";
    let status = 200;

    await baseResponse(res, status, message, generatedOTP);
  } catch (error) {
    await baseResponse(res, 500, "Internal server error", {}, error);
  }
};




exports.verifyOtp = async (req, res) => {
  try {
    const { mobileNumber, otp } = req.body;

    // console.log(otpStore);
    let message = "";
    let status = 200;

    const userotpData = otpStore[mobileNumber];

    if (!userotpData) {
      return res
        .status(400)
        .json({ message: "No OTP was sent to this number." });
    }
    const { generatedOTP, otpExpires } = userotpData;

    if (Date.now() > otpExpires) {
      // return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
      status = 400;
      message = "OTP has expired. Please request a new one.";
      await baseResponse(res, status, message);
    }

    if (generatedOTP == otp) {
      status = 200;
      message = "OTP verified successfully!";
      // res.json({ message: 'OTP verified successfully!' });
      await baseResponse(res, status, message);
    } else {
      status = 400;
      message = "Invalid OTP. Please try again.";
      // res.status(400).json({ message: 'Invalid OTP. Please try again.' });
      await baseResponse(res, status, message);
    }
  } catch (error) {
    await baseResponse(res, 500, "Internal server error");
  }
};




exports.updateVendorData=async(req,res)=>{
    let transaction;
    let isTranSactionCommited=1;
    try{
        const vendor_id=req.params.id;
        const vendorOwnerSchema = Joi.object({
            vendor_information: Joi.object({
              business_name: Joi.string().optional(),
              country: Joi.string().optional(),
              state: Joi.string().optional(),
              city: Joi.string().optional(),
              address: Joi.string().optional(),
              email: Joi.string().email().optional(),
              mobile_number: Joi.string()
                .pattern(/^[0-9]{10}$/)
                .optional(), 
              opening_time: Joi.string().optional(),
              closing_time: Joi.string().optional(),
            })
              .required()
              .unknown(true),
      
            owner_information: Joi.object({
              ownerName: Joi.string().optional(),
              address: Joi.string().optional(),
              country: Joi.string().optional(),
              state: Joi.string().optional(),
              city: Joi.string().optional(),
              email: Joi.string().email().optional(),
              mobileNumber: Joi.string()
                .pattern(/^[0-9]{10}$/)
                .optional(),
            })
              .required()
              .unknown(true),
          }).unknown(true);
      
          let message = "";
          let status;
          const { error } = vendorOwnerSchema.validate(req.body);
      
          if (error) {
            message = "Validation error";
            status = 400;
            await baseResponse(res, status, message, null, error);
          }
      
          const { vendor_information, owner_information } = req.body;

          let checkFilter={};

          if(vendor_information?.email)
          {

            checkFilter= {
                email: vendor_information.email,
                vendor_id:{
                  [Op.ne]:vendor_id
                 }
              }

             const checkVendorExists=await registrationServices.checkIfExistsWithFilter(Vendor,checkFilter);   

          
              if (checkVendorExists) {
                status = 401;
                message = "Vendor Already exists with given email";
                // return res.status(401).json({success:false, message: 'Vendor Already exists with given email'});
                await baseResponse(res, status, message);
              }
          }

         
      if(owner_information?.email)
      {

            checkFilter= {
                email: owner_information.email,
                vendor_id:{[Op.ne]:vendor_id}
            }

          const checkOwnerExists=await registrationServices.checkIfExistsWithFilter(Owner,checkFilter);

          if (checkOwnerExists) {
            status = 401;
            message = "Owner Already exists with given email";
            // return res.status(401).json({success:false, message: 'Owner Already exists with given email'});
            await baseResponse(res, status, message);
          }
      }


      let filter={
        vendor_id:vendor_id
      }


      transaction=await sequelize.transaction();
      isTranSactionCommited=0;

      let newOwnerData={};
      let newvendorData={};

      if(vendor_information && vendor_information.length!=0)
      {
         newvendorData=await  registrationServices.updateModelByFilter(Vendor,vendor_information,filter,transaction);
      }

      if(owner_information && owner_information.length!=0)
      {
        newOwnerData= await  registrationServices.updateModelByFilter(Owner,owner_information,filter,transaction);
      }

      await transaction.commit();
      isTranSactionCommited=1;

      return await baseResponse(res,201,"successfulyy updated the vendor data",{newvendorData,newOwnerData});
      
    }
    catch(error)
    {
        console.log(error);
        if(isTranSactionCommited!=1)
        {
            await transaction.rollback();

        }
        await baseResponse(res, 500, "Internal Server Error", {}, error);
    }
}







// exports.updateVendorDetails=async(req,res)=>{
//     let transaction;
//     let isTranSactionCommited=1;
//     try{
//         const vendorSchema = Joi.object({
         
//               business_name: Joi.string().optional(),
//               country: Joi.string().optional(), 
//               state: Joi.string().optional(),
//               city: Joi.string().optional(), 
//               address: Joi.string().optional(),
//               email: Joi.string().email().optional(),
//               mobile_number: Joi.string()
//                 .pattern(/^[0-9]{10}$/)
//                 .optional(),
//               opening_time: Joi.string().optional(),
//               closing_time: Joi.string().optional(), 
//             }).unknown(true) 
        


//           let message = "";
//           let status;
//           const { error } = vendorSchema.validate(req.body);
      
//           if (error) {
//             message = "Validation error";
//             status = 400;
//             await baseResponse(res, status, error.message, null, error);
//           }
        
//         const data=req.body;

//         if (!data || Object.keys(data).length === 0) {
//             return await baseResponse(res, 200, "No data is updated", null);
         
//         }

//         let filter={
//             vendor_id:req.params.id
//         }

//         transaction=await sequelize.transaction()
//         isTranSactionCommited=0;
//         const updatedData=await registrationServices.updateModelByFilter(Vendor,data,filter,transaction);

//         await transaction.commit();
//         isTranSactionCommited=1;

        
//         return await baseResponse(res,201,"successfulyy updated the vendor data",updatedData);


//     }
//     catch(error)
//     {
//         if(!isTranSactionCommited)
//         {
//             await transaction.rollback();
//         }

//         return await baseResponse(res, 500, "Internal server error", {}, error);
//     }
// }


// exports.updateOwnerInformation=async(req,res)=>{
//     try{
//         const ownerSchema=Joi.object({
//             ownerName: Joi.string().optional(),
//             address: Joi.string().optional(),
//             country: Joi.string().optional(),
//             state: Joi.string().optional(),
//             city: Joi.string().optional(),
//             email: Joi.string().email().optional(),
//             mobileNumber: Joi.string()
//               .pattern(/^[0-9]{10}$/)
//               .optional(), // 10-digit phone number
//           }).unknown(true)

//           let message = "";
//           let status;
//           const { error } = ownerSchema.validate(req.body);
      
//           if (error) {
//             message = "Validation error";
//             status = 400;
//             await baseResponse(res, status, error.message, null, error);
//           }


//         const data=req.body;

//         if (!data || Object.keys(data).length === 0) {
//             return await baseResponse(res, 200, "No data is updated", null);
         
//         }

//         let filter={
//             vendor_id:req.params.id
//         }

//         transaction=await sequelize.transaction()
//         isTranSactionCommited=0;
//         const updatedData=await registrationServices.updateModelByFilter(Owner,data,filter,transaction);

//         await transaction.commit();
//         isTranSactionCommited=1;

        
//         return await baseResponse(res,201,"successfulyy updated the vendor data",updatedData);

//     }
//     catch(error)
//     {
//         return await baseResponse(res, 500, "Internal server error", {}, error);
//     }
// }

