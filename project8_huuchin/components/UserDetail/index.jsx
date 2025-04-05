import React from "react";
import { 
  Link, 
  Redirect 
} from "react-router-dom";
import { 
  Button, 
  Grid, 
  Typography 
} from "@mui/material";
import "./styles.css";
import axios from "axios";

class UserDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null,
    };
  }

  fetchData(url) {
    axios
      .get(url)
      .then((response) => {
        this.setState({ user: response.data });
        this.props.onUserNameChange( response.data.first_name + " " + response.data.last_name );
        console.log("UserDetail: Хэрэглэгчийн мэдээллийг амжилттай авлаа. ");
      })
      .catch(error => {
        console.log("UserDetail: Хэрэглэгчийн мэдээллийг авахад алдаа гарлаа. ", error.message);
      });
  }

  // Хуудас дуудагдахад хэрэглэгчийн мэдээллийг авна.
  componentDidMount() {
    // Буруу URL-д хандахгүйн тулд user id байгаа эсэхийг шалгана.
    if (this.props.match.params.userId) {
      this.fetchData(`http://localhost:3000/user/${this.props.match.params.userId}`);
    }
  }

  // User list дээрээс өөр хэрэглэгч дээр дарахад мөн хэрэглэгчийн мэдээллийг дахин авах хэрэгтэй.
  componentDidUpdate(prevProps) {
    const prevUserID = prevProps.match.params.userId;
    const currUserID = this.props.match.params.userId;
    if (prevUserID !== currUserID && currUserID) {
      this.fetchData(`http://localhost:3000/user/${currUserID}`);
    }
  }

  render() {
    // Ямар ч хэрэглэгч нэвтрээгүй үед LoginRegister бүрэлдэхүүн хэсэг рүү чиглүүлнэ.
    if (!this.props.loginUser) {
      return <Redirect to={`/login-register`} />;
    }

    return this.state.user && (
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography color="textSecondary">Name:</Typography>
          <Typography variant="h6" gutterBottom>
            {`${this.state.user.first_name} ${this.state.user.last_name}`}
          </Typography>
          <Typography color="textSecondary">Description:</Typography>
          <Typography variant="h6" gutterBottom>
            {`${this.state.user.description}`}
          </Typography>
          <Typography color="textSecondary">Location:</Typography>
          <Typography variant="h6" gutterBottom>
            {`${this.state.user.location}`}
          </Typography>
          <Typography color="textSecondary">Occupation:</Typography>
          <Typography variant="h6" gutterBottom>
            {`${this.state.user.occupation}`}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Button
            size="large"
            to={this.state.user && `/photos/${this.state.user._id}`}
            component={Link}
            variant="contained"
            color="primary"
          >
            See Photos
          </Button>
        </Grid>
      </Grid>
    );
  }
}

export default UserDetail;