const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true, match: /.+\@.+\..+/  },
    password: { type: String, required: true },
    isActive: { type: Boolean, default: false },
    activationToken: { type: String },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date }
}, { timestamps: true });

// Hash the password before saving the user
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    console.log('Hashed Password before saving:', this.password); // Add this line
    next();
});


// Compare passwords for login
userSchema.methods.comparePassword = async function (candidatePassword) {
    console.log('Candidate Password:', candidatePassword); // Log the candidate password
    console.log('Stored Hashed Password:', this.password); // Log the stored hashed password
    return bcrypt.compare(candidatePassword, this.password);
};


const User = mongoose.model('User', userSchema);
module.exports = User;
