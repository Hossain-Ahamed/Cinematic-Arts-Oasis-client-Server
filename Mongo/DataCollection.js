const { getCollection } = require('./mongoConnect.js');

// user data  collection 
const allUserDataCollection = getCollection('all-user-data');


//follower collection
const followCollection = getCollection('follow-data')

//carts collection
const cartCollection = getCollection('carts-data')


//class collection
const classCollection = getCollection('class-data')


//store all the class of the teacher
const classInfoCollection = getCollection('class-info');

//store all the students of a class
const enrolledStudentOfClassCollection = getCollection('enrolled-student-by-class')

module.exports = {
    allUserDataCollection,
    cartCollection,
    classCollection,
    classInfoCollection,
    enrolledStudentOfClassCollection,
    followCollection
};