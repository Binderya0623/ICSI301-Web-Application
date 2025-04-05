const mongoose = require("mongoose");
mongoose.Promise = require("bluebird");
mongoose.set("strictQuery", false);
mongoose.connect("mongodb://127.0.0.1/cs142project6", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Get the models
const cs142models = require("./modelData/photoApp.js").cs142models;
const User = require("./schema/user.js");
const Photo = require("./schema/photo.js");
const Mention = require("./schema/mention.js");  // Import Mention schema
const SchemaInfo = require("./schema/schemaInfo.js");

const versionString = "1.0";

// Clear the existing collections
const removePromises = [
  User.deleteMany({}),
  Photo.deleteMany({}),
  Mention.deleteMany({}),  // Clear Mention collection
  SchemaInfo.deleteMany({}),
];

// Utility function to extract user IDs mentioned in a comment
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
    // Load the users
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
          userObj.save();
          mapFakeId2RealId[user._id] = userObj._id;
          user.objectID = userObj._id;
          console.log("Adding user:", user.first_name + " " + user.last_name, " with ID ", user.objectID);
        })
        .catch(function (err) {
          console.error("Error creating user", err);
        });
    });

    const allPromises = Promise.all(userPromises).then(function () {
      // Load the photos
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
                
                // Handle mentions in comments
                const mentionedUserIds = extractMentions(comment.comment, mapFakeId2RealId);
                mentionedUserIds.forEach(userId => {
                  mentionPromises.push(Mention.create({
                    user_id: userId,
                    photo_id: photoObj._id,
                    comment_id: comment._id,
                    date_time: new Date(),
                  }));
                });
              });
            }

            photoObj.save();
            console.log("Adding photo:", photo.file_name, " of user ID ", photoObj.user_id);
            return Promise.all(mentionPromises);
          })
          .catch(function (err) {
            console.error("Error creating photo", err);
          });
      });

      return Promise.all(photoPromises).then(function () {
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