/**
 * This builds on the webServer of previous projects in that it exports the
 * current directory via webserver listing on a hard code (see portno below)
 * port. It also establishes a connection to the MongoDB named 'cs142project6'.
 *
 * To start the webserver run the command:
 *    node webServer.js
 *
 * Note that anyone able to connect to localhost:portNo will be able to fetch
 * any file accessible to the current user in the current directory or any of
 * its children.
 *
 * This webServer exports the following URLs:
 * /            - Returns a text status message. Good for testing web server
 *                running.
 * /test        - Returns the SchemaInfo object of the database in JSON format.
 *                This is good for testing connectivity with MongoDB.
 * /test/info   - Same as /test.
 * /test/counts - Returns the population counts of the cs142 collections in the
 *                database. Format is a JSON object with properties being the
 *                collection name and the values being the counts.
 *
 * The following URLs need to be changed to fetch there reply values from the
 * database:
 * /user/list         - Returns an array containing all the User objects from
 *                      the database (JSON format).
 * /user/:id          - Returns the User object with the _id of id (JSON
 *                      format).
 * /photosOfUser/:id  - Returns an array with all the photos of the User (id).
 *                      Each photo should have all the Comments on the Photo
 *                      (JSON format).
 */

const mongoose = require("mongoose");
mongoose.Promise = require("bluebird");
var ObjectId = require('mongodb').ObjectId; 
const async = require("async");
const express = require("express");

// файл системд файлыг бичихийн тулд fs-ыг ашиглана
const fs = require("fs");

/**  
 * Project 7 нэмэлт модулиуд
 * express-session - Express сесс нь сессийн удирдлагыг зохицуулахаас илүү 
 *                   Express middleware давхарга юм.
 * body-parser     - body-parser нь HTTP хүсэлтийн биетийг задлан шинжлэхэд 
 *                   зориулагдсан Express middleware давхарга юм. Үүнийг 
 *                   серверийн API-д ашигладаг JSON-оор кодлогдсон POST хүсэлтийн 
 *                   биетүүдийг задлан шинжлэхэд ашиглаж болно. Жишээлбэл, хэрэв 
 *                   parameter_name бүхий JSON объектоос бүрдсэн биеттэй хүсэлтийг 
 *                   дамжуулбал энэ нь Express хүсэлт зохицуулагч дээр 
 *                   request.body.parameter_name хэлбэрээр харагдана.
 * multer          - multer нь зураг байршуулахад шаардлагатай олон хэсэгтэй 
 *                   маягтуудыг боловсруулах чадвартай өөр нэг Express middleware
 *                   body parser юм.
*/
const session = require("express-session");
const bodyParser = require("body-parser");
const multer = require("multer");

// Mongoose schema-үүдийг ачаална.
const User = require("./schema/user.js");
const Photo = require("./schema/photo.js");
const SchemaInfo = require("./schema/schemaInfo.js");
const Mention = require("./schema/mention.js");  // Import Mention schema

const app = express();

// "uploadedphoto" нэртэй нэг ширхэг файлыг хүлээн авна. Энэ ганц файлыг req.file-д хадгална.
const processFormBody = multer({ 
  storage: multer.memoryStorage() 
}).single("uploadedphoto");  

/**
 * Энд secretKey нь сесс күүкийг криптографаар хамгаалахад ашигладаг secret юм. 
 * Зураг байршуулах кодонд multer middleware-ийг ашиглана.
 */
app.use(session({
  secret: "secretKey", 
  resave: false, 
  saveUninitialized: false
}));

app.use(bodyParser.json());

