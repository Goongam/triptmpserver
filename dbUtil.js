const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('info.db');


async function checkDuplicationNickname(nickname){
    return new Promise((resolve, reject)=>{
        db.get(`select * from users where nickname = '${nickname}'`, (err, row) => {
            if(err){
                reject();
            }else if(!row){
                resolve();
            }else{
                reject('닉네임 중복 됨');
            }
        })
    })
}
async function createUser(user_id, nickname){
    return new Promise((resolve, reject)=>{
        const stmt = db.prepare('INSERT INTO users (user_id, nickname) values (?, ?);');
        stmt.run(user_id, nickname);
        stmt.finalize((err) => {
            if(err) {
                console.error(err);
                reject();
            }else{
                resolve();
            }

        })
    })
}

//insert into score_ranking VALUES ('test1','1231',1000,'testCLEAR',datetime('now','localtime'));  
async function insertRank(song_id, user_id, score, progress){
      
    return new Promise((resolve, reject)=>{
        db.get(`SELECT * FROM score_ranking where song_id='${song_id}' and user_id = '${user_id}'`, (err, row) => {
          
            if(err) reject(err);
            
            

            if(!row) {//첫 입력    
                const stmt = db.prepare('INSERT INTO score_ranking (song_id, user_id, score, progress, time) VALUES (?, ?, ?, ?, datetime("now","localtime"))')
                stmt.run(song_id, user_id, +score, progress);
                stmt.finalize((err)=>{
                    if(err){
                        console.error(err);
                        reject();
                    }else {
                        resolve();
                    }
                });
            }else if(row.score < score){//기록 갱신    
                const stmt = db.prepare(`UPDATE score_ranking SET score=?, progress=? time=datetime("now","localtime") WHERE song_id=? and user_id=?`);
                stmt.run(score,progress, song_id, user_id);
                stmt.finalize((err)=> {
                    if(err){
                        console.error(err)
                        reject();
                    }else{
                        resolve();
                    }
                });
            }
            // console.log('row',row);
            
            // resolve(row);
        });
        
        
    })   
}

//SELECT * FROM score_ranking where song_id = '${song_id}'
//select song_id, nickname, score, progress, time from score_ranking, users where score_ranking.user_id = users.user_id and song_id = '1_Normal';
async function getRankBySong(song_id, type){

    return new Promise((resolve, reject)=>{
        db.all(`select song_id, nickname, score, progress, time from score_ranking, users where score_ranking.user_id = users.user_id and song_id = '${song_id}' order by score DESC;`, (err, rows) => {
            if(err) reject(err);
   
            const ranking = rows.map((row,index) => {return {...row, rank:index+1}});
            
            resolve(ranking);
        });
    })
}

const getMyRankQuery = (songId, user_id)=> {
    const q = `SELECT 
    (SELECT COUNT(*) 
     FROM score_ranking 
     WHERE song_id = '${songId}' AND score > (
         SELECT score 
         FROM score_ranking
         WHERE user_id='${user_id}' AND song_id = '${songId}'
         LIMIT 1
     )) AS UPPER,
    (SELECT COUNT(*) 
     FROM score_ranking 
     WHERE song_id = '${songId}' AND score <= (
         SELECT score 
         FROM score_ranking
         WHERE user_id='${user_id}' AND song_id = '${songId}'
         LIMIT 1
     )) AS LOWER;`
    return q;
}

const getRanks = (song_id, upper, limit) => 
`select * from score_ranking where song_id='${song_id}' order by score DESC, time ASC limit ${limit} offset ${upper};`;

async function getMyRankBySong(song_id, user_id){
    return new Promise((resolve, reject) => {
        db.get(getMyRankQuery(song_id, user_id), (err, row)=>{
            if(err) reject();

            const { UPPER, LOWER } = row;
            
            //20개
            let start = 0;
            let limit = 20;
            const minus10 = UPPER - 10;
            start = minus10 < 0 ? 0 : minus10;

            if(LOWER <= 10){
                const more = 10 - LOWER;
                start = start - more < 0 ? 0 : start - more;
            }

            db.all(getRanks(song_id, start, limit), (err, rows) => {
                if(err) reject();
            
                const ranking = rows
                    .map((row,index) => {return {...row, rank:index+1}});
                resolve(ranking);
            })
           
        })


    });
}

async function getScore(song_id, user_id){
    return new Promise((resolve, reject) => {
        db.get(`select * from score_ranking, users where score_ranking.user_id = users.user_id and score_ranking.song_id = '${song_id}' and score_ranking.user_id = '${user_id}';`, 
        (err, row)=>{
            if(err) reject(err);

           resolve(row);
        })
    });
}

async function getAllScoreByUser(user_id){
    return new Promise((resolve, reject) => {
        db.all(`select song_id as songID, score_ranking.user_id, score, progress, time, nickname from score_ranking, users where score_ranking.user_id = users.user_id and score_ranking.user_id = '${user_id}';`, 
        (err, rows)=>{
            if(err) reject(err);
           resolve(rows);
        });
    });
}


  function insertClothes(){

    const stmt = db.prepare(
    `INSERT INTO products (image, name, price, category) VALUES (?, ?, ?, ?);`
    );
    for (let i = 0; i < 10; i++) {
        stmt.run(clothes[i].image, clothes[i].name, clothes[i].price, clothes[i].category);
    }
    stmt.finalize();
  }

  
async function getAllProducts(){

    return new Promise((resolve, reject)=>{

        db.all("SELECT id, image, name, price, category FROM products", (err, rows) => {
            if(err) reject(err);
            resolve(rows);
        });

    })
    
}

async function getProduct(id){
    return new Promise((resolve, reject)=>{
        db.get(`SELECT id, image, name, price, category FROM products where id=${id}`, (err, row) => {
            if(err) reject(err);
            if(!row) reject();
            // console.log('row',row);
            
            resolve(row);
        });
    });
}

async function addProduct({image, name, price, category}){
    return new Promise((resolve, reject)=>{
        const stmt = db.prepare(
            `INSERT INTO products (image, name, price, category) VALUES (?, ?, ?, ?);`
        );
        stmt.run(image, name, price, category);
        stmt.finalize((err)=> reject());
        resolve();
    })   
}

async function updateProduct(id, updateData){
    let baseQurey = 'UPDATE products SET ';
    let setQuery = [];
    let params = [];
    for(const key in updateData){
        if(!updateData[key]) continue; 
        setQuery.push(`${key} = ?`);
        params.push(updateData[key]);
    }
    baseQurey += setQuery.join(', ');
    baseQurey += ` WHERE id = ${id};`;


    return new Promise((resolve, reject)=>{
        const stmt = db.prepare(baseQurey);
        stmt.run(...params);
        stmt.finalize((err)=> reject());

        resolve();
    })
}

async function deleteProduct(id){
    console.log(id);
    
    return new Promise((resolve, reject)=>{
        const stmt = db.prepare(
            `DELETE FROM products WHERE id = ?;`
        );
        stmt.run(id);
        stmt.finalize((err)=>reject());

        resolve();
    })
}

module.exports = {
    // getAllProducts, insertClothes, getProduct, addProduct, deleteProduct, updateProduct, 
    insertRank, 
    getRankBySong, 
    createUser, 
    checkDuplicationNickname, 
    getMyRankBySong, 
    getScore,
    getAllScoreByUser
};


