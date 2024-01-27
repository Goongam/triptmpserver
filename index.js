const { login, verifyToken, loginTokenVerify } = require("./auth");
const {
  getAllProducts,
  insertClothes,
  getProduct,
  addProduct,
  deleteProduct,
  updateProduct,
  insertRank,
  getRankBySong,
  createUser,
  checkDuplicationNickname,
  getMyRankBySong,
  getScore,
  getAllScoreByUser,
} = require("./dbUtil");

// const verifyToken = require('./auth');

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const csp = require("helmet-csp");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const app = express();
const port = 5001;

const corsOptions = {
  origin: (origin, callback) => {
    callback(null, true);
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(helmet());
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: [
        "'self'",
        "http://localhost:5000",
        "http://localhost:5001",
        "http://ibdabackend.iptime.org:5001",
      ],
    },
  })
);

const data = [
  { city: "대한민국, 서울" },
  { city: "대한민국, 부산" },
  { city: "대한민국, 대구" },
  { city: "대한민국, 인천" },
  { city: "대한민국, 광주" },
  { city: "대한민국, 대전" },
  { city: "대한민국, 울산" },
  { city: "대한민국, 세종" },
  { city: "대한민국, 경기도" },
  { city: "대한민국, 강원도" },
  { city: "대한민국, 충청북도" },
  { city: "대한민국, 충청남도" },
  { city: "대한민국, 전라북도" },
  { city: "대한민국, 전라남도" },
  { city: "대한민국, 경상북도" },
  { city: "대한민국, 경상남도" },
  { city: "대한민국, 제주도" },
  { city: "라오스, 루앙프라방" },
  { city: "독일, 베를린" },
  { city: "멕시코, 멕시코 시티" },
  { city: "멕시코, 칸쿤" },
  { city: "브라질, 상파울루" },
  { city: "괌, 괌" },
  { city: "남아프리카공화국, 요하네스버그" },
  { city: "남아프리카공화국, 케이프타운" },
];

function getRandomData(){
  return data.map((d)=>{return {...d, count: Math.floor(Math.random() * 1001)}});
}


app.get("/ranking", async (req, res) => {
  const { range, year, month, season } = req.query;


  if (range === "month") {
    if (!year || !month)
      return res.status(400).send("잘못된 파라미터 year와 month입력 요망");
      const datas = getRandomData();
      const sortingData = datas.sort((a,b)=>b.count - a.count);

    return res.status(200).json(sortingData);
  }

  if (range === "season") {
    if (!season) return res.status(400).send("잘못된 파라미터 season입력 요망");

      const datas = getRandomData();
      const sortingData = datas.sort((a,b)=>b.count - a.count);

    return res.status(200).json(sortingData);
  }

  return res.status(400).send("잘못된 파라미터");

  if (song_id && user_id && score) {
    insertRank(song_id, user_id, score, progress)
      .then(() => {
        res.send("랭킹 입력 성공");
      })
      .catch(() => {
        res.status(401).send("랭킹 입력 에러");
      });
  } else {
    res.status(400).json({ error: "Invalid data" });
  }
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

/*
fetch('http://localhost:5000/todos/1',{
    method:'PATCH',
    headers:{
        'Content-Type':'application/json'
    },
    body:JSON.stringify({
        text:'new',
    })
})
.then(res => res.json())
.then((h)=>console.log(h));
 */

/**
 * id(key)
 * 사진
 * 의류이름
 * 가격
 * 카테고리
 * --상세정보--
 *
 */
