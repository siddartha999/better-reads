/**
 * Schema to keep track of the User actions.
 * The actions that are to be kept track are as follows:
        ${User} has rated ${book}.
        ${User} has marked ${book} as {R, C_R, W_T_R} 
        ${User} has updated the status of ${book} from ${R, C_R, W_T_R} to ${N, R, C_R, W_T_R}
        ${User} has set a target ${target} for ${book}
        ${User} has reviewed ${book}
        ${User} has updated the review for ${book}
 */

const mongoose = require('mongoose');

const userActionsSchema = mongoose.Schema({
    _id: {
        type: String,
        required: true
    },
    actions: {
        type: Array,
        default: []
    }
});

module.exports = mongoose.model('UserActions', userActionsSchema);