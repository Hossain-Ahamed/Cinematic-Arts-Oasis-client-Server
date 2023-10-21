const { getCollection } = require('./mongoConnect.js');

// user data  collection 
const allUserDataCollection = getCollection('all-user-data');

module.exports = { allUserDataCollection };