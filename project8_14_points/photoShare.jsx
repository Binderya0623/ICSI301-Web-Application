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
// photoShare.jsx файл нь MVC архитектурын хувьд хянагч (controller),
// доорх файлууд нь MVC архитектурын хувьд харагдацууд (view) нь юм.
import "./styles/main.css";
import TopBar from "./components/TopBar";
import UserDetail from "./components/UserDetail";
import UserList from "./components/UserList";
import UserPhotos from "./components/UserPhotos";
import LoginRegister from "./components/LoginRegister";

class PhotoShare extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      // энэ нь харж буй зураг, мэдээллийн эзэн хэрэглэгч бөгөөд
      // вебэд нэвтэрсэн хэрэглэгч биш болно.
      userName: null,
      // хэрэглэгч нэвтэрсэн эсэх төлвийн дагуу харагдацуудыг зохицуулна.
      loginUser: null,
      photoIsUploaded: false
    };
  }

  // UserList-ээс өөр хэрэглэгчийг сонгоход тухайн хэрэглэгчийн нэрийг аваад
  // TopBar-ийн мэдээллийг өөрчлөнө. 
  // Өөрөөр хэлбэл нэг child component-оос мэдээлэл аваад 
  // нөгөө child component-рүү илгээнэ гэсэн үг.
  handleUserNameChange = userName => this.setState({ userName: userName });

  // LoginRegister-ээс вебэд нэвтэрсэн хэрэглэгчийн нэрийг аваад
  // TopBar-ийн мэдээллийг өөрчлөнө. 
  // Өөрөөр хэлбэл мөн л нэг child component-оос мэдээлэл аваад 
  // нөгөө child component-рүү илгээнэ гэсэн үг.
  handleLoginUserChange = loginUser => this.setState({ loginUser: loginUser });

  // UserPhotos бүрэлдэхүүн хэсгээс шинэ зураг оруулсан болохыг мэдэгдэнэ.
  handlePhotoUpload = () => {
    // шинэ зураг нийтлэгдэх үед төлөвийг шинэчлэхэд UserPhotos нь дахин render хийгдэнэ.
    this.setState({ photoIsUploaded: true });
    // эргүүлээд шинэ зураг нийтлэгдсэн болох төлөвийг цэвэрлэнэ.
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
                {/* paths.map()-г ашиглан Topbar бүрэлдэхүүн хэсгийн мэдээллийг өөрчилнө. */}
                {paths.map((path) => (
                  <Route key={path} path={path}>
                    {/* props-ыг дамжуулж өгснөөр child component нь this.props.match.params-аар дамжуулан controller-ийн шинжүүдийг авна. */}
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
                    {/* props-ыг дамжуулж өгснөөр child component нь this.props.match.params-аар дамжуулан controller-ийн шинжүүдийг авна. */}
                    {(props) => (
                      <UserDetail
                        {...props}
                        onUserNameChange={this.handleUserNameChange}
                        loginUser={this.state.loginUser}
                      />
                    )}
                  </Route>
                  <Route path="/photos/:userId">
                    {/* props-ыг дамжуулж өгснөөр child component нь this.props.match.params-аар дамжуулан controller-ийн шинжүүдийг авна. */}
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
                      <Redirect to={`/login-register`} />
                    )}
                  </Route>
                  <Route path="/">
                    {this.props.loginUser ? (
                      <Typography variant="h3">
                        Welcome to my photosharing app!
                      </Typography>
                    ) : (
                      <Redirect to={`/login-register`} />
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

ReactDOM.render(<PhotoShare/>, 
document.getElementById('photoshareapp'));