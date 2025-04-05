/**
 * This builds on the webServer of previous projects in that it exports the
 * current directory via webserver listing on a hard code (see portno below)
 * port. It also establishes a connection to the MongoDB named "cs142project6".
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
 ***********************************************************************************
 * /user/list         - Returns an array containing all the User objects from
 *                      the database (JSON format).
 * /user/:id          - Returns the User object with the _id of id (JSON
 *                      format).
 * /photosOfUser/:id  - Returns an array with all the photos of the User (id).
 *                      Each photo should have all the Comments on the Photo
 *                      (JSON format).
 * 
 * POST /photos/:photo_id/like      - Зурган дээр like дарах боломжийг олгоно. 
 *                                    photo_id нь like дарсан зургийн ID юм.
 * POST /photos/:photo_id/unlike    - Зурган дээр дарсан like-аа авах боломжийг 
 *                                    олгоно.
 * POST /commentsOfPhoto/:photo_id  - photo_id-аар заасан зурган дээр сэтгэгдэл 
 *                                    нэмнэ. Request body нь сэтгэгдлийн текстийг 
 *                                    агуулсан байх ёстой.
 * POST /user                       - Шинэ хэрэглэгч нэмнэ. Request body нь 
 *                                    login_name, password, first_name, last_name 
 *                                    гэх мэт хэрэглэгчийн дэлгэрэнгүй мэдээллийг 
 *                                    агуулсан байх ёстой.
 * POST /admin/login                - Хэрэглэгчийг баталгаажуулж, сесшн үүсгэнэ. 
 *                                    Request body нь login_name, password байх ёстой.
 * POST /admin/logout               - Сесшнийг устгаснаар одоогийн хэрэглэгчид 
 *                                    вебээс гарах боломжийг олгоно.
 * POST /photos/new                 - Сесшн дэх хэрэглэгчийн хүссэн шинэ зургийг нэмнэ. 
 *                                    Request body нь зургийн файлыг агуулсан байх ёстой.
 * GET /mentions/:user_id           - Хэрэглэгчийн бүх mention-ийг uzer_id-аар нь авна.
 * GET /activity/feed               - Огноо, цаг, хэрэглэгчийн нэр, үйл ажиллагааны 
 *                                    тодорхой мэдээлэл зэрэг хамгийн сүүлийн үеийн 
 *                                    5 үйл ажиллагааг буцаана.
 */


const mongoose = require("mongoose");
mongoose.Promise = require("bluebird");
var ObjectId = require("mongodb").ObjectId; 
const async = require("async");
const express = require("express");

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
const Mention = require("./schema/mention.js");
const Activity = require("./schema/activity.js"); 


const { makePasswordEntry, doesPasswordMatch } = require('./cs142password');

const app = express();

// "uploadedphoto" нэртэй файлыг хүлээн авна. Энэ ганц файлыг req.file-д хадгална.
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
// commented hoho
// const cs142models = require("./modelData/photoApp.js").cs142models;

