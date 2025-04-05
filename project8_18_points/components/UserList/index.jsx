import React from "react";
import { 
  Link 
} from "react-router-dom";
import { 
  List,
  ListItem, 
  ListItemText, 
  Typography 
} from "@mui/material";
import axios from "axios";
import "./styles.css";

class UserList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      users: null,
    };
    this.source = axios.CancelToken.source();
  }

  fetchData() {
    axios
      .get("http://localhost:3000/user/list", { cancelToken: this.source.token })
      .then(response => {
        this.setState({ users: response.data });
        console.log("UserList: Хэрэглэгчдийн жагсаалтыг амжилттай авлаа :3");
      })
      .catch(error => {
        console.error(`UserList: Хэрэглэгчдийн жагсаалтыг авахад алдаа гарлаа. ${error.message}`);
        if (axios.isCancel(error)) {
          console.log("UserList: Хүсэлт цуцлагдлаа. ", error.message);
        } else if (error.response) {
          console.log("UserList: Хэрэглэгчдийн жагсаалтыг авахад алдаа гарлаа.", error.response.status);
        } else if (error.request) {
          console.log("UserList: Хүсэлтэд хариу ирсэнгүй. ", error.request);
        } else {
          console.log("UserList: Хүсэлт явуулахад алдаа гардаа. ", error.message);
        }
      });
  }

  componentDidMount() {
    if (this.props.loginUser) {
      this.fetchData();
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.loginUser !== prevProps.loginUser && this.props.loginUser) {
      this.fetchData();
    }
  }

  componentWillUnmount() {
    this.source.cancel("UserList: Хүсэлт цуцлагдлаа :3");
  }

  render() {
    const { users } = this.state;
    const { loginUser } = this.props;
    return (
      <List component="nav">
        {users && loginUser ? (
          users.map(user => (
            <ListItem
              to={`/users/${user._id}`}
              component={Link}
              key={user._id}
              button
              style={{
                backgroundColor: "#e27396",
                marginBottom: "15px",
                borderRadius: "4px",
              }}
            >
              <ListItemText
                style={{ paddingLeft: "8px" }}
                primary={(
                  <Typography 
                    variant="h6" 
                    style={{ color: "#fff" }}
                  >
                    {`${user.first_name} ${user.last_name}`}
                  </Typography>
                )}
              />
            </ListItem>
          ))
        ) : (
          <Typography 
            variant="body1" 
            style={{ color: "#e27396" }}
          >
            I used to fetch the model from window.cs142models.userListModel(), but now I&lsquo;ve shifted to using Express.js for handling server-side logic.
          </Typography>
        )}
      </List>
    );
  }
}

export default UserList;