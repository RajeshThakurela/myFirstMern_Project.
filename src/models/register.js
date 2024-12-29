const mongoose = require('mongoose');
const validator= require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const employeeSchema = new mongoose.Schema({
    first_name:{
        type:String,
        required:true
    },
    last_name:{
        type:String,
        required:true
    },
    gender:{
        type:String,
        required:true
    },
    phone:{
        type:Number,
        required:true
    },
    age:{
        type:Number,
        required:true,
    },
    email:{
        type:String,
        required:true, 
        unique:true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error("Invalid Email");
                
            }
        }
    },
    password:{
        type:String,
        required:true
    },
    confirm_password:{
        type:String,
        required:true
    },
    tokens:[{
        token:{
            type:String,
            required:true
        }
    }]
});
// generatin tokens
employeeSchema.methods.generateAuthToken =  async function() {
    try {
        const token = jwt.sign({_id:this._id.toString()}, process.env.SECRET_KEY);
        this.tokens = this.tokens.concat({token:token});
        await this.save();
        return token;
    } catch (error) {
        res.send(`the error part ${error}`);
    }
}

// converting password into hash
employeeSchema.pre("save",async function(next){
    if(this.isModified("password")){
        // const passwordHash = await bcrypt.hash(password,10);
        this.password = await bcrypt.hash(this.password,10);
        console.log(`the current password is ${this.password}`);

        this.confirm_password = undefined;
    }

    next();
})
// now we need to create collection

const Register = new mongoose.model("Register",employeeSchema);

module.exports = Register;