// XXX - Your submission should work without this line. Comment out or delete
// commented
// const cs142models = require("./modelData/photoApp.js").cs142models;
mongoose.set("strictQuery", false);
mongoose.connect("mongodb://127.0.0.1/cs142project6", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// We have the express static module
// (http://expressjs.com/en/starter/static-files.html) do all the work for us.
app.use(express.static(__dirname));

// Хэрэглэгч нэвтэрсэн эсэхийг шалгана, зөвхөн нэвтэрсэн хэрэглэгч дараагийн алхамыг үргэлжлүүлэх боломжтой.
function hasSessionRecord(request, response, next) {
  if (request.session.userIdRecord) {
    console.log("Session: detect current user");
    next();
  }
  else {
    console.log("Session: NO active user!");
    response.status(401).json({ message: 'Unauthorized' });
  }
}

app.get("/", hasSessionRecord, function (request, response) {
  response.send("Simple web server of files from " + __dirname);
});

/**
 * URL-д дамжуулж буй аргументыг зохицуулахын тулд экспрессийг ашиглана. 
 * Энэ .get нь экспрессийг /test/<something>-тэй URL-уудыг хүлээн авч, 
 * request.params.p1 доторх ямар нэг зүйлийг буцаана.
 * 
 * Хэрэв get-ыг дараах байдлаар хэрэгжүүлбэл:
 * /test        - Өгөгдлийн сангийн SchemaInfo объектыг JSON форматаар буцаана.
 *                Энэ нь MongoDB-тэй холбогдсон холболтыг шалгахад тохиромжтой.
 * /test/info   - /test-тэй адил.
 * /test/counts - Янз бүрийн collection-ий тоо бүхий объектыг JSON форматаар буцаана
 */
app.get("/test/:p1", function (request, response) {
  // Express parses the ":p1" from the URL and returns it in the request.params
  // objects.
  console.log("/test called with param1 = ", request.params.p1);

  const param = request.params.p1 || "info";

  if (param === "info") {
    // Fetch the SchemaInfo. There should only one of them. The query of {} will
    // match it.
    SchemaInfo.find({}, function (err, info) {
      if (err) {
        // Query returned an error. We pass it back to the browser with an
        // Internal Service Error (500) error code.
        console.error("Error in /user/info:", err);
        response.status(500).send(JSON.stringify(err));
        return;
      }
      if (info.length === 0) {
        // Query didn't return an error but didn't find the SchemaInfo object -
        // This is also an internal error return.
        response.status(500).send("Missing SchemaInfo");
        return;
      }

      // We got the object - return it in JSON format.
      console.log("SchemaInfo", info[0]);
      response.end(JSON.stringify(info[0]));
    });
  } else if (param === "counts") {
    // In order to return the counts of all the collections we need to do an
    // async call to each collections. That is tricky to do so we use the async
    // package do the work. We put the collections into array and use async.each
    // to do each .count() query.
    const collections = [
      { name: "user", collection: User },
      { name: "photo", collection: Photo },
      { name: "schemaInfo", collection: SchemaInfo },
    ];
    async.each(
      collections,
      function (col, done_callback) {
        col.collection.countDocuments({}, function (err, count) {
          col.count = count;
          done_callback(err);
        });
      },
      function (err) {
        if (err) {
          response.status(500).send(JSON.stringify(err));
        } else {
          const obj = {};
          for (let i = 0; i < collections.length; i++) {
            obj[collections[i].name] = collections[i].count;
          }
          response.end(JSON.stringify(obj));
        }
      }
    );
  } else {
    // If we know understand the parameter we return a (Bad Parameter) (400)
    // status.
    response.status(400).send("Bad param " + param);
  }
});

/**
 * *****************************************************************************
 * ********************** GET хүсэлт орж ирвэл: *******************************
 * *****************************************************************************
 * */
app.get("/user/list", hasSessionRecord, function (request, response) {
  const searchQuery = request.query.q || "";
  
  User.find({
    $or: [
      { first_name: { $regex: searchQuery, $options: "i" } },
      { last_name: { $regex: searchQuery, $options: "i" } }
    ]
  }, function(err, users) {
    if (err) {
      console.log("userList-ийг авахад алдаа гарлаа!");
      response.status(500).send(JSON.stringify(err));
    } else {
      console.log("userList-ийг амжилттай авлаа!");
      const userList = users.map(user => {
        const { first_name, last_name, _id } = user;
        return { first_name, last_name, _id };
      });
      response.json(userList);
    }
  });
});

app.get("/user/:id", hasSessionRecord, function (request, response) {
  const id = request.params.id;
  User.findOne({_id: id}, function(err, user) {
    if (err) {
      console.log(`${id} ID-тай хэрэглэгч олдсонгүй!`);
      response.status(400).send(JSON.stringify(err));
    } else {
      console.log(`${id} ID-тай хэрэглэгчийг уншлаа!`);
      // Mongoose-ээс ирсэн өгөгдлийг JS-ийн объект болгож задлана
      const userObj = JSON.parse(JSON.stringify(user));
      response.status(200).json(userObj);
    }
  });
});

// app.get('/photosOfUser/:id', hasSessionRecord, function (request, response) {
//   var id = request.params.id;
//   Photo.find({user_id: id}, (err, photos) => {
//     if (err) {
//         response.status(400).json({ message: `${id} ID-тай хэрэглэгчийн зураг олдсонгүй!` });
//     } else {
//       console.log(`Server: ${id} ID-тай хэрэглэгчийн зургийг амжилттай уншлаа!`);
//       let count = 0;
//       // Mongoose-ээс ирсэн өгөгдлийг JS-ийн объект болгож задлана
//       const photoList = JSON.parse(JSON.stringify(photos));
//       // нийт байх ёстой сэтгэглийн тоог тоолно
//       photoList.forEach(photo => {
//         // хариу илгээхээс өмнө шаардлагагүй мэдээллийг арилгана.
//         delete photo.__v;
//         async.eachOf(photo.comments, (comment, index, callback) => {
//           // тухайн сэтгэгдлийг бичсэн хэрэглэгчийг мөн өгөгдлийн сангаас хайж олох шаардлагатай.
//           User.findOne({_id: comment.user_id}, (error, user) => {
//             if (!error) {
//               // Mongoose-ээс ирсэн өгөгдлийг JS-ийн объект болгож задлана
//               const userObj = JSON.parse(JSON.stringify(user));
//               // бүтцийг задлан утга оноох замаар шаардлагатай өгөгдлүүдээ ялгаж авна.
//               const {location, description, occupation, __v, ...rest} = userObj;
//               // олж авсан өгөгдлөө харгалцах зургийн объектод оноож өгнө.
//               photo.comments[index].user = rest;
//               // шаардлагагүй шинжийг арилгана.
//               delete photo.comments[index].user_id;
//             }
//             callback(error);
//           });
//         }, error => {
//           count += 1;
//           if (error) {
//             response.status(400).json({ message: "Сэтгэгдлийг уншихад алдаа гарлаа." });
//           } else if (count === photoList.length) {
//             // aysnc.each() ажиллаж дуусахад хүсэлтэд хариу илгээнэ.
//             response.status(200).json(photoList);
//           }
//         });
//       });
//     }
//   });    
// });

/**
 * *****************************************************************************
 * ********************** POST хүсэлт орж ирвэл: *******************************
 * *****************************************************************************
 * */
app.post('/admin/login', (request, response) => {
  User.findOne({ login_name: request.body.login_name })
    .then(user => {
      if (!user) {
        // өгөгдлийн сангаас вебэд нэвтэрч буй хэрэглэгчийн нэвтрэх нэр 
        // олдохгүй бол 400 status-аар хариу илгээнэ.
        console.log("Хэрэглэгч олдсонгүй.");
        response.status(400).json({ message: `${request.body.login_name} хэрэглэгч олдсонгүй, дахин оролддоно уу. ` });
      } 
      else if (user.password !== request.body.password) {
        console.log("Server: Нууц үг буруу. ");
        response.status(400).json({ message: `Нууц үг буруу байна.` });
      }
      else {
        // Login name found, reply with information for logged in user
        console.log("Server: Хэрэглэгч амжилттай нэвтэрлээ. ");
        // Mongoose-ээс ирсэн өгөгдлийг JS-ийн объект болгож задлана
        const userObj = JSON.parse(JSON.stringify(user));
        // Нэвтэрсэн хэрэглэгчийн user id-ийг session-д хадгална.
        request.session.userIdRecord = userObj._id;
        // Mongoose-ээс ирсэн өгөгдлийг JS-ийн объект болгож задласнаа хүсэлтийн хариу бологон илгээнэ.
        response.status(200).json({ first_name: userObj.first_name, _id: userObj._id });
      }
    })
    .catch(error => {
      console.error(`Server: Хэрэглэгч нэвтрэхэд алдаа гарлаа. ${error}.`);
      response.status(400).json({ message: "Алдаа гарлаа: " });
    });
});

app.post('/admin/logout', (request, response) => {
  if (!request.session.userIdRecord) {
    // хэрэглэгч нэвтрээгүй бол 400 status-аар хариу илгээнэ.
    response.status(400).json({ message: "Хэрэглэгч нэврээгүй байна." });
    console.log("Server: Аль хэдийн вебээс гарсан байна.");
  } else {
    // session-д хадгалсан хэрэглэгчийн мэдээллийг цэвэрлэнэ.
    request.session.destroy(err => {
      // session-ийг таслахад алдаа гарвал 400 status-аар хариу илгээнэ.
      if (err) {
        console.log("Server: Session-ийг таслахад алдаа гарлаа.");
        response.status(400).send();
      }
      else {
        console.log("Server: Session-ийг амжилттай таслалаа. ");
        response.status(200).send();
      }
    });
  }
});

app.post('/user', (request, response) => {
  const newUser = request.body;
  if (!(newUser.first_name && newUser.last_name && newUser.password && newUser.login_name)) {
    // Шаардлагатай мэдээллүүдийг бөглөөгүй бол 400 status-аар хариу илгээнэ.
    response.status(400).json({ message: "Нэвтрэх нэр, оөог, нэр, нууц үгийг заавал бөглөх шаардлагатай. " });
    return;
  }
  // Вебэд ижил нэвтрэх нэртэй хэрэглэгч байлгахгүйн тулд өгөгдлийн сангаас
  // бүртгүүлж буй хэрэглэгчийн оруулсан нэвтрэх нэр давхардсан эсэхийг шалгана.
  User.findOne({ login_name: newUser.login_name })
    .then(user => {
      if (user) {
        response.status(400).json({ message: "Нэвтрэх нэр аль хэдийн ашиглагдаж байна, ялгаатай нэр сонгоно уу. " });
      } else {
        // Нэвтрэх нэр цор ганц байхаар бол хэрэглэгчийг өгөгдлийн сан дээр үүсгэнэ.
        User.create(newUser)
          .then(() => {
            response.status(200).json({ message: "Хэрэглэгчийг амжилттай бүртгэлээ!" });
          })
          .catch(error => {
            console.error("Server: Хэрэглэгчийг бүртгэхэд алдаа гарлаа.", error);
            response.status(500).json({ message: "Хэрэглэгчийг бүртгэхэд алдаа гарлаа. " });
          });
      }
    })
    .catch(error => {
      console.error("Server: Өгөгдлийн сангаас нэвтрэх нэр хайхад алдаа гарлаа. ", error);
      response.status(500).json({ message: "Нэвтрэх нэрийг шалгахад алдаа гарлаа. " });
    });
});

app.post('/photos/new', hasSessionRecord, (request, response) => {
  processFormBody(request, response, (err) => {
    if (err || !request.file) {
      console.error("Server: Зургийг байршуулахад алдаа гарлаа. ", err);
      response.status(400).json({ message: "Зургийг байршуулахад алдаа гарлаа. " });
      return;
    }
    if (request.file.buffer.size === 0) {
      response.status(400).json({ message: "Зураг хоосон байна. " });
      return;
    }
    // хүсэлтэд ирсэн зургийг images хавтас дотор хадгална.
    // ингэхдээ цор ганц нэр өгөх хэрэгтэй, жишээ нь: U1722955384100image
    const timestamp = new Date().valueOf();
    const filename = 'U' + String(timestamp) + request.file.originalname;
    fs.writeFile(`./images/${filename}`, request.file.buffer, (error) => {
      if (error) {
        console.error("Server: fs-дээр зургийг байршуулахад алдаа гарлаа. ", error);
        response.status(500).json({ message: "fs-дээр зургийг байршуулахад алдаа гарлаа." });
        return;
      }
      // дараа нь өгөгдлийн сан дээрээ зургаа үүсгэнэ.
      Photo.create({
        file_name: filename,
        date_time: timestamp,
        user_id: request.session.userIdRecord
      })
      .then(() => {
        response.status(200).send();
      })
      .catch(error1 => {
        console.error("Server: Өгөгдлийн сан дээр зургийг үүсгэхэд алдаа гарлаа. ", error1);
        response.status(500).json({ message: "Өгөгдлийн сан дээр зургийг үүсгэхэд алдаа гарлаа. " });
      });
    });
  });
});

// app.post('/commentsOfPhoto/:photo_id', hasSessionRecord, (request, response) => {
//   const commentText = request.body.comment;
//   if (!commentText) {
//     // Шинэ сэтгэгдэл хоосон байвал 400 status-аар хариу илгээнэ.
//     response.status(400).json({ message: "Сэтгэгдэл хоосон байна. " });
//     return;
//   }
//   // хүсэлтэд ирсэн photo_id-аар дамжуулан өгөгдлийн сан дахь тухайн зурган дээр сэтгэгдлийг нэмж өгнө.
//   Photo.findOne({ _id: new ObjectId(request.params.photo_id) })
//     .then(photo => {
//       if (!photo) {
//         response.status(404).json({ message: "Зураг олдсонгүй." });
//         return;
//       }
//       const newComment = {
//         comment: commentText,
//         date_time: new Date(),
//         user_id: request.session.userIdRecord
//       };
//       photo.comments.push(newComment);
//       photo.save()
//         .then(() => {
//           response.status(200).send();
//         })
//         .catch(error => {
//           console.error("Server: Сэтгэгдлийг нэмэхэд алдаа гарлаа. ", error);
//           response.status(500).json({ message: "Сэтгэгдлийг нэмэхэд алдаа гарлаа." });
//         });
//     })
//     .catch(error => {
//       console.error("Server: Зургийг хайхад алдаа гарлаа.", error);
//       response.status(500).json({ message: "Зургийг хайхад алдаа гарлаа." });
//     });
// });

/**
 * *****************************************************************************
 * ******************** User story: Photo “like” votes *************************
 * *****************************************************************************
 * */

app.post('/photos/:photo_id/like', hasSessionRecord, (request, response) => {
  const photoId = request.params.photo_id;
  const userId = request.session.userIdRecord;
  Photo.findById(photoId, (err, photo) => {
    if (err || !photo) {
      response.status(400).json({ message: "Зураг олдсонгүй." });
      return;
    }
    if (photo.likes.includes(userId)) {
      response.status(400).json({ message: "Та аль хэдийн энэ зурган дээр like дарсан байна." });
      return;
    }
    photo.likes.push(userId);
    photo.save()
      .then(() => response.status(200).json({ likes: photo.likes.length }))
      .catch(e1=> {
        console.error("Server: Like-ийг хадгалахад алдаа гарлаа. ", e1);
        response.status(500).json({ message: "Like-ийг хадгалахад алдаа гарлаа." });
      });
  });
});

app.post('/photos/:photo_id/unlike', hasSessionRecord, (request, response) => {
  const photoId = request.params.photo_id;
  const userId = request.session.userIdRecord;

  Photo.findById(photoId, (err, photo) => {
    if (err || !photo) {
      response.status(400).json({ message: "Зураг олдсонгүй." });
      return;
    }
    const likeIndex = photo.likes.indexOf(userId);
    if (likeIndex === -1) {
      response.status(400).json({ message: "Та энэ зургийг like дараагүй байна." });
      return;
    }

    photo.likes.splice(likeIndex, 1);
    photo.save()
      .then(() => response.status(200).json({ likes: photo.likes.length }))
      .catch(e2 => {
        console.error("Server: Unlike-ийг хадгалахад алдаа гарлаа. ", e2);
        response.status(500).json({ message: "Unlike-ийг хадгалахад алдаа гарлаа." });
      });
  });
});

function sortedPhotos(photos) {
  return photos.sort((a, b) => {
      if (b.likes.length !== a.likes.length) {
        return b.likes.length - a.likes.length;
      }
      // like-ийн тоогоор тэнцүү бол огноогоор нь эрэмбэлнэ
      return new Date(b.date_time).getTime() - new Date(a.date_time).getTime();
    });
}

app.get('/photosOfUser/:id', hasSessionRecord, function (request, response) {
  var id = request.params.id;
  Photo.find({user_id: id}, (err, photos) => {
    if (err) {
        response.status(400).json({ message: `${id} ID-тай хэрэглэгчийн зураг олдсонгүй!` });
    } else {
      console.log(`Server: ${id} ID-тай хэрэглэгчийн зургийг амжилттай уншлаа!`);
      let count = 0;
      // Mongoose-ээс ирсэн өгөгдлийг JS-ийн объект болгож задлана
      const photoList = JSON.parse(JSON.stringify(photos));
      sortedPhotos(photoList);
      // нийт байх ёстой сэтгэглийн тоог тоолно
      photoList.forEach(photo => {
        // хариу илгээхээс өмнө шаардлагагүй мэдээллийг арилгана.
        delete photo.__v;
        async.eachOf(photo.comments, (comment, index, callback) => {
          // тухайн сэтгэгдлийг бичсэн хэрэглэгчийг мөн өгөгдлийн сангаас хайж олох шаардлагатай.
          User.findOne({_id: comment.user_id}, (error, user) => {
            if (!error) {
              // Mongoose-ээс ирсэн өгөгдлийг JS-ийн объект болгож задлана
              const userObj = JSON.parse(JSON.stringify(user));
              // бүтцийг задлан утга оноох замаар шаардлагатай өгөгдлүүдээ ялгаж авна.
              const {location, description, occupation, __v, ...rest} = userObj;
              // олж авсан өгөгдлөө харгалцах зургийн объектод оноож өгнө.
              photo.comments[index].user = rest;
              // шаардлагагүй шинжийг арилгана.
              delete photo.comments[index].user_id;
            }
            callback(error);
          });
        }, error => {
          count += 1;
          if (error) {
            response.status(400).json({ message: "Сэтгэгдлийг уншихад алдаа гарлаа." });
          } else if (count === photoList.length) {
            // aysnc.each() ажиллаж дуусахад хүсэлтэд хариу илгээнэ.
            response.status(200).json(photoList);
          }
        });
      });
    }
  });    
});

/**
 * *****************************************************************************
 * ************* User story: Deleting comments, photos, and users **************
 * *****************************************************************************
 * */
app.delete('/deleteUser/:id', async (request, response) => {
  const userIdToRemove = request.params.id;
  console.log("User to remove: " + userIdToRemove);

  try {
      // Delete the User
      const result = await User.findByIdAndDelete(userIdToRemove);
      console.log('Deleted the User: ', result);

      // Delete all Photos posted by the user
      const userPhotos = await Photo.find({ user_id: userIdToRemove });
      const deletionPromises = userPhotos.map(async (photo) => {
          const deletedPhoto = await Photo.findByIdAndDelete(photo._id);
          console.log('Deleted Photo:', deletedPhoto);
      });

      await Promise.all(deletionPromises);

      // Delete all Mentions involving this user
      await Mention.deleteMany({ user_id: userIdToRemove });

      // Delete all Likes and Comments by the user from all related photos
      const allPhotos = await Photo.find();
      const updatePromises = allPhotos.map(async (photo) => {
          if (photo.likes.includes(userIdToRemove)) {
              await Photo.findByIdAndUpdate(photo._id, { $pull: { likes: userIdToRemove } }, { new: true });
          }

          const commentsToDelete = photo.comments.filter(comment => comment.user_id.toString() === userIdToRemove);
          const commentUpdatePromises = commentsToDelete.map(async (commentToDelete) => {
              await Photo.findByIdAndUpdate(photo._id, { $pull: { comments: commentToDelete } }, { new: true });
          });

          return commentUpdatePromises;
      });

      const flattenedPromises = updatePromises.flat();
      await Promise.all(flattenedPromises);

      response.status(200).json({ message: "User deleted successfully!" });
  } catch (error) {
      console.error('Error destroying User:', error.message);
      response.status(500).json({ message: 'Internal server error' });
  }
});
app.delete('/deleteComment/:commentId', async (request, response) => {
  const commentId = request.params.commentId;

  try {
    // Remove the comment from the Photo
    const result = await Photo.updateOne(
      { "comments._id": commentId },
      { $pull: { comments: { _id: commentId } } }
    );

    if (result.nModified === 0) {
      return response.status(404).json({ message: 'Comment not found' });
    }

    // Delete mentions related to the comment
    await Mention.deleteMany({ comment_id: commentId });

    response.status(200).json({ message: "Comment deleted successfully!" });
  } catch (err) {
    console.error('Error deleting comment:', err.message);
    response.status(500).json({ message: 'Internal server error' });
  }
});

app.delete('/deletePhoto/:id', async (request, response) => {
  const photoIdToDelete = request.params.id;

  try {
      // Delete the photo
      const deletedPhoto = await Photo.findByIdAndDelete(photoIdToDelete);
      if (!deletedPhoto) {
          console.log("Photo not found");
          return response.status(404).json({ message: 'Photo not found' });
      }

      // Delete mentions related to the photo
      await Mention.deleteMany({ photo_id: photoIdToDelete });

      response.status(200).json({ message: "Photo deleted successfully!" });
  } catch (error) {
      console.error('Error deleting photo:', error.message);
      response.status(500).json({ message: 'Internal server error' });
  }
});


/**
 * *****************************************************************************
 * ****************** User story: @ mentions in comments ***********************
 * *****************************************************************************
 * */

// Utility function to extract user IDs mentioned in a comment
const extractMentions = (commentText) => {
  const regex = /@\[@[^\]]+\]\((\w+)\)/g;
  let match;
  const userIds = [];
  // Use a loop to extract all matches
  while ((match = regex.exec(commentText)) !== null) {
    userIds.push(match[1]); // match[1] contains the user ID
  }
  console.log('Server: Extracted User IDs:', userIds);
  return User.find({ _id: { $in: userIds } })
    .then(users => users.map(user => user._id));
};

