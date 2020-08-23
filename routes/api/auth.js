const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const jwt = require('jsonwebtoken');
const config = require('config');
const { check, validationResult } = require('express-validator/check');
const User = require('../../models/User');
const bcrypt = require('bcryptjs');

// @route  GET api/auth
// @desc   test route
// @access Public
router.get('/', auth, async (req, res) => {
  try{
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch(err) {
    console.log(err.message);
    res.status(500).send("Sever Error")
  }
  //res.send('Auth route'));
});

// @route  POST api/auth
// @desc   authenticate user and get token
// @access Public
router.post(
	'/',
	[
		check('email', 'Please include a valid email').isEmail(),
		check('password', 'Password required').exists()
	],
	async (req, res) => {
		// console.log(req.body);
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		const { email, password } = req.body;

		try {
			// see if the user exists
			let user = await User.findOne({ email });

			if (!user) {
				return res
          .status(400)
          .json({ errors: [ { msg: 'Invalid credentials' } ] });
			}

      const isMatch = await bcrypt.compare(password, user.password);

      if(!isMatch) {
        return reg
          .status(400)
          .json({ errors: [{ msg: 'Invalid Credentials' }] });
      }


			// return the jsonwebtoken
			const payload = {
				user: {
					id: user.id
				}
			};

			jwt.sign(
        payload,
        config.get('jwtSecret'),
        { expiresIn: 360000 }, (err, token) => {
				      if (err) throw err;
				          res.json({ token });
			});

			//res.send('user registered');
		} catch (err) {
			console.error(err.message);
			res.status(500).send('server error');
		}
	}
);
module.exports = router;
