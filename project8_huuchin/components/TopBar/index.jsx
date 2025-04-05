import React from "react";
import { AppBar, Toolbar, Typography, Button } from "@mui/material";
import axios from "axios";

class TopBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = { verNumber: null };
    this.source = axios.CancelToken.source();
    this.uploadInput = null;
  }

  componentDidMount() {
    if (this.props.loginUser) {
      axios 
        .get("http://localhost:3000/test/info", { cancelToken: this.source.token })
        .then(response => {
          console.log("TopBar: Version number retrieved successfully.");
          this.setState({ verNumber: response.data.__v });
        })
        .catch(e => console.log("TopBar: Error retrieving version number.", e.message));
    }
  }

  componentWillUnmount() {
    this.source.cancel("TopBar: Request canceled.");
  }

  handleLogOut = () => {
    axios
      .post('/admin/logout')
      .then(response => {
        if (response.status === 200) {
          this.props.onLoginUserChange(null);
          console.log("TopBar: User logged out successfully.");
        }
      })
      .catch(e => console.log("TopBar: Error logging out.", e.message));
  };

  handleDeleteAccount = () => {
    if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      axios.delete(`/deleteUser/${this.props.loginUser._id}`)
        .then(response => {
          if (response.status === 200) {
            this.props.onLoginUserChange(null);
            console.log("TopBar: Successfully deleted.");
          }
        })
        .catch(err => console.error("Error deleting account.", err.message));
    }
  };

  handlePhotoSubmit = e => {
    e.preventDefault();
    if (this.uploadInput.files.length > 0) {
      const domForm = new FormData();
      domForm.append("uploadedphoto", this.uploadInput.files[0]);
      axios
        .post('/photos/new', domForm)
        .then((response) => {
          if (response.status === 200) {
            console.log("TopBar: Photo uploaded successfully.");
            this.props.onPhotoUpload();
          }
        })
        .catch(error => console.log("TopBar: Error uploading photo.", error));
    }
  };

  render() {
    return (
      <AppBar position="absolute">
        <Toolbar style={{ display: "flex" }}>
          <Typography variant="h6" style={{ flexGrow: 1 }}>
            Bindertsetseg 22b1num0027 {this.props.loginUser && ` v: ${this.state.verNumber}`}
          </Typography>
          <Typography variant="h6" style={{ flexGrow: 1 }}>
            {this.props.loginUser ? `Hello, ${this.props.loginUser.first_name} :)` : `Please Login :)`}
          </Typography>
          {this.props.loginUser && 
            (
            <Typography variant="h6" style={{ flexGrow: 1 }}>
              {this.props.match.params.userId && `${this.props.userName}`}
              {this.props.match.path.includes("/photos/") && `'s photos`}
              {this.props.match.path.includes("/users/") && `'s info`}
            </Typography>
          )}
          {this.props.loginUser && (
            <form onSubmit={this.handlePhotoSubmit} style={{ flexGrow: 1 }}>
              <Button
                variant="contained"
                component="label"
                color="primary"
                style={{ margin: "0 10px" }}
              >
                Upload Photo
                <input
                  ref={domFileRef => {
                    this.uploadInput = domFileRef;
                  }}
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                />
              </Button>
              <Button variant="contained" color="primary" type="submit">
                Submit
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={this.handleLogOut}
                style={{ marginLeft: "10px" }}
              >
                Log Out
              </Button>
              <Button 
                variant="contained" 
                color="secondary" 
                onClick={this.handleDeleteAccount}
                style={{ marginLeft: "10px" }}
              >
                Delete Account
              </Button>
            </form>
          )}
        </Toolbar>
      </AppBar>
    );
  }
}

export default TopBar;