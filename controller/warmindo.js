require("dotenv").config();
const { where } = require("sequelize");
const jwt = require("jsonwebtoken");
const key = process.env.TOKEN_SECRET_KEY;
const User = require("../model/User");
const Warmindo = require("../model/Warmindo");
const cloudinary = require("../util/cloudinary_config");
const fs = require("fs");

const getAllWarmindo = async (req, res, next) => {
  try {
    const warmindos = await Warmindo.findAll({
      attributes: ["id", "name", "address", "picture"],
    });

    if (warmindos.length === 0) {
      const error = new Error("Warmindo data is empty");
      error.statusCode = 400;
      throw error;
    }

    res.status(200).json({
      status: "Success",
      message: "Successfully fetch all warmindo data",
      warmindo: warmindos,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      status: "Error",
      message: error.message,
    });
  }
};

//handler get warmindo by id
const getWarmindoById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const currentWarmindo = await Warmindo.findOne({
      attributes: ["id", "name", "address", "picture"],
      where: {
        id: id,
      },
    });

    if (!currentWarmindo) {
      const error = new Error(`Warmindo with id ${id} is not existed`);
      error.statusCode = 400;
      throw error;
    }

    res.status(200).json({
      status: "Success",
      message: `Successfully fetch warmindo data with id ${id}`,
      currentWarmindo,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      status: "Error",
      message: error.message,
    });
  }
};

//handler add warmindo
const postWarmindo = async (req, res, next) => {
  try {
    const { name, address } = req.body;
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
      const error = new Error(`User not exist!`);
      error.statusCode = 400;
      throw error;
    }

    if (currentUser.warmindoId !== null) {
      const error = new Error(
        `User with id ${currentUser.id} already have warmindo!`
      );
      error.statusCode = 400;
      throw error;
    }

    //insert data ke tabel Warmindo
    const currentWarmindo = await Warmindo.create({
      name,
      address,
      userId: currentUser.id,
    });

    const targetedWarmindo = await Warmindo.findOne({
      where: {
        id: currentWarmindo.id,
      },
    });

    await User.update(
      {
        warmindoId: targetedWarmindo.id,
        role: "SELLER",
      },
      {
        where: {
          id: currentUser.id,
        },
      }
    );

    //send response
    res.status(201).json({
      status: "success",
      message: "Add Warmindo Successfull!",
      currentWarmindo,
    });
  } catch (error) {
    //jika status code belum terdefined maka status = 500;
    res.status(error.statusCode || 500).json({
      status: "Error",
      message: error.message,
    });
  }
};

//handler delete warmindo by id
const deleteWarmindo = async (req, res, next) => {
  //hanya admin yang bisa ngedelete
  try {
    const { id } = req.params;
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
      const error = new Error(`User not exist!`);
      error.statusCode = 400;
      throw error;
    }

    const currentWarmindo = await Warmindo.findOne({
      where: {
        id: id,
      },
    });

    if (!currentWarmindo) {
      const error = new Error(`Warmindo with id ${id} is not existed`);
      error.statusCode = 400;
      throw error;
    }

    if (currentUser.warmindoId !== currentWarmindo.id) {
      const error = new Error(
        `User with id ${currentUser.id} not have access to delete warmindo!`
      );
      error.statusCode = 400;
      throw error;
    }

    await Warmindo.destroy({
      where: {
        id: id,
      },
    });

    await User.update(
      {
        warmindoId: null,
        role: "CUSTOMER",
      },
      {
        where: {
          warmindoId: id,
        },
      }
    );

    res.status(200).json({
      status: "Success",
      message: `Successfully delete warmindo data with id ${id}`,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      status: "Error",
      message: error.message,
    });
  }
};

const updateWarmindo = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, address } = req.body;

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
      const error = new Error(`User not exist!`);
      error.statusCode = 400;
      throw error;
    }

    const currentWarmindo = await Warmindo.findOne({
      where: {
        id: id,
      },
    });

    if (!currentWarmindo) {
      const error = new Error(`Warmindo with id ${id} is not existed`);
      error.statusCode = 400;
      throw error;
    }

    if (currentUser.warmindoId !== currentWarmindo.id) {
      const error = new Error(
        `User with id ${currentUser.id} not have access to update warmindo!`
      );
      error.statusCode = 400;
      throw error;
    }

    let pictureUrl;

    // Proses upload gambar baru ke Cloudinary jika ada file yang diunggah
    if (req.file) {
      const file = req.file;

      // Konfigurasi upload ke Cloudinary
      const uploadOptions = {
        folder: "Warmindo_picture/", // Folder di Cloudinary untuk menyimpan gambar warmindo
        public_id: `warmindo_${id}`, // Nama public_id unik untuk gambar warmindo
        overwrite: true,
      };

      // Upload gambar ke Cloudinary
      const uploadResult = await cloudinary.uploader.upload(
        file.path,
        uploadOptions
      );

      // Dapatkan URL gambar yang diunggah
      pictureUrl = uploadResult.secure_url;

      // Hapus file yang diunggah dari direktori lokal setelah diunggah ke Cloudinary
      fs.unlinkSync(file.path);
    } else {
      console.log("No file uploaded");
    }
    await Warmindo.update(
      {
        name,
        address,
        picture: pictureUrl,
      },
      {
        where: {
          id: currentWarmindo.id,
        },
      }
    );

    const targetedWarmindo = await Warmindo.findOne({
      where: {
        id: currentWarmindo.id,
      },
    });

    res.status(200).json({
      status: "Success",
      message: `Successfully update warmindo data with id ${id}`,
      updated: {
        name: targetedWarmindo.name,
        address: targetedWarmindo.address,
        picture: targetedWarmindo.picture,
      },
    });
  } catch (error) {
    console.log(error.message);
    res.status(error.statusCode || 500).json({
      status: "Error",
      message: error.message,
    });
  }
};

module.exports = {
  getAllWarmindo,
  getWarmindoById,
  postWarmindo,
  deleteWarmindo,
  updateWarmindo,
};
