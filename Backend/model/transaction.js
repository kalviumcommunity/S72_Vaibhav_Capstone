const mongoose  = require('mongoose');

const transactionSchema = new mongoose.Schema({
    taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
    fromUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, 
    toUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },   
    credits: { type: Number, required: true },  
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Transaction', transactionSchema);