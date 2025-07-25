const jwt = require('jsonwebtoken')

const authMiddleWare = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if(!token) {
    return res.status(401).json({
      message: 'Token missing or invalid'
    })
  }


  try{
    const verified = jwt.verify(token,process.env.JWT_SECRET)
    if(verified && verified.userId) {
      req.userId = verified.userId
      next()
    }
    else{
      return res.status(403).json({ message: 'Forbidden' });
    }
  } catch (error) {
    res.status(401).json({
      message: 'Unauthorized'
    })
  }
}

module.exports = authMiddleWare