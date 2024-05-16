const express = require("express");
const upload = require("../middleware/upload_file");

const {
  postMenu,
  getAllMenu,
  getMenuById,
  updateMenu,
  deleteMenu,
  getMenuByWarmindoId,
} = require("../controller/menu");
const router = express.Router();

//Register new menu
router.post("/api/menus/register", postMenu);

//fetch all menu
router.get("/api/menus/fetch-all", getAllMenu);

//fetch all menu from warmindo
router.get("/api/menus/fetch-all/:warmindoId", getMenuByWarmindoId);

//get menu by id
router.get("/api/menus/:id", getMenuById);

//update menu
router.put("/api/menus/:id", upload.single("image"), updateMenu);

//delete menu
router.delete("/api/menus/:id", deleteMenu);

module.exports = router;
