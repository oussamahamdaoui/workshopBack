const { connect } = require('mongoose');


const connectDb = () => connect('mongodb://localhost:27017/backworkshop', { useNewUrlParser: true, useUnifiedTopology: true });

module.exports = connectDb;
