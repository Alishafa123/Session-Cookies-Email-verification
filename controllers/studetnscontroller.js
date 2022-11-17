const express=require("express");
const bodyparse=require("body-parser");
const mysql=require("mysql");
const multer=require("multer");
const app=express();
const encoded=bodyparse.urlencoded();
const pdf = require (html.pdf);
const fs = require ('fs');
const options = {format:"A4"};


exports.read = (req, res) => {
    let sql = "select * from students";
    con.query(sql,(err,data)=>{
        if(err){
            throw err;
            console.log("Error in SQL querry");
        }
        res.render{
            ""
        }
    })
    }