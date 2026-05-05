const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");


const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    created: {
        type: Date,
        default: Date.now,
    },
    polls: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Poll",
    }],

});

userSchema.pre('save', async function () {
    try {
        if (!this.isModified('password')) return;

        const hashed = await bcrypt.hash(this.password, 10);
        this.password = hashed;
    } catch (err) {
        throw err;
    }
})

userSchema.methods.comparePassword = async function (attempt) {
    try {
        return await bcrypt.compare(attempt, this.password);
    } catch (err) {
        throw err;
    }
}

module.exports = mongoose.model('User', userSchema);
