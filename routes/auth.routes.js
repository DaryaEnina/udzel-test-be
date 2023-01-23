const { Router } = require("express");
const bcrypt = require("bcrypt");
const { check, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const config = require("config");
const User = require("../models/user");
const router = Router();

router.post(
  "/signup",
  [
    check("email", "Некорректный email").isEmail().normalizeEmail(),
    check("password"),
    check("name").notEmpty(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          errors: errors.array(),
          message: "Некорректные данные регистрации",
        });
      }

      const { email, password, name, agreement, passwordConfirmation } =
        req.body;

      const candidate = await User.findOne({ email });
      if (candidate) {
        return res
          .status(400)
          .json({ message: "Такой пользователь существует" });
      }

      const hashedPassword = await bcrypt.hash(password, 12);

      const user = new User({
        email,
        password: hashedPassword,
        name,
        agreement,
        passwordConfirmation,
      });

      await user.save();
      res.header({
        "Access-Control-Allow-Origin": "*",
      });
      res.status(201).json({ message: "Пользователь создан" });
      console.log("Пользователь создан");
    } catch (e) {
      console.log(e);
      res
        .status(500)
        .json({ message: "Что-то пошло не так, попробуйте снова..." });
    }
  }
);

router.post(
  "/login",
  [
    check("email", "Введите корректный email")
      .isEmail()
      .trim()
      .normalizeEmail(),
    check("password", "Введите пароль").trim().exists(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          errors: errors.array(),
          message: "Некорректные данные ",
        });
      }

      const { email, password } = req.body;

      const user = await User.findOne({ email });

      if (!user) {
        return res
          .status(400)
          .json({ message: "Пользователь с таким email не найден" });
      }
      if (user.status === false) {
        return res
          .status(400)
          .json({ message: "Данный пользователь заблокирован" });
      }
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(500).json({ message: "Неверный пароль" });
      }

      const token = jwt.sign({ userId: user.id }, config.get("jwtSecret"), {
        expiresIn: "1h",
      });
      res.header({
        "Access-Control-Allow-Origin": "*",
      });
      res.json({ token, userId: user.id });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ message: "Что-то пошло не так, попробуйте снова..." });
    }
  }
);

// router.get("/user/:email", async (req, res) => {
//   const { email } = req.params;
//   try {
//     User.findOne({ email }, function (err, user) {
//       res.status(201).send(user);
//     });
//   } catch (e) {
//     console.log(e);
//     res
//       .status(500)
//       .json({ message: "Что-то пошло не так, попробуйте снова..." });
//   }
// });

router.get("/user/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      console.log("not id");
    }
    const user = await User.findOne({ _id: id });
    res.json(user);
    console.log(user);
  } catch (e) {
    console.log(e);
    res
      .status(500)
      .json({ message: "Что-то пошло не так, попробуйте снова..." });
  }
});

router.post("/user/edit/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findOneAndUpdate(
      { _id: id },
      {
        name: req.body.name,
        email: req.body.email,
        date: req.body.date,
      }
    );

    res.status(201).json({ message: "Данные пользователя изменены" });
  } catch (e) {
    console.log(e);
    res
      .status(500)
      .json({ message: "Что-то пошло не так, попробуйте снова..." });
  }
});

module.exports = router;