mongoose.set("strictQuery", false);
mongoose.connect("mongodb://127.0.0.1/cs142project6", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// We have the express static module
// (http://expressjs.com/en/starter/static-files.html) do all the work for us.
app.use(express.static(__dirname));


// Хэрэглэгч нэвтэрсэн эсэхийг шалгана, зөвхөн нэвтэрсэн хэрэглэгч дараагийн алхамыг 
// үргэлжлүүлэх боломжтой.
function hasSessionRecord(request, response, next) {
  if (request.session.userIdRecord) {
    console.log("Session: Одоогийн хэрэглэгчийг илрүүллээ ");
    next();
  }
  else {
    console.log("Session: Идэвхтэй хэрэглэгч алга ");
    response.status(401).json({ message: "Unauthorized" });
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
        // Query didn"t return an error but didn"t find the SchemaInfo object -
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
 ***********************************************************************************
 * ***************************** GET хүсэлт орж ирвэл: *****************************
 * /user/list         - Өгөгдлийн сангийн User объектуудыг JSON форматаар буцаана.
 * /user/:id          - Өгөгдлийн сангийн ганц User объектыг User-ийн id талбараар 
 *                      олж JSON форматаар буцаана.
 * /photosOfUser/:id  - Өгөгдлийн сангийн Photo объектыг User-ийн id талбараар олж 
 *                      JSON форматаар буцаана. Доор дахин хэрэгжүүлсэн.
 * *********************************************************************************
 * */

app.get("/user/list", hasSessionRecord, function (request, response) {
  // энд байгаа функц нь асуулга дуусах үед дуудагдах callback функц юм.
  // users параметр нь find асуулгын хариуд ирэх хүснэгт болно.
  User.find({}, function(err, users) {
    if (err) {
      console.log("userList-ийг авахад алдаа гарлаа!");
      response.status(500).send(JSON.stringify(err));
    } else {
      console.log("userList-ийг амжилттай авлаа ");
      // Mongoose-ээс ирсэн өгөгдлийг JS-ийн объект болгож задлана.
      const userList = JSON.parse(JSON.stringify(users));
      // хэрэглэгчийн овог, нэрээр шинэ объект бүхий хүснэгт үүсгэнэ.
      const newUsers = userList.map(user => {
        const { first_name, last_name, _id } = user;
        return { first_name, last_name, _id };
      });
      response.json(newUsers);
    }
  });
});

app.get("/user/:id", hasSessionRecord, function (request, response) {
  const id = request.params.id;
  // findOne асуулга нь харин ганц л объект буцаана.
  User.findOne({_id: id}, function(err, user) {
    if (err) {
      console.log(`Server: ${id} ID-тай хэрэглэгч олдсонгүй!`);
      response.status(400).send(JSON.stringify(err));
    } else {
      console.log(`Server: ${id} ID-тай хэрэглэгчийг уншлаа!`);
      // user-ийн төрөл нь object байсан.
      console.log(`typeof(user) = ${typeof(user)}`);
      const userObj = JSON.parse(JSON.stringify(user));
      response.status(200).json(userObj);
    }
  });
});
  
// });

/**
 ***********************************************************************************
 * **************************** POST хүсэлт орж ирвэл: *****************************
 * /admin/login                - Хэрэглэгчийг баталгаажуулж, сесшн үүсгэнэ. Request 
 *                               body нь login_name, password байх ёстой. 
 * /admin/logout               - Сесшнийг устгаснаар одоогийн хэрэглэгчид вебээс гарах 
 *                               боломжийг олгоно.
 * /user                       - Шинэ хэрэглэгч нэмнэ. Request body нь login_name, 
 *                               password, first_name, last_name гэх мэт хэрэглэгчийн 
 *                               дэлгэрэнгүй мэдээллийг агуулсан байх ёстой.
 * /photos/new                 - Сесшн дэх хэрэглэгчийн хүссэн шинэ зургийг нэмнэ. 
 *                               Request body нь зургийн файлыг агуулсан байх ёстой.
 * /commentsOfPhoto/:photo_id  - photo_id-аар заасан зурган дээр сэтгэгдэл нэмнэ. 
 *                               Request body нь сэтгэгдлийн текстийг агуулсан байх 
 *                               ёстой.
 *               Эдгээр endpoint-уудийг бүгдийг доор дахин хэрэгжүүлсэн.
 * *********************************************************************************
 * */



/**
 ***********************************************************************************
 * ************************ User story: Photo “like” votes *************************
 * ******************************* Story points: 4 *********************************
 * POST /photos/:photo_id/like   - Зурган дээр like дарах боломжийг олгоно. photo_id 
 *                                    нь like дарсан зургийн ID юм.
 * POST /photos/:photo_id/unlike - Зурган дээр дарсан like-аа авах боломжийг олгоно.
 * GET /photosOfUser/:id         - Өгөгдлийн сангийн Photo объектыг user_id талбараар 
 *                                 олж JSON форматаар буцаана. Ингэхдээ like-ийн тоо, 
 *                                 огноогоор нь эрэмбэлэн буцаах sortByLikeCountAndDate 
 *                                 utility функцийг тодорхойлон ашигласан.
 * *********************************************************************************
 * */

app.post("/photos/:photo_id/like", hasSessionRecord, (request, response) => {
  const photoId = request.params.photo_id;
  // сесшн дээр одоогоор идэвхтэй байгаа хэрэглэгчийн дугаарыг хадгалсан.
  const userId = request.session.userIdRecord;
  Photo.findById(photoId, (err, photo) => {
    if (err || !photo) {
      response.status(400).json({ message: "Зураг олдсонгүй!" });
      return;
    }
    if (photo.likes.includes(userId)) {
      response.status(400).json({ message: "Та аль хэдийн энэ зурган дээр like дарсан байна!" });
      return;
    }
    photo.likes.push(userId);
    photo.save()
      .then(() => response.status(200).json({ likes: photo.likes.length }))
      .catch(e1=> {
        console.error("Server: Like-ийг хадгалахад алдаа гарлаа! ", e1);
        response.status(500).json({ message: "Like-ийг хадгалахад алдаа гарлаа!" });
      });
  });
});

app.post("/photos/:photo_id/unlike", hasSessionRecord, (request, response) => {
  const photoId = request.params.photo_id;
  const userId = request.session.userIdRecord;
  Photo.findById(photoId, (err, photo) => {
    if (err || !photo) {
      response.status(400).json({ message: "Зураг олдсонгүй!" });
      return;
    }
    const likeIndex = photo.likes.indexOf(userId);
    if (likeIndex === -1) {
      response.status(400).json({ message: "Та энэ зургийг like дараагүй байна!" });
      return;
    }

    photo.likes.splice(likeIndex, 1);
    photo.save()
      .then(() => response.status(200).json({ likes: photo.likes.length }))
      .catch(e2 => {
        console.error("Server: Unlike-ийг хадгалахад алдаа гарлаа!", e2);
        response.status(500).json({ message: "Unlike-ийг хадгалахад алдаа гарлаа!" });
      });
  });
});

function sortByLikeCountAndDate(photos) {
  return photos.sort((a, b) => {
    // эхлээд like-ийн тоогоор нь эрэмбэлнэ.
    if (b.likes.length !== a.likes.length) {
      return b.likes.length - a.likes.length;
    }
    // like-ийн тоогоор тэнцүү бол огноогоор нь эрэмбэлнэ
    return new Date(b.date_time).getTime() - new Date(a.date_time).getTime();
  });
}

app.get("/photosOfUser/:id", hasSessionRecord, function (request, response) {
  var id = request.params.id;
  Photo.find({user_id: id}, (err, photos) => {
    if (err) {
        response.status(400).json({ message: `${id} ID-тай хэрэглэгчийн зураг олдсонгүй!` });
    } else {
      console.log(`Server: ${id} ID-тай хэрэглэгчийн зургийг амжилттай уншлаа`);
      let count = 0;
      // Mongoose-ээс ирсэн өгөгдлийг JS-ийн объект болгож задлана
      const photoList = JSON.parse(JSON.stringify(photos));
      // ирсэн collection-оо like-ийн тоо, огноогоор нь эрэмбэлнэ.
      sortByLikeCountAndDate(photoList);
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
            response.status(400).json({ message: "Сэтгэгдлийг уншихад алдаа гарлаа!" });
          } else if (count === photoList.length) {
            // aysnc.each() ажиллаж дуусахад хүсэлтэд хариу илгээнэ.
            response.status(200).json(photoList);
          }
        });
      });
    }
  });    
});



