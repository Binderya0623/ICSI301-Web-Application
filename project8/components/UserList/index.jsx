import React from "react";
import { 
  Link 
} from "react-router-dom";
import { 
  List, 
  ListItem, 
  ListItemText, 
  Typography, 
  Avatar,
} from "@mui/material";
import axios from "axios";

class UserList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      users: null,
    };
    this.source = axios.CancelToken.source();
  }

  componentDidMount() {
    if (this.props.loginUser) {
      this.fetchData();
      this.startFetchingData();
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.loginUser !== prevProps.loginUser) {
      if (this.props.loginUser) {
        this.fetchData();
        this.startFetchingData();
      } else {
        this.stopFetchingData();
      }
    }
  }

  componentWillUnmount() {
    this.stopFetchingData();
    this.source.cancel("UserList: Request canceled.");
  }

  startFetchingData() {
    this.intervalId = setInterval(() => {
      if (this.props.loginUser) {
        this.fetchData();
      }
    }, 10000); // Fetch every 10 seconds
  }

  stopFetchingData() {
    clearInterval(this.intervalId);
  }

  fetchData() {
    axios
      .get("/users_with_recent_activity", { cancelToken: this.source.token })
      .then((response) => {
        this.setState({ users: response.data });
        console.log("UserList: Successfully fetched users and recent activities.");
      })
      .catch((error) => {
        console.error("UserList: Failed to fetch user list!", error.message);
      });
  }

  activitySentence(activityType) {
    console.log(this.state);
    switch (activityType) {
      case "Photo Upload":
        return "Шинэ зураг оруулсан байна.";
      case "New Comment":
        return "Сэтгэгдэл бичсэн байна.";
      case "User Registration":
        return "Шинэ хэрэглэгчээр бүртгүүлсэн байна.";
      case "User Login":
        return "Вебэд нэвтэрсэн байна.";
      case "User Logout":
        return "Вебээс гарсан байна.";
      default:
        return <Avatar style={{ backgroundColor: "#92c5d1" }}>{activityType ? activityType[0] : "?"}</Avatar>;
    }
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
              key={`${user._id}-${user.recentActivity ? user.recentActivity.date_time : 'no-activity'}`}
              button
              style={{
                backgroundColor: "#92c5d1",
                marginBottom: "10px",
                borderRadius: "10px",
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
                secondary={user.recentActivity ? (
                  <Typography variant="body2" style={{ color: "#11262b", display: "flex", alignItems: "center", justifyContent: "space-between",}}>
                    {`${this.activitySentence(user.recentActivity.activity_type)}`}
                    {user.recentActivity.photo_id && (
                      <img
                        src={`/images/${user.recentActivity.photo_id.file_name}`}
                        alt="Thumbnail"
                        style={{
                          width: 50,
                          height: 50,
                          marginLeft: "10px",
                          borderRadius: "10px",
                          border: "5px double #fff",
                        }}
                      />
                    )}
                  </Typography>
                ) : (
                  <Typography variant="body2" style={{ color: "#11262b" }}>
                    No recent activity
                  </Typography>
                )}
              />
            </ListItem>
          ))
        ) : (
          <Typography variant="body1" style={{ color: "#11262b" }}>
              {`\u00A0Welcome to my ICSI301 web project! Enjoy!`}
          </Typography>
        )}
      </List>
    );
  }
}

export default UserList;