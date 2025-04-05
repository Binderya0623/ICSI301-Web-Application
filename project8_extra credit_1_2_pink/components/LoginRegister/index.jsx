import React from "react";
import { 
  Redirect 
} from "react-router-dom";
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

class LoginRegister extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loginName: "",
      password: "",
      loginMessage: "",

      loginNameInput: "",
      firstName: "",
      lastName: "",
      description: "",
      location: "",
      occupation: "",
      passwordInput1: "",
      passwordInput2: "",

      regMessage: "",
    };
    // хэрэглэгч нэвтэрсэн эсэхийг хадгална.
    this.isLogged = null;
  }
  // 2 form дээрх оролтын мэдээллээр бүрэлдэхүүн хэсгийн төлөвийг шинэчилнэ.
  handleInputChange = ({ target }) => this.setState({ [target.name]: target.value });
  // Нэвтрэх товчлуурыг дарахад сервер лүү хүсэлт явуулна.
  handleLoginSubmit = (e) => {
    e.preventDefault();
    const loginUser = { login_name: this.state.loginName, password: this.state.password };
    axios
      .post("/admin/login", loginUser)
      .then((response) => {
        console.log(`LoginRegister: ${this.state.loginName} ${this.state.password} хэрэглэгч амжилттай нэвтэрлээ :3`);
        this.setState({ loginMessage: response.data.message });
        // props-оор дамжиж ирсэн функцээр дамжуулан controller-ийн төлөвийг шинэчилнэ.
        this.props.onLoginUserChange(response.data);
      })
      .catch((error) => {
        console.log("LoginRegister: Нэвтрэлт амжилтгүй!");
        console.log(error.response.data.message);
        this.setState({ loginMessage: error.response.data.message });
        // props-оор дамжиж ирсэн функцээр дамжуулан controller-ийн төлөвийг шинэчилнэ.
        this.props.onLoginUserChange(null);
      });
  };

  getNewUser() {
    // хэрэглэгчийн мэдээллийг цуглуулсны дараа формоо цэвэрлэнэ.
    const newUser = {
      login_name: this.state.loginNameInput,
      password: this.state.passwordInput1,
      first_name: this.state.firstName,
      last_name: this.state.lastName,
      location: this.state.location,
      description: this.state.description,
      occupation: this.state.occupation,
    };
    this.setState({
      loginNameInput: "",
      passwordInput1: "",
      passwordInput2: "",
      firstName: "",
      lastName: "",
      location: "",
      description: "",
      occupation: "",
    });
    // тэгээд үүсгэсэн объектоо буцаана.
    return newUser;
  }
  // бүртгүүлэх товчлуур дээр дарах үед сервер лүү хүсэлт явуулна.
  handleRegisterSubmit = (e) => {
    // e.preventDefault() ашиглах үед энэ нь үзэгдлийн анхдагч үйлдлийг зогсоодог. 
    // Жишээлбэл, form илгээх үед үндсэн үйлдэл нь хуудсыг сэргээх явдал юм. 
    // preventDefault() нь үүнийг зогсоож, оронд нь өөрийн JavaScript кодоор form 
    // илгээх ажлыг зохицуулах боломжийг олгодог.
    e.preventDefault();
    if (this.state.passwordInput1 !== this.state.passwordInput2) {
      this.setState({ regMessage: "Шинэ нууц үгийг дахин оруулна уу!" });
      return;
    }
    const newUser = this.getNewUser();
    console.log(newUser);
    axios
      .post("/user", newUser)
      .then((response) => {
        console.log(`LoginRegister: Хэрэглэгчийг амжилттай бүртгэлээ :3`);
        this.setState({ regMessage: response.data.message });
      })
      .catch((error) => {
        console.log(`LoginRegister: Хэрэглэгчийг бүртгэхэд алдаа гарлаа!`);
        this.setState({ regMessage: error.response.data.message });
      });
  };

  // олон давтагдаж байгаа form үүсгэх хэсгийг функц болгож хялбарчилсан.
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
    // хэрэв хэрэглэгч нэвтэрсэн бол UserDetail бүрэлдэхүүн хэсэг рүү чиглүүлнэ.
    if (loginUser) {
      return <Redirect from="/login-register" to={`/users/${loginUser._id}`} />;
    }
    return (
      <Grid container justify="center" spacing={4} style={{ padding: "0px" }}>
        <Grid item xs={12} sm={6}>
          <Paper elevation={3} style={{ padding: "20px", paddingTop: "0px", paddingBottom: "10px", backgroundColor: "#fff" }}>
            <Typography variant="h6" color="#e27396" gutterBottom>
              Нэвтрэх бол:
            </Typography>
            <form onSubmit={this.handleLoginSubmit}>
              {this.customForm("Нэвтрэх нэр", "loginName", "text", this.state.loginName, true, true)}
              {this.customForm("Нууц үг", "password", "password", this.state.password, true)}
              <Button
                type="submit"
                disabled={this.state.loginName.length === 0}
                fullWidth
                variant="contained"
                color="primary"
                style={{ marginTop: "5px", backgroundColor: "#e27396" }}
              >
                Нэвтрэх
              </Button>
              {this.state.loginMessage && (
                <Typography style={{ color: "#e27396", marginTop: "5px" }}>
                  {this.state.loginMessage}
                </Typography>
              )}
            </form>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Paper elevation={3} style={{ padding: "20px", paddingTop: "0px", paddingBottom: "10px",backgroundColor: "#fff" }}>
            <Typography variant="h6" color="#e27396" gutterBottom>
              Бүртгүүлэх бол:
            </Typography>
            <form onSubmit={this.handleRegisterSubmit}>
              {this.customForm("Нэвтрэх нэр", "loginNameInput", "text", this.state.loginNameInput, true)}
              {this.customForm("Нэр", "firstName", "text", this.state.firstName, true)}
              {this.customForm("Овог", "lastName", "text", this.state.lastName, true)}
              {this.customForm("Тодорхойлолт", "description", "text", this.state.description)}
              {this.customForm("Оршин суугаа газар", "location", "text", this.state.location)}
              {this.customForm("Мэргэжил", "occupation", "text", this.state.occupation)}
              {this.customForm("Нууц үг", "passwordInput1", "password", this.state.passwordInput1, true)}
              {this.customForm("Нууц үгээ дахин оруулах", "passwordInput2", "password", this.state.passwordInput2, true)}
              <Button
                type="submit"
                disabled={this.state.loginNameInput.length === 0}
                fullWidth
                variant="contained"
                color="primary"
                style={{ marginTop: "5px", backgroundColor: "#e27396" }}
              >
                Бүртгүүлэх
              </Button>
              {this.state.regMessage && (
                <Typography style={{ color: this.state.regMessage.includes("амжилттай") ? "#52b2cf" : "#e27396", marginTop: "5px" }}>
                  {this.state.regMessage}
                </Typography>
              )}
            </form>
          </Paper>
        </Grid>
      </Grid>
    );
  }
}

export default LoginRegister;