import React from "react";
import { 
  Link, 
  Redirect 
} from "react-router-dom";
import { 
  Card,
  CardHeader, 
  Avatar, 
  Button, 
  Grid, 
  Typography 
} from "@mui/material";
import axios from "axios";

class UserDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      // мэдээллийг нь үзүүлж буй хэрэглэгч
      user: null,
      mentionedPhotos: []
    };
  }
  fetchData() {
    axios
      .get(`/user/${this.props.match.params.userId}`)
      .then((response) => {
        this.setState({ user: response.data });
        this.props.onUserNameChange(`${response.data.first_name} ${response.data.last_name}`);
        console.log("UserDetail: Хэрэглэгчийн мэдээллийн амжилттай авлаа :3");
      })
      .catch(error => {
        console.log("UserDetail: Хэрэглэгчийн мэдээллийг авахад алдаа гарлаа!", error.message);
      });
  }

  fetchMentionedPhotos = () => {
    axios.get(`/mentions/${this.props.match.params.userId}`)
      .then(response => {
        this.setState({ mentionedPhotos: response.data });
        console.log("UserDetail: Mention-ийг амжилттай авчирлаа :3");
      })
      .catch(error => {
        console.log("UserDetail: Mention-ийг авахад алдаа гарлаа!", error.message);
      });
  };  

  componentDidMount() {
    if (this.props.match.params.userId) {
      this.fetchData();
      this.fetchMentionedPhotos();
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.match.params.userId !== this.props.match.params.userId) {
      this.fetchData(`/user/${this.props.match.params.userId}`);
      this.fetchMentionedPhotos();
    }
  }

  render() {
    // нэвтэрсэн хэрэглэгч байхгүй бол login-register лүү чиглүүлнэ.
    if (!this.props.loginUser) {
      return <Redirect to="/login-register" />;
    }
    // бүрэлдэхүүн хэсгийн төлөвөөс бүтцийг задлан утга оноох замаар 
    // төлөвийн мэдээллийг хадгална.
    const { user, mentionedPhotos } = this.state;
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
              <Card key={photo._id} style={{ 
                marginBottom: "16px", 
                borderColor: "#e27396", 
                borderWidth: "5px", 
                borderStyle: "dotted" }}>
                <CardHeader
                  avatar={(
                    <Link to={`/photos/${photo.user._id}`} style={{ textDecoration: "none" }}>
                      <Avatar src={`/images/${photo.file_name}`} style={{
                        borderColor: "#e27396", 
                        borderWidth: "5px", 
                        borderStyle: "double"}}/>
                    </Link>
                  )}
                  title={(
                    <Link to={`/users/${photo.commentedUser._id}`} style={{ textDecoration: "none", color: "#e27396" }}>
                      {`${photo.commentedUser.first_name} ${photo.commentedUser.last_name}`}
                    </Link>
                  )}
                  subheader={`Огноо: ${new Date(photo.date_time).toLocaleDateString()}`}
                />
              </Card>
            ))
          ) : (
            <Typography>Ямар ч сэтгэгдэл дээр энэ хэрэглэгчийг дурдаагүй байна.</Typography>
          )}
        </Grid>
      </Grid>
    );
  }
}

export default UserDetail;