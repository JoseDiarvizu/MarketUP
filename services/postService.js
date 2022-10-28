const mysql = require("mysql");
const config = require("../config/dbconfig");
const db = mysql.createConnection(config);
const query = require("../config/query");
const { post } = require("../routes/pages");
let createPost = async (postName, description, userId, image, price) => {
  try {
    db.query('INSERT INTO posts (postName, description, userId, image, price) VALUES (?, ?, ?, ?, ?)', [postName, description, userId, image, price], async (error, results) => {
      return results;
    });

  } catch (err) {
    console.log(err)
  }
};

let getPosts = async () => {
  try {
    let results = await query.dbQuery('SELECT p.*, u.email, u.name, u.surname FROM posts as p INNER JOIN users as u ON p.userId = u.id;', []);
    return results;
  } catch (err) {
    console.log(err)
  }
};

let getUserPosts = async (userId) => {
  try {
    let results = await query.dbQuery('SELECT * from posts where userId = ?', [userId]);
    return results;
  } catch (err) {
    console.log(err)
  }
};

let deletePost = async (postId) => {
  try {
    let results = await query.dbQuery('DELETE from posts where postId = ?', [postId]);
    return results;
  } catch (err) {
    console.log(err)
  }
};

let updatePost = async (postId, postName, description, price) => {
  try {
    let results = await query.dbQuery('UPDATE posts set postName = ?, description = ?, price = ? WHERE postId = ?', [postName, description, price, postId]);
    return results;
  } catch (err) {
    console.log(err)
  }
};

let showPosts = async (postName) => {
  try {
    let results = await query.dbQuery('SELECT * FROM posts WHERE postName LIKE ?', [postName+'%']);
    return results;
  } catch (err) {
    console.log(err)
  }
};



module.exports = { createPost, getPosts, getUserPosts, deletePost, updatePost, showPosts};