app.get("/mentions/:user_id", hasSessionRecord, async (req, res) => {
  try {
    const userId = req.params.user_id;
    const mentions = await Mention.find({ user_id: userId });
    const photoIds = [...new Set(mentions.map(m => m.photo_id))];
    const photos = await Photo.find({ _id: { $in: photoIds } });
    const processedPhotos = await Promise.all(
      photos.map(async (photo) => {
        const photoObj = photo.toObject();
        delete photoObj.likes;
        delete photoObj.comments;
        delete photoObj.__v;
        const user = await User.findOne({ _id: photo.user_id });
        if (user) {
          const userObj = user.toObject();
          const { location, description, occupation, __v, ...rest } = userObj;
          photoObj.user = rest;
        }
        delete photoObj.user_id;
        const mention = mentions.find(m => m.photo_id.toString() === photo._id.toString());
        if (mention) {
          const activity = await Activity.findOne({ comment_id: mention.comment_id });
          if (activity) {
            const commentedUser = await User.findOne({ _id: activity.user_id });
            if (commentedUser) {
              const commentedUserObj = commentedUser.toObject();
              const { location, description, occupation, __v, ...rest } = commentedUserObj;
              photoObj.commentedUser = rest;
            }
          }
        }
        return photoObj;
      })
    );

    console.log("Server: Successfully retrieved mentions and processed photos.");
    res.status(200).json(processedPhotos);
  } catch (error) {
    console.error("Server: Error while searching for mentions!", error.message);
    res.status(500).json({ message: "Error while searching for mentions." });
  }
});



