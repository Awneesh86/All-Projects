const mongoose = require("mongoose");

//============ Using Regex for Email Validation =================//
const isValidEmail = function (value) {
  let emailRegex =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-z\-0-9]+\.)+[a-z]{2,}))$/;
  if (emailRegex.test(value)) return true;
};

//===============================================================//
const isValids = function (value) {
  if (typeof value === "undefined" || value === null) return false;
  if (typeof value === "string" && value.trim().length === 0) return false;
  return true;
};

//============== Using Regex for Password Validation ===============//
const isValidPassword = function (pw) {
  let pass = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[#$^+=!*()@%&]).{8,15}$/;
  if (pass.test(pw)) return true;
};

//============== Using Regex For Valid Name =======================//
const isValidName = function (name) {
  let names = /^[-a-zA-Z_:,.' ']{1,100}$/;
  if (names.test(name)) return true;
};

//================================================================//
const isValidString = function (value) {
  if (typeof value === "undefined" || value === null) return false;
  if (typeof value === "string" && value.trim().length === 0) return false;
  return true;
};

//=================================================================//
const keyValid = function (value) {
  if (Object.keys(value).length > 0) return true;
  return false;
};

//==================================================================//
const idCharacterValid = function (value) {
  return mongoose.Types.ObjectId.isValid(value);
};

module.exports = { isValidEmail, isValids, isValidPassword, isValidName, isValidString, keyValid, idCharacterValid };
