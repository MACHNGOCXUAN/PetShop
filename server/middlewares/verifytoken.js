import jws from 'jsonwebtoken'

const verifyToken = (req, res, next) => {
  // const token = req.headers['authorization']?.split(' ')[1];
  const token = req.cookies.accessToken;
  
  
  if (!token) {
    return res.status(401).json({ message: 'Vui lòng đăng nhập' });
  }

  jws.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Token is not valid' });
    }
    req.user = decoded;
    next();
  });
}


const verifyTokenAndAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.role === 'admin') {
      next();
    } else {
      return res.status(403).json({ message: 'Bạn không có quyền truy cập' });
    }
  });
}

export const verifyMidedleware = {
  verifyToken,
  verifyTokenAndAdmin
}