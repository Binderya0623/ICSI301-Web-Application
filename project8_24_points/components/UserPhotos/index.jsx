import React from "react";
import { 
  Link, 
  Redirect 
} from "react-router-dom";
import { 
  List, 
  Divider,
  Typography, 
  Grid, 
  Avatar, 
  Card, 
  CardHeader, 
  CardMedia, 
  CardContent, 
  Button,
  IconButton,
} from "@mui/material";
import { 
  Delete
} from "@mui/icons-material";
import "./styles.css";
import axios from "axios";
import CommentDialog from "../CommentDialog";

class UserPhotos extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      photos: null,
      user: null,
    };
    this._isMounted = false;
    this.source = axios.CancelToken.source();
  }

  fetchData = () => {
    axios
      .get(`/photosOfUser/${this.props.match.params.userId}`, { cancelToken: this.source.token })
      .then(response => {
        if (this._isMounted) {
          this.setState({ photos: response.data });
        }
      })
      .catch(error => {
        if (axios.isCancel(error)) {
          console.log("UserPhotos: Хүсэлт цуцлагдлаа :3", error.message);
        } else {
          console.log("UserPhotos: Зургийг авахад алдаа гарлаа!", error);
        }
      });

    axios
      .get(`/user/${this.props.match.params.userId}`, { cancelToken: this.source.token })
      .then(response => {
        if (this._isMounted) {
          this.setState({ user: response.data });
          this.props.onUserNameChange(`${response.data.first_name} ${response.data.last_name}`);
          console.log("UserPhotos: Хэрэглэгчийн мэдээлэл, зургийг амжилттай авлаа :3");
        }
      })
      .catch(error => {
        if (axios.isCancel(error)) {
          console.log("UserPhotos: Хүсэлт цуцлагдлаа :3", error.message);
        } else {
          console.log("UserPhotos: Хэрэглэгчийн мэдээллийг авахад алдаа гарлаа!", error);
        }
      });
  };

  componentDidMount() {
    this._isMounted = true;
    if (this.props.match.params.userId) {
      this.fetchData();
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.photoIsUploaded !== this.props.photoIsUploaded && this.props.photoIsUploaded) {
      this.fetchData();
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
    this.source.cancel("UserPhotos: Хүсэлт цуцлагдлаа :3");
  }

  handleLike = (photoId) => {
    axios.post(`/photos/${photoId}/like`)
      .then(() => {
        this.fetchData();
      })
      .catch(error => console.error("UserPhotos: Like-ийг хадгалахад алдаа гарлаа!", error));
  };

  handleUnlike = (photoId) => {
    axios.post(`/photos/${photoId}/unlike`)
      .then(() => {
        this.fetchData();
      })
      .catch(error => console.error("UserPhotos: Unlike-ийг хадгалахад алдаа гарлаа!", error));
  };

  handleDeletePhoto = (photoId) => {
    axios.delete(`/deletePhoto/${photoId}`)
      .then(() => {
        console.log("Зургийг амжилттай устгалаа :3");
        this.fetchData();
      })
      .catch(error => console.error("UserPhotos: Зургийг устгахад алдаа гарлаа!", error));
  };

  handleDeleteComment = (commentId) => {
    axios.delete(`/deleteComment/${commentId}`)
      .then(() => {
        console.log("Сэтгэгдлийг амжилттай устгалаа :3");
        this.fetchData();
      })
      .catch(error => console.error("UserPhotos: Сэтгэгдлийг устгахад алдаа гарлаа!", error));
  };

  renderComment = (commentText) => {
    return commentText.replace(/@\[(.+?)\]\((.+?)\)/g, (match, displayName, userId) => {
      return `<a href="http://localhost:3000/photo-share.html#/users/${userId}" style="text-decoration: none; color: #832161;"><strong>${displayName}</strong></a>`;
    });
  };

  // handleLikeUnlikeClick = (photoId, photo) => {
  //   if (photo.likes.includes(this.props.loginUser._id)) {
  //     this.handleUnlike(photoId);
  //   } else {
  //     this.handleLike(photoId);
  //   }
  // };

  render() {
    if (!this.props.loginUser) {
      return <Redirect to="/login-register" />;
    }

    if (!this.state.user) {
      return <p>Ачаалж байна...</p>;
    }

    if (!this.state.photos) {
      return <p>Одоогоор зураг оруулаагүй байна.</p>;
    }

    return (
      <Grid container spacing={2}>
        {this.state.photos.map((photo) => (
          <Grid item xs={12} sm={6} md={4} key={photo._id}>
            <Card 
              variant="outlined" 
              style={{ 
                borderRadius: "10px", 
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)", 
                backgroundColor: "#fff" 
              }}
            >
              <CardHeader
                avatar={(
                  <Avatar style={{ backgroundColor: "#e27396", color: "#fff" }}>
                    {`${this.state.user.first_name[0].toUpperCase()}${this.state.user.last_name[0].toUpperCase()}`}
                  </Avatar>
                )}
                title={(
                  <Link to={`/users/${this.state.user._id}`} style={{ textDecoration: "none", color: "#e27396" }}>
                    {`${this.state.user.first_name} ${this.state.user.last_name}`}
                  </Link>
                )}
                subheader={new Date(photo.date_time).toLocaleString()}
              />
              <CardMedia
                component="img"
                image={`./images/${photo.file_name}`}
                alt="User Post"
              />
              <CardContent>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
                  <Button
                    variant="contained"
                    sx={{
                      // text color
                      color: photo.likes.includes(this.props.loginUser._id) ? "#fff": "#e27396",
                      // background color
                      backgroundColor: photo.likes.includes(this.props.loginUser._id) ? "#e27396" : "transparent",
                      borderColor: "#e27396",
                      "&:hover": {
                        backgroundColor: photo.likes.includes(this.props.loginUser._id) ? "#d16286" : "rgba(226, 115, 150, 0.1)",
                        borderColor: "#d16286",
                      },
                      "&:active": {
                        backgroundColor: photo.likes.includes(this.props.loginUser._id) ? "#c15176" : "rgba(226, 115, 150, 0.2)",
                        borderColor: "#c15176",
                      },
                    }}
                    onClick={() => {
                      if (photo.likes.includes(this.props.loginUser._id)) {
                        this.handleUnlike(photo._id);
                      } else {
                        this.handleLike(photo._id);
                      }
                    }}
                  >
                    {photo.likes.includes(this.props.loginUser._id) ? "˗ˋˏ ♥︎ ˎˊ˗" : "♡"}
                  </Button>
                  <Typography variant="body2" style={{ marginLeft: "10px", color: "#e27396" }}>
                    {photo.likes.length} likes
                  </Typography>
                  {photo.user_id === this.props.loginUser._id && (
                    <IconButton color="red" onClick={() => this.handleDeletePhoto(photo._id)}>
                      <Delete />
                    </IconButton>
                  )}
                </div>

                {photo.comments && (
                  <Typography variant="subtitle1" gutterBottom style={{ color: "#e27396" }}>
                    Сэтгэгдлүүд:
                  </Typography>
                )}
                
                {photo.comments.map((c) => (
                  <List key={c._id}>
                    <Typography variant="subtitle2" style={{ color: "#e27396" }}>
                      <Link to={`/users/${c.user._id}`} style={{ textDecoration: "none", color: "#6b4652" }}>
                        {`${c.user.first_name} ${c.user.last_name}`}
                      </Link>
                    </Typography>
                    <Typography
                      variant="caption"
                      color="textSecondary"
                      gutterBottom
                      style={{ color: "#6b4652" }}
                    >
                      {new Date(c.date_time).toLocaleString()}
                    </Typography>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
                      <Typography 
                        variant="body1" 
                        dangerouslySetInnerHTML={{ __html: this.renderComment(c.comment) }} 
                        style={{ color: "#e27396" }}
                      />
                      {c.user._id === this.props.loginUser._id && (
                        <IconButton color="red" onClick={() => this.handleDeleteComment(c._id)}>
                          <Delete />
                        </IconButton>
                      )}
                    </div>
                    <Divider style={{ backgroundColor: "#e27396" }} />
                  </List>
                ))}
                <CommentDialog
                  onCommentSumbit={this.fetchData}
                  photo_id={photo._id}
                />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  }
}

export default UserPhotos;