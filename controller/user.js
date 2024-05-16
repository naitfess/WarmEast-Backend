require("dotenv").config();
const User = require("../model/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const key = process.env.TOKEN_SECRET_KEY;
const cloudinary = require("../util/cloudinary_config");
const fs = require("fs");
const Cart = require("../model/Cart");
const Order = require("../model/Order");

//handler register new user
const postUser = async (req, res, next) => {
  try {
    const { fullName, password, email, phoneNumber } = req.body;

    //cek apakah email sudah terdaftar
    const checkUser = await User.findOne({
      where: {
        email: email,
      },
    });

    if (checkUser) {
      const error = new Error("Email already registered");
      error.statusCode = 400;
      throw error;
    }

    //hashed password user
    const hashedPassword = await bcrypt.hash(password, 5);

    //insert data ke tabel User
    const currentUser = await User.create({
      fullName,
      password: hashedPassword,
      email,
      phoneNumber,
      role: "CUSTOMER",
    });

    const token = jwt.sign(
      {
        userId: currentUser.id,
        role: currentUser.role,
      },
      key,
      {
        algorithm: "HS256",
        expiresIn: "1h",
      }
    );

    //membuat cart baru untuk user yang baru terdaftar
    await Cart.create({
      userId: currentUser.id,
    });

    //send response
    res.status(201).json({
      status: "success",
      message: "Register Successfull!",
      token,
    });
  } catch (error) {
    //jika status code belum terdefined maka status = 500;
    res.status(error.statusCode || 500).json({
      status: "Error",
      message: error.message,
    });
  }
};

const loginHandler = async (req, res, next) => {
  try {
    // ambil data dari req body
    const { email, password } = req.body;
    console.log(email, password);
    const currentUser = await User.findOne({
      where: {
        //namaKolom: data_request_body
        email: email,
      },
    });
    //apabila user tidak ditemukan
    if (currentUser == undefined) {
      const error = new Error("wrong email or password");
      error.statusCode = 400;
      throw error;
    }
    const checkPassword = await bcrypt.compare(password, currentUser.password);

    //apabila password salah / tidak matched
    if (checkPassword === false) {
      const error = new Error("wrong email or password");
      error.statusCode = 400;
      throw error;
    }

    const token = jwt.sign(
      {
        userId: currentUser.id,
        role: currentUser.role,
      },
      key,
      {
        algorithm: "HS256",
        expiresIn: "1h",
      }
    );

    //kirim token ke cookies

    res.status(200).json({
      status: "Success",
      message: "Login Successfull!",
      token,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      status: "error",
      message: error.message,
    });
  }
};

const getUserByToken = async (req, res, next) => {
  //hanya user yang telah login bisa mengambil data dirinya dengan mengirimkan token
  //step 1 ambil token
  try {
    //ambil token dari cookies
    const authorization = req.headers.authorization;
    let token;
    if ((authorization !== null) & authorization.startsWith("Bearer ")) {
      token = authorization.substring(7);
    } else {
      const error = new Error("You need to login");
      error.statusCode = 400;
      throw error;
    }

    const decoded = jwt.verify(token, key);

    //decoded akan punya payload/data role & userId
    const loggedUser = await User.findOne({
      where: {
        id: decoded.userId,
      },
    });

    if (!loggedUser) {
      const error = new Error(`User with id ${id} not exist!`);
      error.statusCode = 400;
      throw error;
    }

    res.status(200).json({
      status: "Success",
      message: "Successfuly fetch user data",
      user: loggedUser,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      status: "Error",
      message: error.message,
    });
  }
};

//edit user account (fullname, profile)
const editProfile = async (req, res, next) => {
  try {
    //ambil req body
    const { fullName } = req.body;

    //ekstrak tokennya
    const authorization = req.headers.authorization;
    let token;
    if (authorization !== null && authorization.startsWith("Bearer ")) {
      token = authorization.substring(7);
    } else {
      const error = new Error("You need to login");
      error.statusCode(403);
      throw error;
    }
    const decoded = jwt.verify(token, key);

    //cari usernya
    const currentUser = await User.findOne({
      where: {
        id: decoded.userId,
      },
    });
    if (!currentUser) {
      const error = new Error(`User with id ${decoded.userId} not exist!`);
      error.statusCode = 400;
      throw error;
    }

    let imageUrl;
    //proses datanya
    if (req.file) {
      const file = req.file;

      const uploadOption = {
        folder: "Profile_User/",
        public_id: `user_${currentUser.id}`,
        overwrite: true,
      };

      const uploadFile = await cloudinary.uploader.upload(
        file.path,
        uploadOption
      );

      //didapat image URL
      imageUrl = uploadFile.secure_url;

      //ngehapus file yang diupload didalam dir lokal
      fs.unlinkSync(file.path);
    }

    //update data user
    //image url bakal diupdate kedalam database user bersangkutan
    await User.update(
      {
        fullName,
        profilePicture: imageUrl,
      },
      {
        where: {
          id: currentUser.id,
        },
      }
    );

    const targetedUser = await User.findOne({
      where: {
        id: currentUser.id,
      },
      attributes: ["id", "fullname", "profilePicture"],
    });

    res.status(200).json({
      status: "Success",
      message: "Successfully edit user data",
      user: targetedUser,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      status: "Error",
      message: error.message,
    });
  }
};

const editPassword = async (req, res, next) => {
  try {
    //ambil req body
    const { oldPassword, newPassword, confirmPassword } = req.body;

    //ekstrak tokennya
    const authorization = req.headers.authorization;
    let token;
    if (authorization !== null && authorization.startsWith("Bearer ")) {
      token = authorization.substring(7);
    } else {
      const error = new Error("You need to login");
      error.statusCode(403);
      throw error;
    }
    const decoded = jwt.verify(token, key);

    //cari usernya
    const currentUser = await User.findOne({
      where: {
        id: decoded.userId,
      },
    });
    if (!currentUser) {
      const error = new Error(`User with id ${id} not exist!`);
      error.statusCode = 400;
      throw error;
    }

    const checkPassword = await bcrypt.compare(
      oldPassword,
      currentUser.password
    );

    //apabila password salah / tidak matched
    if (checkPassword === false) {
      const error = new Error("wrong old password");
      error.statusCode = 400;
      throw error;
    }

    if (newPassword !== confirmPassword) {
      const error = new Error("Password doesnt match");
      error.statusCode = 400;
      throw error;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 5);
    await User.update(
      {
        password: hashedPassword,
      },
      {
        where: {
          id: currentUser.id,
        },
      }
    );

    const targetedUser = await User.findOne({
      where: {
        id: currentUser.id,
      },
      attributes: ["id", "fullname"],
    });

    res.status(200).json({
      status: "Success",
      message: "Successfully edit password",
      user: targetedUser,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      status: "Error",
      message: error.message,
    });
  }
};

//edit user account (fullname, profile)
const editUserAddress = async (req, res, next) => {
  try {
    //ambil req body
    const { address1, address2 } = req.body;

    //ekstrak tokennya
    const authorization = req.headers.authorization;
    let token;
    if (authorization !== null && authorization.startsWith("Bearer ")) {
      token = authorization.substring(7);
    } else {
      const error = new Error("You need to login");
      error.statusCode(403);
      throw error;
    }
    const decoded = jwt.verify(token, key);

    //cari usernya
    const currentUser = await User.findOne({
      where: {
        id: decoded.userId,
      },
    });
    if (!currentUser) {
      const error = new Error(`User with id ${id} not exist!`);
      error.statusCode = 400;
      throw error;
    }

    await User.update(
      {
        address1,
        address2,
      },
      {
        where: {
          id: currentUser.id,
        },
      }
    );

    const targetedUser = await User.findOne({
      where: {
        id: currentUser.id,
      },
      attributes: ["id", "fullname", "address1", "address2"],
    });

    res.status(200).json({
      status: "Success",
      message: "Successfully edit user data",
      user: targetedUser,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      status: "Error",
      message: error.message,
    });
  }
};

module.exports = {
  postUser,
  loginHandler,
  editProfile,
  editPassword,
  editUserAddress,
  getUserByToken,
};
