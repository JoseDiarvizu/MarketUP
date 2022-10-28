const services = require("../services/userService");

module.exports = {
    //find user by userid
    findUser: async(req,res) => {
        const body = req.body;
        console.log(req.body)
        let data = await services.findUser(body.id);
        return res.status(201).json({
            success: 1,
            data: data,
          });
    },
    confirmUser: async (req, res) => {
        //get all transfers where active user is involved
        const body = req.body;
        let data = await services.confirmUser(body.email);
        logger.info('Confirmed user');
        return res.redirect('/login');
      },
    
};