const { Router } = require("express");
const Users = require("../models/users");
const config = require("config");

const router = Router();

router.get("/", async (req, res) => {
  try {
    const users = await Users.find();
    res.json(users);
  } catch (e) {
    console.log(e);
    res
      .status(500)
      .json({ message: "Что-то пошло не так, попробуйте снова..." });
  }
});
module.exports = router;

router.post("/", async (req, res) => {
  try {
    const { email } = req.body;
    console.log(req.body);
    const userByEmail = await Users.find({ email: req.body.email });
    const users = new Users();

    userByEmail.status = "block";
    await users.save(); //не сохранять, а менять статус!!!

    res.status(201).json({ users });
    res.header({
      "Access-Control-Allow-Origin": "*",
    });
  } catch (e) {
    console.log(e.message);
    res.status(500).json({ message: "Что-то пошло не так, попробуйте снова" });
  }
});

router.delete("/delete/:id", async (req, res) => {
  try {
    const id = req.params.id.split(",");
    const user = await Users.deleteMany({ _id: { $in: id } });
    res.json(user);
  } catch (e) {
    console.log(e.message);
    res.status(500).json({ message: "Что-то пошло не так, попробуйте снова" });
  }
});

// router.put("/status/:id", async (req, res) => {
//   try {
//     const id = req.params.id.split(",");
//     const user = await Users.find({ _id: { $in: id } });
//     for (let i = 0; i < user.length; i++) {
//       user.status = !user.status;
//     }
//     await user.save(); //is not a function
//     res.json(user);
//   } catch (e) {
//     console.log(e.message);
//     res.status(500).json({ message: "Что-то пошло не так, попробуйте снова" });
//   }
// });

router.put("/status/block/:id", async (req, res) => {
  try {
    const id = req.params.id.split(",");
    const user = await Users.updateMany(
      { _id: { $in: id } },
      { $set: { status: false } },
      { multi: true }
    );
    res.json(user);
  } catch (e) {
    console.log(e.message);
    res.status(500).json({ message: "Что-то пошло не так, попробуйте снова" });
  }
});

router.put("/status/unblock/:id", async (req, res) => {
  try {
    const id = req.params.id.split(",");
    const user = await Users.updateMany(
      { _id: { $in: id } },
      { $set: { status: true } },
      { multi: true }
    );
    res.json(user);
  } catch (e) {
    console.log(e.message);
    res.status(500).json({ message: "Что-то пошло не так, попробуйте снова" });
  }
});
