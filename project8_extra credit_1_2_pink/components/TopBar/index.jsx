import React from "react";
import { 
  AppBar, 
  Toolbar, 
  Typography,
  IconButton, 
} from "@mui/material";
import { Link } from "react-router-dom";
import { 
  PhotoCamera, 
  ExitToApp, 
  Delete, 
  CloudUpload, 
  Home 
} from "@mui/icons-material";
import axios from "axios";

class TopBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = { verNumber: null };
    // axios request-д cancel token үүсгэнэ.
    this.source = axios.CancelToken.source();
    // хэрэглэгчийн оруулсан зургийг хадгална.
    this.uploadInput = null;
  }

  componentDidMount() {
    if (this.props.loginUser) {
      axios
        .get("/test/info", { cancelToken: this.source.token })
        .then(response => {
          console.log("TopBar: Version number-ийг амжилттай авлаа :3");
          this.setState({ verNumber: response.data.__v });
        })
        .catch(e => console.log("TopBar: Version number-ийг авахад алдаа гарлаа!", e.message));
    }
  }

  componentWillUnmount() {
    // шаардлагагүй, дараа нь асуудал үүсэхээс сэргийлж хийгдэж буй хүсэлтүүдийг цуцлана.
    this.source.cancel("TopBar: Хүсэлтийг цуцаллаа :3");
  }

  handleLogOut = () => {
    axios
      .post("/admin/logout")
      .then(response => {
        if (response.status === 200) {
          this.props.onLoginUserChange(null);
          console.log("TopBar: Хэрэглэгч амжиилттай гарлаа :3");
        }
      })
      .catch(e => console.log("TopBar: Хэрэглэгч гарахад алдаа гарлаа!", e.message));
  };

  handleDeleteAccount = () => {
    // Confirm-ийг ашиглан хэрэглэгчээс бүртгэлээ устгахыг зөвшөөрч байгааг асуудаг болгосон.
    if (window.confirm("Та хэрэглэгчийн бүртгэлээ устгахдаа итгэлтэй байна уу?")) {
      axios.delete(`/deleteUser/${this.props.loginUser._id}`)
        .then(response => {
          if (response.status === 200) {
            this.props.onLoginUserChange(null);
            console.log("TopBar: Хэрэглэгчийн бүртгэлийг амжилттай устгалаа :3");
          }
        })
        .catch(err => console.error("TopBar: Хэрэглэгчийн бүртгэлийг устгахад алдаа гарлаа!", err.message));
    }
  };

  handlePhotoSubmit = e => {
    e.preventDefault();
    if (this.uploadInput.files.length > 0) {
      const domForm = new FormData();
      // form-дээр хэрэглэгчийн оруулсан зургийг залгана.
      domForm.append("uploadedphoto", this.uploadInput.files[0]);
      axios
        .post("/photos/new", domForm)
        .then((response) => {
          if (response.status === 200) {
            console.log("TopBar: Зургийг амжилттай байршууллаа :3");
            // controller-д зургийг байршуулсныг мэдэгдэнэ.
            this.props.onPhotoUpload();
          }
        })
        .catch(error => console.log("TopBar: Зургийг байршуулахад алдаа гарлаа!", error));
    }
  };

  render() {
    return (
      <AppBar position="absolute">
        <Toolbar style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          backgroundColor: "#e27396" 
        }}>
          <Typography variant="h6" style={{ color: "#efcfe3" }}>
            Биндэрцэцэг 22b1num0027 {this.props.loginUser && `\u00A0\u00A0\u00A0\u00A0Хувалбар: ${this.state.verNumber}`}
          </Typography>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", flexGrow: 1 }}>
            <Typography variant="h6" style={{ color: "#efcfe3" }}>
              {this.props.loginUser ? `\u00A0\u00A0\u00A0\u00A0Сайн уу, ${this.props.loginUser.first_name} ♡⸜(｡˃ ᵕ ˂ )⸝♡\u00A0\u00A0\u00A0\u00A0` : ` 𓈒⟡₊⋆∘.𐙚₊˚⊹♡⸜(｡˃ ᵕ ˂ )⸝♡ᯓᡣ𐭩 ⋆౨ৎ˚⟡˖ ࣪Нэвтрэнэ үү. 𓈒⟡₊⋆∘.𐙚₊˚⊹♡⸜(｡˃ ᵕ ˂ )⸝♡ᯓᡣ𐭩 ⋆౨ৎ˚⟡˖ ࣪ `}
            </Typography>
            {this.props.loginUser && 
              (
              <Typography variant="h6" style={{ flexGrow: 1, color: "#fff" }}>
                {this.props.match.params.userId && `${this.props.userName}`}
                {this.props.match.path.includes("/photos/") && `-ийн зургууд („• ֊ •„)੭`}
                {this.props.match.path.includes("/users/") && `-ийн мэдээлэл („• ֊ •„)੭`}
              </Typography>
            )}
            {this.props.loginUser && (
              <form onSubmit={this.handlePhotoSubmit} style={{ display: "flex", alignItems: "center" }}>
                <IconButton component="label" color="inherit">
                  <PhotoCamera />
                  <input
                    ref={domFileRef => {
                      this.uploadInput = domFileRef;
                    }}
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                  />
                </IconButton>
                <IconButton color="inherit" type="submit">
                  <CloudUpload />
                </IconButton>
                <IconButton component={Link} to="/activity" color="inherit">
                  <Home />
                </IconButton>
                <IconButton color="inherit" onClick={this.handleLogOut}>
                  <ExitToApp />
                </IconButton>
                <IconButton color="red" onClick={this.handleDeleteAccount}>
                  <Delete />
                </IconButton>
              </form>
            )}
          </div>
        </Toolbar>
      </AppBar>
    );
  }
}

export default TopBar;