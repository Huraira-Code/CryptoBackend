const User = require("../models/user_model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const sendMail = require("../utils/nodemailer.js");

const handleUserSignUp = async (req, res) => {
  console.log(req.body);
  console.log(process.env.JWT_SECRET);
  try {
    const { fullName, email, password } = req.body;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    if (!fullName || !email || !password) {
      return res.status(401).json({ msg: "all fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(409)
        .json({ msg: "Email is already registered. Please Login " }); // 409 Conflict
    }

    const user = await User.create({
      name: fullName,
      email: email,
      password: hashedPassword,
    });
    if (user) {
      const { _id, name, email } = user;
      const token = jwt.sign({ _id, name, email }, process.env.JWT_SECRET, {
        expiresIn: "30d",
      });
      return res.json({ msg: "Succesfully Signed Up", token: token });
      console.log("a");
    }
  } catch (error) {
    console.log(error);
    return res.status(404).json({ msg: error });
  }
};

const handleUserLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.json({ msg: "all fields are required" });
    }
    const user = await User.findOne({
      email: email,
    });
    const { _id, name } = user;
    if (user) {
      const validated = await bcrypt.compare(password, user.password);
      if (validated) {
        const token = jwt.sign({ _id, name }, process.env.JWT_SECRET, {
          expiresIn: "30d",
        });
        return res
          .status(200)
          .json({ msg: "Successfully logged in", token: token });
      } else {
        return res.status(401).json({ msg: "Email or password is incorrect" }); // 401 Unauthorized
      }
    } else {
      return res.status(404).json({ msg: "Email or password is incorrect" }); // 404 Not Found
    }
  } catch (error) {
    return res.status(500).json({ err: error.message }); // 500 Internal Server Error
  }
};

const handleViewProfile = async (req, res) => {
  const authHeader = req.headers.authorization;

  // Validate Authorization Header
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "Authorization header missing or malformed" });
  }

  // Extract Token
  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Token not provided" });
  }

  // Verify Token
  let verify;
  try {
    verify = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return res.status(403).json({ message: "Invalid or expired token", error });
  }

  const { _id } = verify;
  if (!_id) {
    return res.status(400).json({ message: "Invalid token payload" });
  }

  // Find User
  const user = await User.findById(_id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // Return User Data
  return res.status(200).json({ user });
};

const handleAddToWatchlist = async (req, res) => {
  const authHeader = req.headers.authorization;
  const { itemId } = req.body;

  // Validate Authorization Header
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "Authorization header missing or malformed" });
  }

  // Extract Token
  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Token not provided" });
  }

  // Verify Token
  let verify;
  try {
    verify = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return res.status(403).json({ message: "Invalid or expired token", error });
  }

  const { _id } = verify;
  if (!_id) {
    return res.status(400).json({ message: "Invalid token payload" });
  }

  try {
    const user = await User.findById(_id);

    if (!user.WatchList.includes(itemId)) {
      user.WatchList.push(itemId);
      await user.save();
    }

    res.status(200).json({ success: true, message: "Item added to watchlist" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const handleViewWatchlist = async (req, res) => {
  const authHeader = req.headers.authorization;

  // Validate Authorization Header
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "Authorization header missing or malformed" });
  }

  // Extract Token
  const token = authHeader.split(" ")[1];
  console.log(token)
  if (!token) {
    return res.status(401).json({ message: "Token not provided" });
  }

  // Verify Token
  let verify;
  try {
    verify = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return res.status(403).json({ message: "Invalid or expired token", error });
  }

  const { _id } = verify;
  if (!_id) {
    return res.status(400).json({ message: "Invalid token payload" });
  }

  try {
    const user = await User.findById(_id);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, watchlist: user.WatchList });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const handleRemoveFromWatchlist = async (req, res) => {
  const authHeader = req.headers.authorization;

  // Validate Authorization Header
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "Authorization header missing or malformed" });
  }

  // Extract Token
  const token = authHeader.split(" ")[1];
  console.log(token)
  if (!token) {
    return res.status(401).json({ message: "Token not provided" });
  }

  // Verify Token
  let verify;
  try {
    verify = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return res.status(403).json({ message: "Invalid or expired token", error });
  }

  const { _id } = verify;
  if (!_id) {
    return res.status(400).json({ message: "Invalid token payload" });
  }

  try {
    const user = await User.findById(_id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.WatchList = user.WatchList.filter((coinId) => coinId !== req.body.id);
    await user.save();

    res.status(200).json({ success: true, message: "Removed from watchlist" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


const changePassword = async (req, res) => {
  console.log(req.body);
  try {
    // 1. Extract the Authorization header
    const authHeader = req.headers.authorization;
    const token = authHeader.split(" ")[1];
    const verify = jwt.verify(token, process.env.JWT_SECRET);
    const { _id } = verify;

    // 4. Extract passwords from request body
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "Old password and new password are required" });
    }

    // 5. Fetch the user from the database
    const user = await User.findOne({ _id: _id });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    // 6. Compare the old password with the stored hashed password
    const isMatch = await bcrypt.compare(oldPassword, user.password); // Adjust the field name as needed

    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect current password" });
    }

    // 7. Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // 8. Update the user's password in the database
    user.password = hashedPassword; // Adjust the field name as needed
    await user.save();

    // 9. Respond with success message
    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const sendSupportEmail = async (req, res) => {
  try {
    const message = req.body;
    sendMail("Reminder App Support Mail", message.message);
    res.json({ status: "success" });
  } catch (error) {
    res.json({ status: "failed", msg: error.message });
  }
};

module.exports = {
  handleUserSignUp,
  handleUserLogin,
  handleViewProfile,
  changePassword,
  handleAddToWatchlist,
  sendSupportEmail,
  handleAddToWatchlist,
  handleViewWatchlist,
  handleRemoveFromWatchlist
};
