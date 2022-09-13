let jwt = require("jsonwebtoken");
const blogsModel = require("../Model/blogsModel");
let mongoose = require('mongoose')
let { idCharacterValid } = require('../Validation/validator')

//==================== Authentication ================================>
let authentication = async function (req, res, next) {
  try {
    let token = req.headers["x-api-key"];
    if (!token) {
      return res.send({ status: false, message: "Token  is mandatory" });
    }
    let decodedToken = jwt.verify(token, "our_first_project")

    if (!decodedToken) return res.status(400).send({ status: false, message: "the token is invalid" })
    req["decodedToken"] = decodedToken
    next();

  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

//================== Authorization by blogId through pathParams ==================>
let authorization = async function (req, res, next) {
  try {

    let token = req.headers["x-api-key"];
    let decodedToken = jwt.verify(token, "our_first_project");
    let blogId = req.params.blogId;
    if (!blogId)
      return res.status(400).send({ status: true, message: "the blogId is requried" });

    if (!idCharacterValid(blogId)) return res.status(400).send({ status: false, message: "blogId is invalid!" });

    let findBlogId = await blogsModel
      .findById(blogId)
      .select({ authorId: 1, _id: 0 });

    if (!findBlogId)
      return res.status(400).send({ status: false, message: "blogId is invalid!" });

    let userLoggedIn = decodedToken.userId;
    if (findBlogId.authorId != userLoggedIn)
      return res.status(400).send({status: false, message: "Author logged is not allowed to modify the requested author's blog data",
      });
    next();
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

module.exports = { authentication, authorization } 
