import React from "react";
import { Link, Redirect } from "react-router-dom";
import { Card, CardHeader, Avatar, CardMedia, CardContent, Button, Grid, Typography } from "@mui/material";
import axios from "axios";

class UserDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
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
        console.log("UserDetail: User data fetched successfully.");
      })
      .catch(error => {
        console.log("UserDetail: Error fetching user data.", error.message);
      });
  }

  fetchMentionedPhotos = () => {
    axios.get(`/mentions/${this.props.match.params.userId}`)
      .then(response => {
        this.setState({ mentionedPhotos: response.data });
        console.log("UserDetail: Mentioned photos fetched successfully.");
      })
      .catch(error => {
        console.log("UserDetail: Error fetching mentioned photos.", error.message);
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
    if (!this.props.loginUser) {
      return <Redirect to="/login-register" />;
    }

    const { user, mentionedPhotos } = this.state;

    if (!user) {
      return <p>Loading...</p>;
    }

    return (
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography color="textSecondary">Name:</Typography>
          <Typography variant="h6" gutterBottom>
            {`${user.first_name} ${user.last_name}`}
          </Typography>
          <Typography color="textSecondary">Description:</Typography>
          <Typography variant="h6" gutterBottom>
            {`${user.description}`}
          </Typography>
          <Typography color="textSecondary">Location:</Typography>
          <Typography variant="h6" gutterBottom>
            {`${user.location}`}
          </Typography>
          <Typography color="textSecondary">Occupation:</Typography>
          <Typography variant="h6" gutterBottom>
            {`${user.occupation}`}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Button
            size="large"
            to={`/photos/${user._id}`}
            component={Link}
            variant="contained"
            color="primary"
          >
            See Photos
          </Button>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="h6">Photos mentioning {user.first_name}</Typography>
          {mentionedPhotos.length > 0 ? (
            mentionedPhotos.map(photo => (
              <Card key={photo._id}>
                <CardHeader
                  avatar={
                    <Link to={`/photos/${photo.user._id}`} style={{ textDecoration: 'none' }}>
                      <Avatar src={`/images/${photo.file_name}`} />
                    </Link>
                  }
                  title={
                    <Link to={`/users/${photo.user._id}`} style={{ textDecoration: 'none', color: '#3f51b5' }}>
                      {`${photo.user.first_name} ${photo.user.last_name}`}
                    </Link>
                  }
                  subheader={`Date: ${new Date(photo.date_time).toLocaleDateString()}`}
                />
              </Card>
            ))
          ) : (
            <Typography>No photos mention this user.</Typography>
          )}
        </Grid>
      </Grid>
    );
  }
}

export default UserDetail;
