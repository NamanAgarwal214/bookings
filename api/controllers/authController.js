const User = require("../models/User");
const jwt = require("jsonwebtoken");

// exports.register = async (req, res, next) => {
//   try {
//     const { name, email, password } = req.body;
//     if (!name || !email || !password) {
//       throw new Error("Please fill all the fields");
//     }
//     if (password.length < 8) {
//       throw new Error("Password must contain at least 8 characters");
//     }
//     // const user = await User.findOne({ email: email });
//     // if (user) {
//     //   throw new Error("Email is already registered...Login to continue");
//     // } else {
//     const token = jwt.sign({ name, email, password }, process.env.JWT_SECRET, {
//       expiresIn: process.env.JWT_EXPIRES_IN,
//     });
//     res.cookie("jwt", token, {
//       expires: new Date(
//         Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
//       ),
//       httpOnly: true,
//     });
//     const url = "http://" + `${req.headers.host}/api/activate/${token}`;
//     res.json({
//       url,
//     });

//     // }
//   } catch (error) {
//     res.json(error.message);
//   }
// };

// exports.activate = async (req, res) => {
//   try {
//     const token = req.params.token;
//     if (token) {
//       jwt.verify(token, process.env.JWT_SECRET, async (err, decodedToken) => {
//         if (err)
//           throw new Error("Incorrect or expired link... Please register again");
//         else {
//           const { name, email, password } = decodedToken;
//           const user = await User.findOne({ email: email });
//           if (user) {
//             throw new Error("Email is already registered...Login to continue");
//           } else {
//             const newUser = new User({
//               name,
//               email,
//               password,
//             });
//             await newUser.save();
//           }
//         }
//       });
//       res.status(200).json({
//         message: "Registered Successfully",
//       });
//     } else {
//       throw new Error("Token is invalid!");
//     }
//   } catch (error) {
//     res.json(error.message);
//   }
// };

// exports.login = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     const user = await User.findOne({ email }).select("+password");

//     if (!user || !(await user.verifyPassword(password, user.password))) {
//       throw new Error("Incorrect email or password!");
//     }
//     user.password = undefined;
//     const token = jwt.sign({ sub: user._id }, process.env.JWT_SECRET, {
//       expiresIn: process.env.JWT_EXPIRES_IN,
//     });

//     res.cookie("jwt", token, {
//       expires: new Date(
//         Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
//       ),
//       httpOnly: true,
//     });

//     res.status(200).json({
//       type: "success",
//       message: "Logged in successfully",
//     });
//   } catch (error) {
//     res.json(error.message);
//   }
// };

const issueToken = (res, user) => {
  const id = user._id;
  const token = jwt.sign({ sub: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  res.cookie("jwt", token, {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
  });
  return token;
};

exports.register = async (req, res) => {
  try {
    const user = new User({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
    });

    const token = issueToken(res, user);
    await user.save();
    // console.log(res);
    return res.status(200).json({
      type: "success",
      message: "User registered successfully",
      user,
      token,
    });
  } catch (err) {
    res.json({
      type: "error",
      message: err.message,
    });
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.verifyPassword(password, user.password))) {
      return res.json({
        type: "error",
        message: "Incorrect email or password!",
      });
    }
    user.password = undefined;

    const token = issueToken(res, user);

    res.status(200).json({
      type: "success",
      message: "User logged in successfully",
      user,
      token,
    });
  } catch (error) {
    res.json({
      type: "error",
      message: error.message,
    });
  }
};

exports.protect = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  let decoded;
  if (token) {
    try {
      decoded = await jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(400).json({
        type: "error",
        message: error.message,
      });
    }

    try {
      const currentUser = await User.findById({ _id: decoded.sub });
      if (!currentUser) {
        throw new Error("The user does not exist anymore.");
      }
      res.locals.id = decoded.sub;
      console.log("Success from middleware");
      next();
    } catch (error) {
      return res.status(500).json({
        type: "error",
        message: error.message,
      });
    }
  } else {
    return res.status(400).json({
      type: "error",
      message: "You aren't Logged In",
    });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(res.locals.id);
    return res.json({
      type: "success",
      user,
    });
  } catch (error) {
    return res.json({
      type: "error",
      message: error.message,
    });
  }
};