// const extractMentions = (commentText) => {
//   const regex = /@\[@[^\]]+\]\((\w+)\)/g;
//   let match;
//   const userIds = [];
//   // Use a loop to extract all matches
//   while ((match = regex.exec(commentText)) !== null) {
//     userIds.push(match[1]); // match[1] contains the user ID
//   }
//   console.log('Server: Extracted User IDs:', userIds);
//   User.find({ _id: { $in: userIds } }, function(err, users) {
//     if (err) {
//       console.log("Mention-ийг ялгахад алдаа гарлаа.");
//       return [];
//     } else {
//       console.log("Mention-ийг амжилттай ялгалаа!");
//       const userList = users.map(user => {
//         const { first_name, last_name, _id } = user;
//         return { first_name, last_name, _id };
//       });
//       return userList;
//     }
//   });
// };

app.post('/commentsOfPhoto/:photo_id', hasSessionRecord, (request, response) => {
  const commentText = request.body.comment;
  if (!commentText) {
    response.status(400).json({ message: "Comment cannot be empty." });
    return;
  }
  Photo.findOne({ _id: new ObjectId(request.params.photo_id) })
    .then(photo => {
      // зураг байхгүй бол буцна.
      if (!photo) {
        return response.status(404).json({ message: "Photo not found." });
      }
      // сэтгэгдлийг үүсгээд, зургийн сэтгэгдэл бүхий хүснэгт рүү push хийнэ.
      const newComment = {
        comment: commentText,
        date_time: new Date(),
        user_id: request.session.userIdRecord,
      };
      photo.comments.push(newComment);
      // хадгалсны дараа өгөгдлийн сан дээр mention-объектоо үүсгэнэ.
      return photo.save().then(savedPhoto => {
        const commentId = savedPhoto.comments[savedPhoto.comments.length - 1]._id;
        console.log("Server: Mention энд байна уууууу, хариуу1 :)))" );

        return extractMentions(commentText).then(mentions => {
          console.log("Server: Mention энд байна уууууу, хариуу2 :)))" );

          const mentionPromises = mentions.map(userId => {
            console.log("Server: Mention энд байна уууууу, хариуу3 :)))" );

            return Mention.create({
              user_id: userId,
              photo_id: savedPhoto._id,
              comment_id: commentId,
              date_time: new Date(),
            })
              .then(() => {
                console.log("Server: Mention-ийг амжилттай бүртгэлээ!", {
                  user_id: userId,
                  photo_id: savedPhoto._id,
                  comment_id: commentId,
                  date_time: new Date()} 
                );
              })
              .catch(error => {
                console.error("Server: Mention-ийг бүртгэхэд алдаа гарлаа.", error.message);
              });
          });
          return Promise.all(mentionPromises);
        });
      });
    })
    .then(() => {
      console.log("Server: Added comment successfully.");
      response.status(200).json({ message: "Added comment successfully." });
    })
    .catch(error => {
      console.error("Server: Error adding comment.", error);
      response.status(500).json({ message: "Error adding comment." });
    });
});
app.get('/mentions/:user_id', hasSessionRecord, async (req, res) => {
  try {
    const userId = req.params.user_id;

    // Step 1: Find all mentions for the given user
    const mentions = await Mention.find({ user_id: userId });

    // Step 2: Extract unique photo IDs from the mentions
    const photoIds = [...new Set(mentions.map(m => m.photo_id))];

    // Step 3: Find all photos that match these IDs
    const photos = await Photo.find({ _id: { $in: photoIds } });

    // Step 4: Process each photo asynchronously
    const processedPhotos = await Promise.all(
      photos.map(async (photo) => {
        // Remove unnecessary fields
        const photoObj = photo.toObject(); // Convert Mongoose document to plain JS object
        delete photoObj.likes;
        delete photoObj.comments;
        delete photoObj.__v;

        // Find the user who created the photo
        const user = await User.findOne({ _id: photo.user_id });
        if (user) {
          const userObj = user.toObject();
          // Extract necessary fields
          const { location, description, occupation, __v, ...rest } = userObj;
          // Attach the user data to the photo
          photoObj.user = rest;
        }
        delete photoObj.user_id;
        return photoObj;
      })
    );

    // Step 5: Send the processed photos as the response
    console.log("Server: Searched for mentions successfully");
    console.log(processedPhotos);
    res.status(200).json(processedPhotos);
  } catch (error) {
    console.error("Server: Error while searching for mentions.", error.message);
    res.status(500).json({ message: "Error while searching for mentions." });
  }
});

/**
 * *****************************************************************************
 * ******************** User story: @ mentions in comments *********************
 * *****************************************************************************
 * */


const server = app.listen(3000, function () {
  const port = server.address().port;
  console.log(
    "Listening at http://localhost:" +
      port +
      " exporting the directory " +
      __dirname
  );
});