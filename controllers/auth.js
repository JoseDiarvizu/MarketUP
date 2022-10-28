const mysql = require("mysql");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { promisify } = require('util');
const config = require("../config/dbconfig");
const logger = require('../logger/logger');
const db = mysql.createConnection(config);
const transporter = require('../config/transporter');


exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    //check if there is an email or paswword in request
    if (!email || !password) {
      logger.info('Missing email or password');
      return res.status(400).render('login', {
        message: 'Please provide an email and password'
      })
    }
    //grab user using provided email
    db.query('SELECT * FROM users WHERE email = ?', [email], async (error, results) => {
      logger.info('Wrong email or password');
      //if password matches, create a cookie for user session
      if (!results || !(await bcrypt.compare(password, results[0].password))) {
        res.status(401).render('login', {
          message: 'El correo o la contraseña son incorrectos'
        })

      }
      else if (!results[0].confirmed) {
        res.status(401).render('login', {
          message: 'Por favor confirma tu correo'
        })
      }
      else {
        logger.info('Succesfully logged in');
        const id = results[0].id;

        const token = jwt.sign({ id }, process.env.JWT_SECRET, {
          expiresIn: process.env.JWT_EXPIRES_IN
        });

        console.log("The token is: " + token);

        const cookieOptions = {
          expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000
          ),
          httpOnly: true
        }

        res.cookie('jwt', token, cookieOptions);
        res.status(200).redirect("/");
      }

    })

  } catch (error) {
    console.log(error);
  }
}

exports.register = (req, res) => {
  console.log(req.body);

  const { name, surname, username, email, password, passwordConfirm } = req.body;
  //verify if given email is already in use
  db.query('SELECT email, username FROM users WHERE email = ? and username = ?', [email, username], async (error, results) => {
    if (error) {
      console.log(error);
    }
    if (results.length > 0) {
      logger.info('That email or username is already in use');
      return res.render('register', {
        message: 'That email or username is already in use'
      })
      //verify if passwords match
    } else if (password !== passwordConfirm) {
      logger.info('Passwords do not match');

      return res.status(200).render('register', {
        message: 'Passwords do not match'
      });
    }

    jwt.sign(
      {
        user: email,
      },
      process.env.JWT_SECRET_EMAIL,
      {
        expiresIn: '1d',
      },
      (err, emailToken) => {

        const url = `http://localhost:5001/auth/confirmation/${emailToken}`;
        try {
          transporter.sendMail({
            from: process.env.GMAIL_USER,
            to: email,
            subject: 'Confirm Email',
            html: `Please click this email to confirm your email: <a href="${url}">${url}</a>`,
          });
        } catch (error) {
          console.log(error);
        }
        
      },
    );


    //encrypt password for database storage
    let hashedPassword = await bcrypt.hash(password, 8);
    console.log(hashedPassword);
    //insert new user into the database
    db.query('INSERT INTO users SET ?', { name: name, surname: surname, username: username, email: email, password: hashedPassword }, (error, results) => {
      if (error) {
        console.log(error);
      } else {
        console.log(results);
        logger.info('User registered');
        return res.render('login');
      }
    })


  });

}

exports.isLoggedIn = async (req, res, next) => {
  // console.log(req.cookies);
  if (req.cookies.jwt) {
    try {
      //1) verify the token
      const decoded = await promisify(jwt.verify)(req.cookies.jwt,
        process.env.JWT_SECRET
      );

      //2) Check if the user still exists
      db.query('SELECT * FROM users WHERE id = ?', [decoded.id], (error, result) => {
        if (!result) {
          return next();
        }
        req.user = result[0];
        return next();
      });
    } catch (error) {
      console.log(error);
      return next();
    }
  } else {
    next();
  }
}

exports.logout = async (req, res) => {
  //destroy cookie to logout
  res.cookie('jwt', 'logout', {
    expires: new Date(Date.now() + 2 * 1000),
    httpOnly: true
  });
  logger.info('User logged out');
  res.status(200).redirect('/');
}