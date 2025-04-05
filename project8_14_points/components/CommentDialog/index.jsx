import React from "react";
import { 
  Button, 
  Dialog, 
  DialogContent, 
  DialogContentText, 
  DialogActions, 
  Chip 
} from "@mui/material";
import { MentionsInput, Mention } from 'react-mentions';
import "./styles.css";
import axios from "axios";

export default class CommentDialog extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      open: false,
      comment: "",
      mentions: [],
    };
  }

  handleClickOpen = () => this.setState({ open: true });
  handleClickClose = () => this.setState({ open: false, comment: "", mentions: [] });
  handleCommentChange = (event, newValue, newMentions) => {
    this.setState({
      comment: newValue,
      mentions: Array.isArray(newMentions) ? newMentions.map(mention => mention.id) : [] // Ensure newMentions is an array
    });
  };

  handleCommentSubmit = () => {
    const { comment, mentions } = this.state;
    this.setState({ open: false, comment: "", mentions: [] });
    axios
      .post(`/commentsOfPhoto/${this.props.photo_id}`, { comment, mentions })
      .then(() => this.props.onCommentSumbit())
      .catch(error => console.log("CommentDialog: Сэтгэгдлийг илгээхэд алдаа гарлаа. ", error));
  };

  render() {
    const mentionStyle = {
      control: { backgroundColor: '#fff' },
      '&multiLine': { control: { fontFamily: 'inherit', minHeight: 63 } },
      highlighter: { overflow: 'hidden' },
      input: { margin: 0 },
      '&singleLine': { control: { display: 'inline-block', width: 130 } },
      suggestions: { 
        list: { backgroundColor: 'white', border: '1px solid rgba(0,0,0,0.15)' },
        item: { padding: '5px 15px', borderBottom: '1px solid rgba(0,0,0,0.15)', '&focused': { backgroundColor: '#cee4e5' } }
      }
    };

    return (
      <div className="comment-dialog">
        <Chip label="Reply" onClick={this.handleClickOpen}/>
        <Dialog open={this.state.open} onClose={this.handleClickClose}>
          <DialogContent>
            <DialogContentText>Add a comment...</DialogContentText>
            <MentionsInput
              value={this.state.comment}
              onChange={this.handleCommentChange}
              style={mentionStyle}
            >
              <Mention
                trigger="@"
                data={(search, callback) => {
                  axios.get(`/user/list`)
                    .then(response => {
                      const users = response.data.filter(user => 
                        `${user.first_name} ${user.last_name}`.toLowerCase().includes(search.toLowerCase())
                      ).map(user => ({
                        id: user._id,
                        display: `@${user.first_name} ${user.last_name}`
                      }));
                      callback(users);
                    })
                    .catch(error => {
                      console.error("Error fetching users for mention:", error);
                      callback([]);
                    });
                }}
                displayTransform={(id, display) => `${display}`}
              />
            </MentionsInput>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleClickClose}>Cancel</Button>
            <Button onClick={this.handleCommentSubmit}>Submit</Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}