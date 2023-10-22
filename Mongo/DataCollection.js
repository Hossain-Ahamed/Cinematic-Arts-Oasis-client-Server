const { getCollection } = require('./mongoConnect.js');

// user data  collection 
const allUserDataCollection = getCollection('all-user-data');


//follower collection
const followCollection = getCollection('follow-data')

//carts collection
const cartCollection = getCollection('carts-data')


//class collection
const classCollection = getCollection('class-data')

const classInfoCollection = getCollection('class-info') 

module.exports = { allUserDataCollection,cartCollection,classCollection ,classInfoCollection,followCollection};