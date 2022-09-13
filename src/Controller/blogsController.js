const blogSchema = require("../Model/blogsModel");
const authorModel = require("../Model/authorModel");
let { isValidString, keyValid, idCharacterValid } = require("../Validation/validator");
let mongoose = require("mongoose");
let jwt = require("jsonwebtoken");

//================== Creating Blogs  ============================//
const createBlogs = async function (req, res) {
  try {
    const data = req.body;
    if (!keyValid(data))
      return res.status(400).send({ status: false, message: "The body Can't be Empty" });

    const { title, body, authorId, category } = data;
    if (!title)
      return res.status(400).send({ status: false, message: "title is required" });

    if (!body)
      return res.status(400).send({ status: false, message: "body is required" });

    if (!authorId)
      return res.status(400).send({ status: false, message: "authorId is required" });

    if (!category)
      return res.status(400).send({ status: false, message: "category is required" });

    if (!idCharacterValid(authorId))
      return res.status(400).send({ status: false, message: "Please Enter valid author id" });

    let Author = await authorModel.findById(authorId);
    if (!Author)
      return res.status(400).send({ status: false, message: "Author_Id not found In DB" });

    if (!isValidString(title))
      return res.status(400).send({ status: false, message: "title is not valid String" });

    if (!isValidString(body))
      return res.status(400).send({ status: false, message: "Body is not valid String" });

    if (!isValidString(category))
      return res.status(400).send({ status: false, message: "Category is not valid String" });

    if (!isValidString(authorId))
      return res.status(400).send({ status: false, message: "authorID is not valid String" });

    const createBlog = await blogSchema.create(data);
    return res.status(201).send({ status: true, data: createBlog });
  } catch (err) {
    return res.status(500).send({ status: false, data: err.message });
  }
};

//================== Get All Blogs ==========================================//
const getAllBlogs = async function (req, res) {
  try {
    const data = req.query;

//========== Validating data is empty or not ==============================//
    if (!keyValid(data)) {
      const blog = await blogSchema.find({
        isPublished: true,
        isDeleted: false,
      });
      if (blog.length == 0) {
        return res.status(404).send({status: false, message: "Blog doesn't Exists,Alredy deleted",
        });
      }
      return res.status(200).send({ status: true, data: blog });
    }

    //================ get data by query param =================================//
    if (keyValid(data)) {
      data.isPublished = true;
      data.isDeleted = false;
      //console.log(data)
      let getBlog = await blogSchema.find(data).populate("authorId");
      if (getBlog.length == 0) {
        return res.status(404).send({status: false,message: "No such blog exist, Please provide correct data.",
        });
      }
      return res.status(200).send({ status: true, data: getBlog });
    }
  } catch (error) {
    return res.status(500).send({ status: false, Error: error.message });
  }
};

//====================== Updating Blogs ===================================//
const updateBlog = async function (req, res) {
  try {
    const blogId = req.params.blogId;
    const blogData = req.body;
    let { title, body, tags, subcategory } = blogData;

    if (!idCharacterValid(blogId))
      return res.status(400).send({ status: false, message: "blogId is invalid!" });

    if (!keyValid(blogData)) return res.status(400).send({ status: false, message: "the Input is required" });

    if (title) {
      if (!isValidString(title)) return res.status(404).send({ status: false, message: "the Enter valid title" });
    }
    if (body) {
      if (!isValidString(body)) return res.status(404).send({ status: false, message: "the Enter valid Body" });
    }
    if (tags) {
      if (!isValidString(tags)) return res.status(404).send({ status: false, message: "the Enter valid tags" });
      if (!Array.isArray(tags)) return res.status(404).send({ status: false, message: "the tags is not in array" });
    }
    if (subcategory) {
      if (!isValidString(subcategory)) return res.status(404).send({ status: false, message: "the Enter valid subcategory" });
      if (!Array.isArray(subcategory)) return res.status(404).send({ status: false, message: "the subcategory is not in array" });
    }

    let blog = await blogSchema.findOneAndUpdate({ _id: blogId, isDeleted: false },
      {
        $set: { isPublished: true, title: title, body: body, publishedAt: new Date() },
        $push: { tags: tags, subcategory: subcategory }
      },
      { new: true });
    if (!blog) return res.status(200).send({ status: false, message: "the blog is already deleted" });
    return res.status(200).send({ status: true, data: blog });

  } catch (error) {
    return res.status(500).send({ status: false, Error: error.message })
  }
}

//=========================== Deleted Blogs By Path with Validation ============================//
const deleteBlog = async function (req, res) {
  try {
    let blogId = req.params.blogId;
    let blogIdValid = await blogSchema.findById(blogId);
    if (!blogIdValid)
      return res.status(404).send({ status: false, message: "the blog does not Exist" });

    let deletedoc = await blogSchema
      .findOne({ _id: blogId })
      .select({ isDeleted: 1, _id: 0 });

    if (deletedoc.isDeleted === true)
      return res.status(404).send({ status: false, message: "the blog is alreday deleted" });

    let deleteBlog = await blogSchema.findOneAndUpdate(
      { _id: blogId },
      { $set: { isDeleted: true, deletedAt: new Date() } },
      { new: true }
    );
    return res.status(200).send({ status: true, msg: "" });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

//======================== Deleted Blogs By Query Params with Validation ============================//
const deleteByKeys = async function (req, res) {
  try {
    let decodedId = req.decodedToken.userId
    const data = req.query
    if (!keyValid(data)) return res.status(400).send({ status: false, message: "Please give input" })

    let { authorId, category, subcategory, tags, isPublished } = data

    // checking , if any filter has no value
    if (!authorId) return res.status(400).send({ status: false, message: 'please provide authorId' })

    if (!isPublished) return res.status(400).send({ status: false, message: 'please provide isPublished' })

    if (authorId) {
      if (!idCharacterValid(authorId)) return res.status(400).send({ status: false, message: 'please Give the valid AuthorID' })
    }
    if (category) {
      if (!isValidString(category)) return res.status(400).send({ status: false, message: 'please provide category' })
    }
    if (subcategory) {
      if (!isValidString(subcategory)) return res.status(400).send({ status: false, message: 'please provide subcategory' })
    }
    if (tags) {
      if (!isValidString(tags)) return res.status(400).send({ status: false, message: 'please provide tags' })
    }

    if (decodedId !== authorId) return res.status(404).send({ status: false, message: "you are not the Authorized person to delete" })

    // checking if blog exist with given filters 
    const blog = await blogSchema.find(data)
    if (!keyValid(blog)) return res.status(404).send({ message: "No blog exist with given filters " })

    // checking if blog already deleted 
    let blogs = await blogSchema.find({ authorId: authorId, isDeleted: false })
    if (!keyValid(blogs)) return res.status(400).send({ status: false, message: "Blogs are already deleted" })

    // deleting blog
    const deletedBlog = await blogSchema.updateMany(data, { $set: { isDeleted: true, deletedAt: new Date() } }, { new: true })
    if (!deletedBlog) return res.status(404).send({ status: false, message: "No such blog found" })
    return res.status(200).send({ message: "blog deleted successfully" })
  }
  catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

module.exports = { createBlogs, getAllBlogs, updateBlog, deleteBlog, deleteByKeys };




