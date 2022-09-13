const authorModel = require('../Model/authorModel')
let { isValidEmail, isValids, isValidPassword, isValidName, keyValid } = require('../Validation/validator')
let jwt = require('jsonwebtoken')

//============================ Creating Authors With Validation ============================//
const createAuthor = async function (req, res) {
    try {

        const data = req.body
        let { fname, lname, title, email, password } = data
        if (Object.keys(data).length === 0) return res.status(400).send({ status: false, message: "The Body Can't be Empty" })

        if (!fname) return res.status(400).send({ status: false, message: "The first name is required" })
        if (!lname) return res.status(400).send({ status: false, message: "The last name is required" })
        if (!title) return res.status(400).send({ status: false, message: "The title is required" })
        if (!email) return res.status(400).send({ status: false, message: "The Email is required" })
        if (!password) return res.status(400).send({ status: false, message: "The password is required" })

        if (!isValids(fname)) return res.status(400).send({ status: false, message: "Don't leave fname Empty" })
        if (!isValidName(fname)) return res.status(400).send({ status: false, message: "Please give Valid first Name" })
        if (!isValidName(lname)) return res.status(400).send({ status: false, message: "Please give Valid last Name" })
        if (!isValids(lname)) return res.status(400).send({ status: false, message: "Don't leave lname name Empty" })
        if (!isValids(email)) return res.status(400).send({ status: false, message: "Don't leave Email Empty" })
        if (!isValids(title)) return res.status(400).send({ status: false, message: "Don't leave title Empty" })
        if (!isValids(password)) return res.status(400).send({ status: false, message: "Don't leave password Empty" })

        let titles = ['Mr', 'Mrs', 'Miss']
        if (!titles.includes(title)) return res.status(400).send({ status: false, message: `Title should be among ${titles}` })

        if (!isValidEmail(email)) return res.status(400).send({ status: false, message: "Please Enter valid Email" })
        if (!isValidPassword(password)) return res.status(400).send({ status: false, message: "Please Enter valid Password" })

        if (await authorModel.findOne({ email })) return res.status(400).send({ status: false, message: "Email already Exist" })

        const createA = await authorModel.create(data)
        res.status(201).send({ status: true, data: createA })
    }
    catch (err) {
        return res.status(500).send(err.message)
    }
}


//========================= Author Login With Validation ===============================//
let loginAuthor = async function (req, res) {
    try {
        let body = req.body
        if (!keyValid(body)) return res.status(400).send({ status: false, message: "input from body is required" })
        let { email, password } = body

        let validLogin = await authorModel.findOne({ email: email, password: password })
        if (!validLogin) return res.status(400).send({ status: false, message: "The cridentials are Incorrect" })

        let id = validLogin._id
        let token = jwt.sign({
            userId: id.toString(),
            name: "Group 68",
            members: "4",
        }, "our_first_project")
        res.header('x-api-key', token)
        return res.status(200).send({ status: true, data: token })
    }
    catch (err) {
        return res.status(500).send(err.message)
    }
}

module.exports.createAuthor = createAuthor
module.exports.loginAuthor = loginAuthor