import React from "react";
import ReactDOM from "react-dom";
import { 
  Grid, 
  Paper, 
  Typography 
} from "@mui/material";
import { 
  HashRouter, 
  Route, 
  Switch, 
  Redirect 
} from "react-router-dom";
import "./styles/main.css";
import TopBar from "./components/TopBar";
import UserDetail from "./components/UserDetail";
import UserList from "./components/UserList";
import UserPhotos from "./components/UserPhotos";
import LoginRegister from "./components/LoginRegister";
import Activity from "./components/Activity";

class PhotoShare extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userName: null,
      loginUser: null,
      photoIsUploaded: false,
    };
  }

  componentDidMount() {
    // Check if the user is already logged in by checking localStorage
    localStorage.clear();
    const storedUser = localStorage.getItem('loginUser');
    if (storedUser) {
      this.setState({ loginUser: JSON.parse(storedUser) });
    }
  }

  handleUserNameChange = (userName) => this.setState({ userName: userName });

  handleLoginUserChange = (loginUser) => {
    if (loginUser) {
      // Store user data in localStorage
      localStorage.setItem('loginUser', JSON.stringify(loginUser));
    } else {
      // Clear the storage if user logs out
      localStorage.removeItem('loginUser');
    }
    this.setState({ loginUser: loginUser });
  };

  handlePhotoUpload = () => {
    this.setState({ photoIsUploaded: true });
    this.setState({ photoIsUploaded: false });
  };

  render() {
    const paths = ["/users/:userId", "/photos/:userId", ""];
    return (
      <HashRouter>
        <div>
          <Grid container spacing={1}>
            <Grid item xs={12}>
              <Switch>
                {paths.map((path) => (
                  <Route key={path} path={path}>
                    {(props) => (
                      <TopBar
                        {...props}
                        onLoginUserChange={this.handleLoginUserChange}
                        onPhotoUpload={this.handlePhotoUpload}
                        userName={this.state.userName}
                        loginUser={this.state.loginUser}
                      />
                    )}
                  </Route>
                ))}
              </Switch>
            </Grid>
            <div className="cs142-main-topbar-buffer" />
            <Grid item sm={3}>
              <Paper className="side-bar" elevation={3}>
                <UserList loginUser={this.state.loginUser} />
              </Paper>
            </Grid>
            <Grid item sm={9}>
              <Paper className="cs142-main-grid-item" elevation={3}>
                <Switch>
                  <Route path="/login-register">
                    <LoginRegister
                      onLoginUserChange={this.handleLoginUserChange}
                      loginUser={this.state.loginUser}
                    />
                  </Route>
                  <Route path="/users/:userId">
                    {(props) => (
                      <UserDetail
                        {...props}
                        onUserNameChange={this.handleUserNameChange}
                        loginUser={this.state.loginUser}
                      />
                    )}
                  </Route>
                  <Route path="/photos/:userId">
                    {(props) => (
                      <UserPhotos
                        {...props}
                        onUserNameChange={this.handleUserNameChange}
                        photoIsUploaded={this.state.photoIsUploaded}
                        loginUser={this.state.loginUser}
                      />
                    )}
                  </Route>
                  <Route path="/users">
                    {this.state.loginUser ? (
                      <UserList loginUser={this.state.loginUser} />
                    ) : (
                      <Redirect to="/login-register" />
                    )}
                  </Route>
                  <Route path="/activity">
                    {this.state.loginUser ? (
                      <Activity />
                    ) : (
                      <Redirect to="/login-register" />
                    )}
                  </Route>
                  <Route path="/">
                    {this.state.loginUser ? (
                      <Typography variant="h3">
                        Welcome to my photosharing app!
                      </Typography>
                    ) : (
                      <Redirect to="/login-register" />
                    )}
                  </Route>
                </Switch>
              </Paper>
            </Grid>
          </Grid>
        </div>
      </HashRouter>
    );
  }
}

ReactDOM.render(<PhotoShare />, document.getElementById("photoshareapp"));