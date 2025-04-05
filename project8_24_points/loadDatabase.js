/**
 * This Node.js program loads the CS142 Project 6 model data into Mongoose
 * defined objects in a MongoDB database. It can be run with the command:
 *     node loadDatabase.js
 * be sure to have an instance of the MongoDB running on the localhost.
 *
 * This script loads the data into the MongoDB database named 'cs142project6'.
 * In loads into collections named User and Photos. The Comments are added in
 * the Photos of the comments. Any previous objects in those collections is
 * discarded.
 *
 * NOTE: This scripts uses Promise abstraction for handling the async calls to
 * the database. We are not teaching Promises in CS142 so strongly suggest you
 * don't use them in your solution.
 */

// We use the Mongoose to define the schema stored in MongoDB.
const mongoose = require("mongoose");
mongoose.Promise = require("bluebird");
mongoose.set("strictQuery", false);
mongoose.connect("mongodb://127.0.0.1/cs142project6", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Get the magic models we used in the previous projects.
const cs142models = require("./modelData/photoApp.js").cs142models;

// Load the Mongoose schema for Use and Photo
const User = require("./schema/user.js");
const Photo = require("./schema/photo.js");
const SchemaInfo = require("./schema/schemaInfo.js");
// шинээр үүсгэсэн model-ууд:
const Mention = require("./schema/mention.js");
const Activity = require("./schema/activity.js");

const versionString = "1.0";

// We start by removing anything that existing in the collections.
const removePromises = [
  User.deleteMany({}),
  Photo.deleteMany({}),
  SchemaInfo.deleteMany({}),
  // шинээр үүсгэсэн model-уудаа мөн цэвэрлэнэ.
  Mention.deleteMany({}),
  Activity.deleteMany({}),
];

// сэтгэгдлээс mention хийгдсэн хэрэглэгчийн id-ийг ялгаж авах utility function
function extractMentions(commentText, mapFakeId2RealId) {
  const mentionedUsernames = commentText.match(/@\w+/g) || [];
  return mentionedUsernames.map(username => {
    const usernameWithoutAt = username.slice(1);
    const user = Object.values(mapFakeId2RealId).find(userId => {
      return User.findOne({ login_name: usernameWithoutAt })._id.equals(userId);
    });
    return user ? user._id : null;
  }).filter(Boolean);
}

Promise.all(removePromises)
  .then(function () {
    // Load the users into the User. Mongo assigns ids to objects so we record
    // the assigned '_id' back into the cs142model.userListModels so we have it
    // later in the script.
    const userModels = cs142models.userListModel();
    const mapFakeId2RealId = {};
    const userPromises = userModels.map(function (user) {
      return User.create({
        first_name: user.first_name,
        last_name: user.last_name,
        location: user.location,
        description: user.description,
        occupation: user.occupation,
        login_name: user.last_name.toLowerCase(),
        password: 'weak'
      })
        .then(function (userObj) {
          // Set the unique ID of the object. We use the MongoDB generated _id
          // for now but we keep it distinct from the MongoDB ID so we can go to
          // something prettier in the future since these show up in URLs, etc.
          userObj.save();
          mapFakeId2RealId[user._id] = userObj._id;
          user.objectID = userObj._id;
          console.log(
            "Adding user:", 
            user.first_name + " " + user.last_name, 
            " with ID ", 
            user.objectID
          );

          // хэрэглэгч бүртгүүлэх үед activity үүсгэнэ.
          return Activity.create({
            user_id: userObj._id,
            activity_type: 'User Registration',
            date_time: new Date(),
          });
        })
        .catch(function (err) {
          console.error("Error creating user", err);
        });
    });

    const allPromises = Promise.all(userPromises).then(function () {
      // Once we've loaded all the users into the User collection we add all the
      // photos. Note that the user_id of the photo is the MongoDB assigned id
      // in the User object.
      const photoModels = [];
      const userIDs = Object.keys(mapFakeId2RealId);
      userIDs.forEach(function (id) {
        photoModels.push(...cs142models.photoOfUserModel(id));
      });

      const photoPromises = photoModels.map(function (photo) {
        return Photo.create({
          file_name: photo.file_name,
          date_time: photo.date_time,
          user_id: mapFakeId2RealId[photo.user_id],
          likes: [],
        })
          .then(function (photoObj) {
            photo.objectID = photoObj._id;
            const mentionPromises = [];

            if (photo.comments) {
              photo.comments.forEach(function (comment) {
                photoObj.comments.push({
                  comment: comment.comment,
                  date_time: comment.date_time,
                  user_id: mapFakeId2RealId[comment.user._id],
                });

                // сэтгэгдэл дэх mention-ийг бүртгэнэ.
                const mentionedUserIds = extractMentions(comment.comment, mapFakeId2RealId);
                mentionedUserIds.forEach(userId => {
                  mentionPromises.push(Mention.create({
                    user_id: userId,
                    photo_id: photoObj._id,
                    comment_id: comment._id,
                    date_time: new Date(),
                  }));
                });

                // шинэ сэтгэгдэл оруулсан болох activity-ийг бүртгэнэ.
                mentionPromises.push(Activity.create({
                  user_id: mapFakeId2RealId[comment.user._id],
                  activity_type: 'New Comment',
                  photo_id: photoObj._id,
                  date_time: comment.date_time,
                }));
              });
            }

            photoObj.save();
            console.log("Adding photo:", photo.file_name, " of user ID ", photoObj.user_id);

            // шинэ зураг оруулсан болох activity-ийг бүртгэнэ.
            return Promise.all(mentionPromises).then(() => {
              return Activity.create({
                user_id: photoObj.user_id,
                activity_type: 'Photo Upload',
                photo_id: photoObj._id,
                date_time: photoObj.date_time,
              });
            });
            // эдгээр нь loadDatanase.js-ийг ажиллуулах үед мөн activity үүсгэхэд хэрэгтэй.
          })
          .catch(function (err) {
            console.error("Error creating photo", err);
          });
      });

      return Promise.all(photoPromises).then(function () {
        // Create the SchemaInfo object
        return SchemaInfo.create({ version: versionString })
          .then(function (schemaInfo) {
            console.log("SchemaInfo object created with version ", schemaInfo.version);
          })
          .catch(function (err) {
            console.error("Error creating schemaInfo", err);
          });
      });
    });

    allPromises.then(function () {
      mongoose.disconnect();
    });
  })
  .catch(function (err) {
    console.error("Error during database initialization", err);
  });