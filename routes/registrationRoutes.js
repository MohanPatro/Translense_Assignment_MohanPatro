const express=require('express');
const upload=require('../helpers/upload')
const router=express.Router();
const registrationController=require('../controllers/registrationController');

  
router.post('/addVendorInformation',upload.fields([{ name: 'vendor_image', maxCount: 1 }, { name: 'owner_image', maxCount: 1 }]),registrationController.addVendorAndOwnerDetails);

router.get('/getAllVendors',registrationController.getAllVendorDetails);

router.get('/getVendorById/:id',registrationController.getendorDetailsById);


router.post('/sendOTP',registrationController.sendOtp);

router.post('/verifyOTP',registrationController.verifyOtp);

router.patch('/updateVendorData/:id',registrationController.updateVendorData);

module.exports=router;