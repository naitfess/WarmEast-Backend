const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload_file");

const {
  postUser,
  loginHandler,
  editProfile,
  editPassword,
  getUserByToken,
  editUserAddress,
} = require("../controller/user");

//Register new User
router.post("/api/users/register", postUser);

//user login
router.post("/api/users/login", loginHandler);

//get data user by token
router.get("/api/users/fetch-by-token", getUserByToken);

//user edit profile
router.put("/api/users/edit-profile", upload.single("image"), editProfile);

//user edit password
router.put("/api/users/edit-password", editPassword);

//user edit address
router.put("/api/users/edit-user-address", editUserAddress);

module.exports = router;
