const {Router} = require("express");
const { userRegister, userLogin, userLogout, refreshAccessToken } = require("../controllers/user.controllers");
const { userRegisterValidator, userLoginValidator } = require("../validators/user.validators");
const { validate } = require("../validators/validator");

const router=Router();

router.post("/register",userRegisterValidator(),validate, userRegister);
router.post("/login",userLoginValidator() ,validate, userLogin);
router.post("/logout",userLogout);
router.post("/refresh",refreshAccessToken);

module.exports=router;