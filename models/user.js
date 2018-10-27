var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

var userSchema = mongoose.Schema({
    fullname: {type: String, required: true},
    email: {type: String, required: true},
    password: {type: String, default: ''},
    role: {type: String, default: ''},
    company: {
        name: {type: String, default: ''},
        image: {type: String, default: ''}
    },
    passwordResetToken: {type: String, default: ''},
    passwordResetExpires: {type: Date, default: Date.now},
    facebook:  {
        id: {type: String, default: ''},
        token: {type: String, default: ''} 
    },
    google: {
        id: {type: String, default: ''},
        token: {type: String, default: ''} 
    }
});

userSchema.methods.encryptPassword = (password) => {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(10), null);
}

userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
};

module.exports = mongoose.model('User', userSchema);