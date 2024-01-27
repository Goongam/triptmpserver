const jwt = require('jsonwebtoken');
require('dotenv').config();

let userList = [
  {
    name: '테스트계정1',
    id: 'test1',
    password: 'password1'
  },
  {
    name: '테스트계정2',
    id: 'test2',
    password: 'password2'
  }
]


function authenticateUser(id, password) {
    // 사용자 인증 로직 구현

    const findUser = userList.find((user)=>{
      return user.id === id && user.password === password
    })
    
    return findUser;
  }

function login(req, res){    
    const { id, password} = req.body;
    // console.log(req.body);
    // console.log(process.env.EXPRESS_SECRET);
    
    
    const user = authenticateUser(id, password)
    if (user) { 
      console.log('id pass로 로그인');
        //로그인 성공 및 토큰발급
      const token = jwt.sign({name:user.name}, process.env.EXPRESS_SECRET,{
        expiresIn: '15m', // 만료시간
        issuer: '토큰발급자',
    });
      res.json({ token, user: user.name });
    } else {
      res.status(401).json({ error: '인증 실패' });
    }
  }

function loginTokenVerify(req, res, next){
  const token = req.headers.authorization;
  if(!token) {
    next();
    return;
  }

  jwt.verify(token, process.env.EXPRESS_SECRET, (err, decoded) => {
    if (err) {
      // return res.status(401).json({ error: '인증 실패' });
      next();
      return;
    }
    console.log('토큰으로 로그인');
    
    res.status(200).json({ token, user: decoded.name });
    
  });
  return;
}

function verifyToken(req, res, next) {
    const token = req.headers.authorization;
    console.log('verify:',token);
    
    if (!token) {
        return res.status(401).json({ error: '인증 실패' });
    }

    jwt.verify(token, process.env.EXPRESS_SECRET, (err, decoded) => {
        if (err) {
        return res.status(401).json({ error: '인증 실패' });
        }
        req.user = decoded.name;
        next();
    });
}

module.exports = {
    login, verifyToken, loginTokenVerify
}

/*
로그인
fetch('http://localhost:5000/login', {
    method:"POST",
    headers:{
        'Content-Type':'application/json'
    },
    body:JSON.stringify({
        username:'test', password:'password'
    })
})
 */
/* 인증
fetch('http://localhost:5000/protected',{
    headers:{'authorization':'tokenString'
    }
})

*/
/* 토큰으로 로그인

fetch('http://localhost:5000/login',{
    method:"POST",
    headers:{'authorization':'tokenstring'
    }
})

*/