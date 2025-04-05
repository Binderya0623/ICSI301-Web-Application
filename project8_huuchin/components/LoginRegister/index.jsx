import React from "react";
import { Redirect } from "react-router-dom";
import axios from "axios";
import { 
  Typography, 
  Grid, 
  FormControl, 
  InputLabel, 
  Input, 
  Button, 
  Paper 
} from "@mui/material";

export default class LoginRegister extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loginName: "",
      password: "",
      loginMessage: "",
      newLoginName: "",
      firstName: "",
      lastName: "",
      description: "",
      location: "",
      occupation: "",
      newPassword: "",
      newPassword2: "",
      registeredMessage: "",
    };
    this.isLogged = null;
  }

  handleInputChange = ({ target }) => this.setState({ [target.name]: target.value });
  // Login товчлуур дээр дарахад сервер лүү session үүсгэхийн тулд post message илгээнэ.
  handleLoginSubmit = e => {
    e.preventDefault();
    const loginUser = { login_name: this.state.loginName, password: this.state.password };
    axios
      .post("/admin/login", loginUser)
      .then(response => {
        console.log(`LoginRegister: ${this.state.loginName} ${this.state.password} хэрэглэгч амжилттай нэвтэрлээ. `);
        this.setState({ loginMessage: response.data.message });
        this.props.onLoginUserChange(response.data);
      })
      .catch(error => {
        console.log(`LoginRegister: Нэвтрэлт амжилтгүй. `);
        console.log(error.response.data.message);
        this.setState({ loginMessage: error.response.data.message });
        this.props.onLoginUserChange(null);
      });
  };

  getNewUser() {
    // хэрэглэгч form-ийг бөглөсний дараа мэдээллийг объект болгон авна.
    const newUser = {
      login_name: this.state.newLoginName,
      password: this.state.newPassword,
      first_name: this.state.firstName,
      last_name: this.state.lastName,
      location: this.state.location,
      description: this.state.description,
      occupation: this.state.occupation
    };
    // form-ийг цэвэрлэнэ.
    this.setState({
      newLoginName: "",
      newPassword: "",
      newPassword2: "",
      firstName: "",
      lastName: "",
      location: "",
      description: "",
      occupation: "",
    });
    // Тэгээд үүсгэсэн объект буюу хэрэглэгчээ буцаана.
    return newUser;
  }
  // Register Me товчлуур дээр дарахад form-ийн мэдээллийг сервер лүү илгээнэ. 
  handleRegisterSubmit = e => {
    e.preventDefault();
    // Хэрэглэгчийн оруулсан 2 нууц үг ижил байгааг баталгаажуулна.
    if (this.state.newPassword !== this.state.newPassword2) {
      this.setState({ registeredMessage: "Шинэ нууц үгийг дахин оруулна уу!" });
      return;
    }
    const newUser = this.getNewUser();
    console.log(newUser);
    axios
      .post("/user", newUser)
      .then(response => {
        console.log(`LoginRegister: Хэрэглэгчийг амжилттай бүртгэлээ. `);
        this.setState({ registeredMessage: response.data.message });
      })
      .catch(error => {
        console.log(`LoginRegister: Хэрэглэгчийг бүртгэхэд алдаа гарлаа. `);
        this.setState({ registeredMessage: error.response.data.message });
      });
  };

  customForm(inputLabel, id, type, value, required, autoFocus = false) {
    return (
      <FormControl fullWidth margin="normal">
        <InputLabel htmlFor={id}>{inputLabel}</InputLabel>
        <Input
          name={id}
          id={id}
          autoFocus={autoFocus}
          autoComplete="on"
          type={type}
          value={value}
          onChange={this.handleInputChange}
          required={required}
        />
      </FormControl>
    );
  }

  render() {
    const loginUser = this.props.loginUser;
    if (loginUser) {
      return <Redirect from="/login-register" to={`/users/${loginUser._id}`} />;
    }

    return (
      <Grid container justify="center" spacing={4} style={{ padding: "0px" }}>
        <Grid item xs={12} sm={6}>
          <Paper elevation={3} style={{ padding: "20px", paddingTop: "0px" }}>
            <Typography variant="h6" gutterBottom>Log In</Typography>
            <form onSubmit={this.handleLoginSubmit}>
              {this.customForm("Login Name", "loginName", "text", this.state.loginName, true, true)}
              {this.customForm("Password", "password", "password", this.state.password, true)}
              <Button
                type="submit"
                disabled={this.state.loginName.length === 0}
                fullWidth
                variant="contained"
                color="primary"
                style={{ marginTop: "5px" }}
              >
                Login
              </Button>
              {this.state.loginMessage && (
                <Typography style={{ color: "red", marginTop: "5px" }}>
                  {this.state.loginMessage}
                </Typography>
              )}
            </form>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Paper elevation={3} style={{ padding: "20px", paddingTop: "0px" }}>
            <Typography variant="h6" gutterBottom>Create New Account</Typography>
            <form onSubmit={this.handleRegisterSubmit}>
              {this.customForm("Login Name", "newLoginName", "text", this.state.newLoginName, true)}
              {this.customForm("First Name", "firstName", "text", this.state.firstName, true)}
              {this.customForm("Last Name", "lastName", "text", this.state.lastName, true)}
              {this.customForm("Description", "description", "text", this.state.description)}
              {this.customForm("Location", "location", "text", this.state.location)}
              {this.customForm("Occupation", "occupation", "text", this.state.occupation)}
              {this.customForm("Password", "newPassword", "password", this.state.newPassword, true)}
              {this.customForm("Re-enter Password", "newPassword2", "password", this.state.newPassword2, true)}
              <Button
                type="submit"
                disabled={this.state.newLoginName.length === 0}
                fullWidth
                variant="contained"
                color="primary"
                style={{ marginTop: "5px" }}
              >
                Register Me
              </Button>
              {this.state.registeredMessage && (
                <Typography style={{ color: this.state.registeredMessage.includes("амжилттай") ? "green" : "red", marginTop: "5px" }}>
                  {this.state.registeredMessage}
                </Typography>
              )}
            </form>
          </Paper>
        </Grid>
      </Grid>
    );
  }
}