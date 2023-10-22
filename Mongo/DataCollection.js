const { getCollection } = require('./mongoConnect.js');

// user data  collection 
const allUserDataCollection = getCollection('all-user-data');


//follower collection
const followerCollection = getCollection('follow-data')


//follower collection
const classCollection = getCollection('class-data')

module.exports = { allUserDataCollection,followerCollection,classCollection };