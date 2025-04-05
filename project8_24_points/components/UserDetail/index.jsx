import React from "react";
import { Link, Redirect } from "react-router-dom";
import { Grid, Typography, Card, CardMedia, CardContent, CardActionArea, Button, CardHeader, Avatar } from "@mui/material";
import axios from "axios";

class UserDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null,
      mentionedPhotos: [],
      recentPhoto: null,
      mostCommentedPhoto: null,
    };
    this._isMounted = false;
    this.source = axios.CancelToken.source();
  }

  componentDidMount() {
    this._isMounted = true;
    if (this.props.match.params.userId) {
      this.fetchData();
      this.fetchMentionedPhotos();
      this.fetchUserPhotos();
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.match.params.userId !== this.props.match.params.userId) {
      this.fetchData();
      this.fetchMentionedPhotos();
      this.fetchUserPhotos();
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
    this.source.cancel("UserDetail: Хүсэлт цуцлагдлаа :3");
  }

  fetchData = () => {
    axios
      .get(`/user/${this.props.match.params.userId}`, { cancelToken: this.source.token })
      .then((response) => {
        if (this._isMounted) {
          this.setState({ user: response.data });
          this.props.onUserNameChange(`${response.data.first_name} ${response.data.last_name}`);
          console.log("UserDetail: Хэрэглэгчийн мэдээллийн амжилттай авлаа :3");
        }
      })
      .catch(error => {
        if (!axios.isCancel(error)) {
          console.log("UserDetail: Хэрэглэгчийн мэдээллийг авахад алдаа гарлаа!", error.message);
        }
      });
  };

  fetchMentionedPhotos = () => {
    axios
      .get(`/mentions/${this.props.match.params.userId}`, { cancelToken: this.source.token })
      .then(response => {
        if (this._isMounted) {
          this.setState({ mentionedPhotos: response.data });
          console.log("UserDetail: Mention-ийг амжилттай авчирлаа :3");
        }
      })
      .catch(error => {
        if (!axios.isCancel(error)) {
          console.log("UserDetail: Mention-ийг авахад алдаа гарлаа!", error.message);
        }
      });
  };

  fetchUserPhotos = () => {
    axios
      .get(`/photosOfUser/${this.props.match.params.userId}`, { cancelToken: this.source.token })
      .then(response => {
        if (this._isMounted) {
          const photos = response.data;
          if (photos.length > 0) {
            const mostCommentedPhoto = photos.reduce(
              (max, photo) => (photo.comments.length > max.comments.length ? photo : max),
              photos[0]
            );
            this.setState({
              recentPhoto: photos[0],
              mostCommentedPhoto: mostCommentedPhoto,
            });
          }
        }
      })
      .catch(error => {
        if (!axios.isCancel(error)) {
          console.error("UserDetail: Хэрэглэгчийн зургийг авахад алдаа гарлаа!", error.message);
        }
      });
  };

  render() {
    if (!this.props.loginUser) {
      return <Redirect to="/login-register" />;
    }

    const { user, mentionedPhotos, recentPhoto, mostCommentedPhoto } = this.state;

    if (!user) {
      return <p>Ачаалж байна...</p>;
    }

    return (
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography color="textSecondary">Нэр:</Typography>
          <Typography variant="h6" gutterBottom style={{ color: "#e27396" }}>
            {`${user.first_name} ${user.last_name}`}
          </Typography>
          <Typography color="textSecondary">Тодорхойлолт:</Typography>
          <Typography variant="h6" gutterBottom style={{ color: "#e27396" }}>
            {`${user.description}`}
          </Typography>
          <Typography color="textSecondary">Оршин суугаа газар:</Typography>
          <Typography variant="h6" gutterBottom style={{ color: "#e27396" }}>
            {`${user.location}`}
          </Typography>
          <Typography color="textSecondary">Мэргэжил:</Typography>
          <Typography variant="h6" gutterBottom style={{ color: "#e27396" }}>
            {`${user.occupation}`}
          </Typography>
        </Grid>

        <Grid item xs={12}>
          <Button
            size="large"
            to={`/photos/${user._id}`}
            component={Link}
            variant="contained"
            style={{ backgroundColor: "#e27396", color: "#fff" }}
          >
            Зураг харах
          </Button>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="h6" style={{ color: "#e27396" }}>
            {user.first_name} хэрэглэгчийг дурдсан зурагнууд  ˗ˏˋ ★ ˎˊ˗
          </Typography>
          {mentionedPhotos.length > 0 ? (
            mentionedPhotos.map(photo => (
              <Card
                key={photo._id}
                style={{
                  marginBottom: "16px",
                  borderColor: "#e27396",
                  borderWidth: "5px",
                  borderStyle: "dotted",
                }}
              >
                <CardHeader
                  avatar={
                    <Link to={`/photos/${photo.user._id}`} style={{ textDecoration: "none" }}>
                      <Avatar
                        src={`/images/${photo.file_name}`}
                        style={{
                          borderColor: "#e27396",
                          borderWidth: "5px",
                          borderStyle: "double",
                        }}
                      />
                    </Link>
                  }
                  title={
                    <Link
                      to={`/users/${photo.commentedUser._id}`}
                      style={{ textDecoration: "none", color: "#e27396" }}
                    >
                      {`${photo.commentedUser.first_name} ${photo.commentedUser.last_name}`}
                    </Link>
                  }
                  subheader={`Огноо: ${new Date(photo.date_time).toLocaleDateString()}`}
                />
              </Card>
            ))
          ) : (
            <Typography>Ямар ч сэтгэгдэл дээр энэ хэрэглэгчийг дурдаагүй байна.</Typography>
          )}
        </Grid>

        {recentPhoto && (
          <Grid item xs={6} md={6}>
            <Card
              variant="outlined"
              style={{
                borderRadius: "10px",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                backgroundColor: "#fff",
              }}
            >
              <CardActionArea component={Link} to={`/photos/${user._id}`}>
                <CardMedia
                  component="img"
                  height="140"
                  image={`/images/${recentPhoto.file_name}`}
                  alt="Recent Photo"
                />
                <CardContent>
                  <Typography variant="h6" color="#e27396">
                    Сүүлийн оруулсан зураг
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Огноо: {new Date(recentPhoto.date_time).toLocaleDateString()}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        )}

        {mostCommentedPhoto && (
          <Grid item xs={6} md={6}>
            <Card
              variant="outlined"
              style={{
                borderRadius: "10px",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                backgroundColor: "#fff",
              }}
            >
              <CardActionArea component={Link} to={`/photos/${user._id}`}>
                <CardMedia
                  component="img"
                  height="140"
                  image={`/images/${mostCommentedPhoto.file_name}`}
                  alt="Most Commented Photo"
                />
                <CardContent>
                  <Typography variant="h6" color="#e27396">
                    Хамгийн их сэтгэгдэлтэй зураг
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Сэтгэгдлийн тоо: {mostCommentedPhoto.comments.length}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        )}
      </Grid>
    );
  }
}

export default UserDetail;