app.delete("/deleteUser/:id", async (request, response) => {
  const userIdToRemove = request.params.id;
  try {
    // Устгах хэрэглэгчийн мэдээллийг харуулахын тулд өгөгдлийн сангаас хайж олно.
    // await нь гүйцэтгэлийг User.findByIdAndDelete()-ийг хийгдэх хүртэл түр зогсооно.
    const result = await User.findByIdAndDelete(userIdToRemove);
    console.log("Server: Устгагдсан хэрэглэгч: ", result);
    // Тухайн хэрэглэгчтэй холбоотой Photo (дотор нв commentSchema байгаа), Mention, 
    // Avtivity объектуудыг хайж олон устгана.
    const userPhotos = await Photo.find({ user_id: userIdToRemove });
    // map() нь зүраг болгоноор гүйж promise-уудаас тогтох хүснэгтийг буцаана.
    const deletionPromises = userPhotos.map(async (photo) => {
      const deletedPhoto = await Photo.findByIdAndDelete(photo._id);
      console.log("Server: Устгагдсан зураг: ", deletedPhoto);
      // Өмнөх хэрэгжүүлэлтээ өргөтгөн тухайн устгагдсан хэрэглэгчийн устгагдсан 
      // зурагт харгалзах бүх activity-ийг устгадаг болгосон.
      await Activity.deleteMany({ photo_id: photo._id });
      // энд байгаа async нь функцийг Photo.findByIdAndDelete(photo._id) болон 
      // Activity.deleteMany({ photo_id: photo._id })-ийг дуустал хүлээх promise-ийг 
      // буцаадаг болгоно.
    });
    // энэ нь зургуудыг устгах бүх promise-ууд болон тэдгээртэй холбоотой үйлдлүүд 
    // шийдэгдэх хүртэл хүлээнэ.
    await Promise.all(deletionPromises);
    // Устгагдсан хэрэглэгчид харгалзах бүх mention-ийг устгана.
    await Mention.deleteMany({ user_id: userIdToRemove });
    // Өмнөх хэрэгжүүлэлтээ өргөтгөн устгагдсан хэрэглэгчид харгалзах бүх 
    // activity-ийг устгадаг болгосон.
    await Activity.deleteMany({ user_id: userIdToRemove });

    // Мөн устгагдсан хэрэглэгчийн дарсан like, бичсэн сэтгэгдлүүдийг устгах хэрэгтэй.
    // өгөгдлийн сан дээр байгаа бүх зургийг авчирна.
    const allPhotos = await Photo.find();
    const updatePromises = allPhotos.map(async (photo) => {
      if (photo.likes.includes(userIdToRemove)) {
        // тухайн зурган дээрх like дарсан хүмүүс дотроос хэрэв байвал устгагдсан хэрэглэгчийг pull хийнэ.
        await Photo.findByIdAndUpdate(photo._id, { $pull: { likes: userIdToRemove } }, { new: true });
      }
      // like-ийг шалгасны дараа сэтгэгдлүүдийг шалгана.
      const commentsToDelete = photo.comments.filter(comment => comment.user_id.toString() === userIdToRemove);
      const commentUpdatePromises = commentsToDelete.map(async (commentToDelete) => {
        // тухайн зурган дээр сэтгэгдэл бичсэн хүмүүс дотроос хэрэв байвал устгагдсан хэрэглэгчийн 
        // бичсэн сэтгэгдлийг pull хийнэ.
        await Photo.findByIdAndUpdate(photo._id, { $pull: { comments: commentToDelete } }, { new: true });
        // сүүлд нь холбогдох activity-ийг устгана.
        await Activity.deleteMany({ comment_id: commentToDelete._id });
      });
      return commentUpdatePromises;
    });
    const flattenedPromises = updatePromises.flat();
    await Promise.all(flattenedPromises);
    response.status(200).json({ message: "Хэрэглэгч амжилттай устгагдлаа " });
  } catch (error) {
    console.error("Server: Хэрэглэгчийг устгахад алдаа гарлаа!", error.message);
    response.status(500).json({ message: "Серверийн алдаа гарлаа!" });
  }
});

