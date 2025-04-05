import React, { Component } from "react";
import axios from "axios";
import {
  Container,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Typography,
  IconButton,
  CircularProgress,
} from "@mui/material";
import Refresh from "@mui/icons-material/Refresh";
import PhotoIcon from "@mui/icons-material/Photo";
import CommentIcon from "@mui/icons-material/Comment";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import LoginIcon from "@mui/icons-material/Login";
import LogoutIcon from "@mui/icons-material/Logout";
import { Link } from "react-router-dom";

class Activity extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activities: [],
      loading: true,
    };
  }
  componentDidMount() {
    this.fetchActivities();
  }
  fetchActivities = () => {
    this.setState({ loading: true });
    axios.get("/activities")
      .then(response => {
        console.log("Activity: activity-нүүдийг амжилттай авлаа :3");
        this.setState({ activities: response.data, loading: false });
      })
      .catch(error => {
        console.error("Activity: activity-нүүдийг авахад алдаа гарлаа!", error);
        this.setState({ loading: false });
      });
  };

  // activity-ний төрөлтөй тохируулан товчлуурыг render-лэнэ.
  renderActivityIcon(activityType, link) {
    console.log(this.state);
    const iconStyle = { cursor: "pointer", color: "#11262b" };
    switch (activityType) {
      case "Photo Upload":
        return <Link to={link} style={iconStyle}><PhotoIcon /></Link>;
      case "New Comment":
        return <Link to={link} style={iconStyle}><CommentIcon /></Link>;
      case "User Registration":
        return <Link to={link} style={iconStyle}><PersonAddIcon /></Link>;
      case "User Login":
        return <Link to={link} style={iconStyle}><LoginIcon /></Link>;
      case "User Logout":
        return <Link to={link} style={iconStyle}><LogoutIcon /></Link>;
      default:
        return <Avatar style={{ backgroundColor: "#92c5d1" }}>{activityType ? activityType[0] : "?"}</Avatar>;
    }
  }

  // activity-ийг төрлөөс нь хамааран render-лэнэ.
  renderActivityItem(activity) {
    const activityType = activity.activity_type || "unknown";
    let description = "";
    let link = "";

    switch (activityType) {
      case "Photo Upload":
        description = "Шинэ зураг нийтэллээ.";
        link = `/photos/${activity.user_id._id}`;
        break;
      case "New Comment":
        description = "Сэтгэгдэл бичсэн байна.";
        link = `/photos/${activity.user_id._id}`;
        break;
      case "User Registration":
        description = "Вебэд шинээр бүртгүүллээ.";
        link = `/users/${activity.user_id._id}`;
        break;
      case "User Login":
        description = "Вебэд нэвтэрлээ.";
        link = `/users/${activity.user_id._id}`;
        break;
      case "User Logout":
        description = "Вебээс гарлаа.";
        link = `/users/${activity.user_id._id}`;
        break;
      default:
        description = "Үл мэдэгдэх үйл явдал.";
        break;
    }

    return (
      <ListItem key={activity._id}>
        <ListItemAvatar>
          {this.renderActivityIcon(activityType, link)}
        </ListItemAvatar>
        <ListItemText
          primary={(
            <Link to={link} style={{ textDecoration: "none", color: "#25637d" }}>
              {activity.user_id.first_name ? activity.user_id.first_name : "Unknown User"} - {description}
            </Link>
          )}
          secondary={new Date(activity.date_time).toLocaleString()}
        />
        <Link to={`/photos/${activity.user_id._id}`} style={{ textDecoration: "none", color: "#25637d" }}>
          {activity.photo_id?.file_name && (
            <img src={`/images/${activity.photo_id.file_name}`} alt="Thumbnail" style={{ width: 50, height: 50, marginLeft: "auto", borderWidth: "5px", borderRadius: "10px", borderColor: "#25637d", borderStyle: "double"}} />
          )}
        </Link>
      </ListItem>
    );
  }

  render() {
    const { activities, loading } = this.state;

    return (
      <Container>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
          <Typography variant="h6" gutterBottom style={{ color: "#25637d" }}>
            Веб дээр болсон сүүлийн үеийн үйл явдлууд:
          </Typography>
          <IconButton 
            variant="contained" 
            style={{ marginBottom: "20px", backgroundColor: "#25637d", color: "#fff" }} 
            onClick={this.fetchActivities}
          >
            <Refresh/>
          </IconButton>
        </div>
        {loading ? (
          <CircularProgress style={{ color: "#92c5d1" }} />
        ) : (
          <List>
            {activities.length === 0 ? (
              <Typography variant="body1" style={{ color: "#11262b" }}>Ямар нэг үйл явдал болоогүй байна.</Typography>
            ) : (
              activities.map(activity => this.renderActivityItem(activity))
            )}
          </List>
        )}
      </Container>
    );
  }
}

export default Activity;