const express = require("express");
const upload = require("../middleware/multer.js");
const {
  handleUserSignUp,
  handleUserLogin,
  handleViewProfile,
  sendSupportEmail,
  handleAddToWatchlist,
  handleViewWatchlist,
  handleRemoveFromWatchlist,
  
} = require("../controllers/user_controller");
const router = express.Router();

// Sign UP & Login
router.route("/signUp").post(handleUserSignUp);
router.route("/login").post(handleUserLogin);
router.route("/viewProfile").post(handleViewProfile);
router.route("/handleAddToWatchlist").post(handleAddToWatchlist);
router.route("/handleViewWatchlist").post(handleViewWatchlist);
router.route("/handleRemoveFromWatchlist").post(handleRemoveFromWatchlist);

router.route("/support").post(sendSupportEmail);


module.exports = router;