app.delete("/deleteComment/:commentId", async (request, response) => {
  const commentId = request.params.commentId;
  try {
    // өгөгдлийн сан дахь зурагнаас тухайн нэг сэтгэгдлийг олж pull хийнэ.
    const result = await Photo.updateOne(
      { "comments._id": commentId },
      { $pull: { comments: { _id: commentId } } }
    );
    if (result.nModified === 0) {
      response.status(404).json({ message: "Сэтгэгдэл олдсонгүй!" });
      return;
    }
    // Устгагдсан сэтгэгдэлтэй холбоотой mention, avtivity-нүүдийг устгана.
    await Mention.deleteMany({ comment_id: commentId });
    await Activity.deleteMany({ comment_id: commentId });
    response.status(200).json({ message: "Сэтгэгдлийг амжилттай устгалаа " });
  } catch (err) {
    console.error("Server: Сэтгэгдлийг устгахад алдаа гарлаа!", err.message);
    response.status(500).json({ message: "Серверийн алдаа гарлаа!" });
  }
});

app.delete("/deletePhoto/:id", async (request, response) => {
  const photoIdToDelete = request.params.id;
  try {
    // өгөгдлийн сангаас тухайн нэг зургийг олж устгана
    const deletedPhoto = await Photo.findByIdAndDelete(photoIdToDelete);
    if (!deletedPhoto) {
      console.log("Server: Зураг олдсонгүй :3");
      response.status(404).json({ message: "Зураг олдсонгүй " });
      return;
    }
    // Устгагдсан зурагтай холбоотой mention, avtivity-нүүдийг устгана.
    await Mention.deleteMany({ photo_id: photoIdToDelete });
    await Activity.deleteMany({ photo_id: photoIdToDelete });
    response.status(200).json({ message: "Зургийг амжилттай устгалаа" });
  } catch (error) {
    console.error("Server: Зургийг устгахад алдаа гарлаа! ", error.message);
    response.status(500).json({ message: "Серверийн алдаа гарлаа!" });
  }
});

app.get("/activities", async (req, res) => {
  try {
    const activities = await Activity.find()
      // user_id талбарыг User collection-оос харгалзах хэрэглэгчийн first_name, 
      // last_name-ээр дүүргэнэ.
      .populate("user_id", "first_name last_name")
      // photo_id талбарыг Photo collection-оос харгалзах зургийн file_name-ээр дүүргэнэ.
      .populate("photo_id", "file_name")
      // тэгээд хугацаагаар нь буурах дарааллаар эрэмбэлнэ.
      .sort({ date_time: -1 })
      // эхний 5-ийг л сонгож activities-д утга онооно.
      .limit(5);
    console.log(activities);
    res.status(200).json(activities);
  } catch (error) {
    console.error("Server: Activity-ийг авахад алдаа гарлаа! ", error.message);
    res.status(500).json({ message: "Activity-ийг авахад алдаа гарлаа! " });
  }
});

