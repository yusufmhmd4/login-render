const express = require("express");
const app = express();
app.use(express.json())
const bcrypt =require("bcrypt")
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const path = require("path");
const dbPath = path.join(__dirname, "users.db");

let db = null;

const initializeServerAndDatabase = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3008, () => {
      console.log(`Server started on http://localhost:3008/`);
    });
  } catch (e) {
    console.log(`DB Error : ${e.message}`);
  }
};

initializeServerAndDatabase();


app.post("/register",async (request,response)=>{
    const { name,username,password}=request.body;

    const dbUser=await db.get(`SELECT * FROM user WHERE username=?`,[username])
    if(dbUser===undefined){
        const hashedPassword=await bcrypt.hash(password,10);
        const createNewUserQuery=`
        INSERT INTO user(name,username,password)
        VALUES
        (?,?,?);
        `
        const postUser=await db.run(createNewUserQuery,[name,username,hashedPassword])
        const userId=postUser.lastID;
        response.send(userId)
    }else{
        response.status=400;
        response.send("User Already Exits")
    }
})


app.post("/login",async(request,response)=>{
    const {username,password}=request.body;
    const dbUser=await db.get(`SELECT * FROM user WHERE username = ?`,[username])
    if(dbUser!==undefined){
        const isPasswordSame=await bcrypt.compare(password,dbUser.password)
        if(isPasswordSame){
            response.status=200;
            response.send("Login Sucecss")
        }else{
            response.status=400;
            response.send("Password Not Same")
        }
    }else{
        response.status=400;
        response.send("user Not Found")
    }
})