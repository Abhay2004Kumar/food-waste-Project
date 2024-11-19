import mongoose, {Schema} from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt"

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    firstname: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    lastname: {
        type: String,
        required: false,
        unique: true,
        trim: true
    },
    contact: {
        type: Number,
        required: true
    },
    password: {
        type: String,
        required: [true,'Password is required']
    },
    refreshToken: {
        type: String
    }

},
{timestamps: true}
)

//encrypt the password just before saving it using mongoose middleware pre hook
userSchema.pre("save", async function(next) {
    if(this.isModified("password")){
        this.password = await bcrypt.hash(this.password, 10)
    next()
    }
    return next()

})

//custom method
userSchema.methods.isPasswordCorrect = async function(password) {
    if (!password || !this.password) {
        console.log("password provided:", password);
        console.log("stored hash:", this.password);
        throw new Error("Password or hash is missing");
    }
return await bcrypt.compare(password, this.password)
} 

userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            firstname: this.firstname
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id: this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model("User",userSchema)