/**
 ***********************************************************************************
 * ***************** Sidebar list marks users with new activity ********************
 * ******************************* Story points: 3 *********************************
 * GET /recent_activity/:user_id - Хэрэглэгчийн жагсаалтыг тус бүрийн хамгийн сүүлийн 
 *                                 үеийн activity-ийг буцаана.
 * *********************************************************************************
 * */

 app.get("/users_with_recent_activity", hasSessionRecord, async (req, res) => {
  try {
    const users = await User.find({});
    console.log("userList-ийг амжилттай авлаа ");

    // хэрэглэгч бүрийн хувьд хамгийн сүүлийн activity-ийг олно.
    const userActivities = await Promise.all(users.map(async user => {
      const recentActivity = await Activity.find({ user_id: user._id })
        .populate("user_id", "first_name last_name")
        .populate("photo_id", "file_name")
        .sort({ date_time: -1 })
        .limit(1);

      return {
        _id: user._id,
        first_name: user.first_name,
        last_name: user.last_name,
        recentActivity: recentActivity[0] || null,
      };
    }));
    res.status(200).json(userActivities);
  } catch (error) {
    console.error("Server: User list болон activity-г авахад алдаа гарлаа! ", error.message);
    res.status(500).json({ message: "User list болон activity-г авахад алдаа гарлаа! " });
  }
});




app.post("/admin/login", (request, response) => {
  User.findOne({ login_name: request.body.login_name })
    .then(user => {
      if (!user) {
        response.status(400).json({ message: `"${request.body.login_name}" нэвтрэх нэртэй хэрэглэгч олдсонгүй, дахин оролддоно уу!` });
        return;
      }

      // Check if the password matches
      const isPasswordValid = doesPasswordMatch(user.password_digest, user.salt, request.body.password);
      if (!isPasswordValid) {
        response.status(400).json({ message: "Нууц үг буруу байна!" });
        return;
      }

      const userObj = JSON.parse(JSON.stringify(user));
      request.session.userIdRecord = userObj._id;

      const newActivity = new Activity({
        user_id: userObj._id,
        activity_type: "User Login",
        date_time: new Date(),
      });

      newActivity.save().then(() => {
        response.status(200).json({ first_name: userObj.first_name, _id: userObj._id });
      });
    })
    .catch(error => {
      console.error("Server: Хэрэглэгч нэвтрэхэд алдаа гарлаа!", error.message);
      response.status(400).json({ message: "Алдаа гарлаа!" });
    });
});

app.post("/admin/logout", (request, response) => {
  if (request.session.userIdRecord) {
    request.session.destroy((err) => {
      if (err) {
        console.error("Server: Хэрэглэгчийн сессийг устгахад алдаа гарлаа!", err);
        response.status(500).json({ message: "Гарахад алдаа гарлаа!" });
      } else {
        response.status(200).json({ message: "Амжилттай гарлаа " });
      }
    });
  } else {
    response.status(400).json({ message: "Та нэвтрээгүй байна!" });
  }
});

app.post("/user", (request, response) => {
  const newUser = request.body;
  if (!(newUser.first_name && newUser.last_name && newUser.password && newUser.login_name)) {
    response.status(400).json({ message: "Нэвтрэх нэр, овог, нэр, нууц үгийг заавал бөглөх шаардлагатай!" });
    return;
  }

  User.findOne({ login_name: newUser.login_name })
    .then(user => {
      if (user) {
        response.status(400).json({ message: "Нэвтрэх нэр аль хэдийн ашиглагдаж байна, ялгаатай нэр сонгоно уу!" });
      } else {
        // Hash the password
        const { salt, hash } = makePasswordEntry(newUser.password);
        newUser.salt = salt;
        newUser.password_digest = hash;
        delete newUser.password;

        User.create(newUser)
          .then((createdUser) => {
            const newActivity = new Activity({
              user_id: createdUser._id,
              activity_type: "User Registration",
              date_time: new Date(),
            });

            return newActivity.save().then(() => {
              response.status(200).json({ message: "Хэрэглэгчийг амжилттай бүртгэлээ " });
            });
          })
          .catch(error => {
            console.error("Server: Хэрэглэгчийг бүртгэхэд алдаа гарлаа!", error);
            response.status(500).json({ message: "Хэрэглэгчийг бүртгэхэд алдаа гарлаа!" });
          });
      }
    })
    .catch(error => {
      console.error("Server: Өгөгдлийн сангаас нэвтрэх нэр хайхад алдаа гарлаа!", error);
      response.status(500).json({ message: "Нэвтрэх нэрийг шалгахад алдаа гарлаа!" });
    });
});

const server = app.listen(3000, function () {
  const port = server.address().port;
  console.log(
    "Listening at http://localhost:" +
      port +
      " exporting the directory " +
      __dirname
  );
});