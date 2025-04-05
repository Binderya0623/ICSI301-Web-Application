import React from "react";
import { Link, Redirect } from "react-router-dom";
import { List, Divider, Typography, Grid, Avatar, Card, CardHeader, CardMedia, CardContent, Button } from "@mui/material";
import "./styles.css";
import axios from "axios";
import CommentDialog from "../CommentDialog";

export default class UserPhotos extends React.Component {
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
          console.log("UserPhotos: Request canceled.", error.message);
        } else {
          console.log("UserPhotos: Error fetching photos.", error);
        }
      });

    axios
      .get(`/user/${this.props.match.params.userId}`, { cancelToken: this.source.token })
      .then(response => {
        if (this._isMounted) {
          this.setState({ user: response.data });
          this.props.onUserNameChange(`${response.data.first_name} ${response.data.last_name}`);
          console.log("UserPhotos: Successfully fetched user.");
        }
      })
      .catch(error => {
        if (axios.isCancel(error)) {
          console.log("UserPhotos: Request canceled.", error.message);
        } else {
          console.log("UserPhotos: Error fetching user.", error);
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
    this.source.cancel("Component unmounted, canceling axios requests.");
  }

  handleLike = (photoId) => {
    axios.post(`/photos/${photoId}/like`)
      .then(response => {
        this.fetchData();
      })
      .catch(error => console.error("Error saving like.", error));
  };

  handleUnlike = (photoId) => {
    axios.post(`/photos/${photoId}/unlike`)
      .then(response => {
        this.fetchData();
      })
      .catch(error => console.error("Error saving unlike.", error));
  };

  handleDeletePhoto = (photoId) => {
    axios.delete(`/deletePhoto/${photoId}`)
      .then(response => {
        console.log("Photo deleted successfully.");
        this.fetchData();
      })
      .catch(error => console.error("Error deleting photo.", error));
  };

  handleDeleteComment = (commentId) => {
    axios.delete(`/deleteComment/${commentId}`)
      .then(response => {
        console.log("Comment deleted successfully.");
        this.fetchData();
      })
      .catch(error => console.error("Error deleting comment.", error));
  };

  render() {
    if (!this.props.loginUser) {
      return <Redirect to="/login-register" />;
    }

    if (!this.state.user) {
      return <p>Loading</p>;
    }

    if (!this.state.photos) {
      return <p>No posts yet</p>;
    }

    return (
      <Grid container spacing={2}>
        {this.state.photos.map((photo) => (
          <Grid item xs={12} sm={6} md={4} key={photo._id}>
            <Card variant="outlined" style={{ borderRadius: '10px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
              <CardHeader
                avatar={(
                  <Avatar style={{ backgroundColor: "#1876d2", color: "#fff" }}>
                    {`${this.state.user.first_name[0].toUpperCase()}${this.state.user.last_name[0].toUpperCase()}`}
                  </Avatar>
                )}
                title={(
                  <Link to={`/users/${this.state.user._id}`} style={{ textDecoration: 'none', color: '#3f51b5' }}>
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
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                  <Button
                    variant={photo.likes.includes(this.props.loginUser._id) ? "contained" : "outlined"}
                    color="primary"
                    onClick={() => photo.likes.includes(this.props.loginUser._id) ? this.handleUnlike(photo._id) : this.handleLike(photo._id)}
                  >
                    {photo.likes.includes(this.props.loginUser._id) ? "Unlike" : "Like"}
                  </Button>
                  <Typography variant="body2" style={{ marginLeft: '10px' }}>
                    {photo.likes.length} likes
                  </Typography>
                </div>
                {photo.user_id === this.props.loginUser._id && (
                  <Button 
                    variant="outlined" 
                    color="secondary" 
                    onClick={() => this.handleDeletePhoto(photo._id)}
                  >
                    Delete Photo
                  </Button>
                )}
                {photo.comments && (
                  <>
                    <Typography variant="subtitle1" gutterBottom>
                      Comments:
                    </Typography>
                    <Divider />
                  </>
                )}
                {photo.comments.map((c) => (
                  <List key={c._id}>
                    <Typography variant="subtitle2">
                      <Link to={`/users/${c.user._id}`} style={{ textDecoration: 'none', color: '#1876d2' }}>
                        {`${c.user.first_name} ${c.user.last_name}`}
                      </Link>
                    </Typography>
                    <Typography
                      variant="caption"
                      color="textSecondary"
                      gutterBottom
                    >
                      {new Date(c.date_time).toLocaleString()}
                    </Typography>
                    <Typography variant="body1">
                      {`${c.comment}`}
                    </Typography>
                    {c.user._id === this.props.loginUser._id && (
                      <Button 
                        variant="outlined" 
                        color="secondary" 
                        onClick={() => this.handleDeleteComment(c._id)}
                      >
                        Delete Comment
                      </Button>
                    )}
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