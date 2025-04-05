import React from "react";
import { 
  Button, 
  Dialog, 
  DialogContent, 
  DialogContentText, 
  TextField, 
  DialogActions, 
  Chip 
} from "@mui/material";
import "./styles.css";
import axios from "axios";

export default class CommentDialog extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      open: false,
      comment: "",
    };
  }
  // dialog box-ийг нээж хаах үед төлөвийг шинэчилнэ.
  handleClickOpen = () => this.setState({ open: true });
  handleClickClose = () => this.setState({ open: false });
  // comment field-ийг өөрчлөхөд comment-д хадгална.
  handleCommentChange = e => this.setState({ comment: e.target.value });
  // Submit товчлуурыг дарахад сервер лүү хүсэлт явуулна.
  handleCommentSubmit = () => {
    // цэвэрлэхээс өмнө мэдээллийг өөр хувьсагчид хадгална.
    const commentText = this.state.comment;
    // сэтгэгдлийг илгээсэн гэж үзээд цэвэрлэнэ.
    this.setState({ comment: "" });
    // тэгээд dialog box-ийг хаана.
    this.setState({ open: false });
    axios
      // ингэхдээ JSON форматаар явуулах шаардлагатай
      .post(`/commentsOfPhoto/${this.props.photo_id}`, { comment: commentText })
      // controller-оос дамжин орж ирсэн method болно.
      .then(() => this.props.onCommentSumbit())
      .catch(error => console.log("CommentDialog: Сэтгэгдлийг илгээхэд алдаа гарлаа. ", error));
  };

  render() {
    return (
      <div className="comment-dialog">
        <Chip label="Reply" onClick={this.handleClickOpen}/>
        {/* хэрэглэгч сэтгэгдэл бичилгүй dialog box-оос гарч болно*/}
        <Dialog open={this.state.open} onClose={this.handleClickClose} >
          <DialogContent>
            <DialogContentText>Add a comment...</DialogContentText>
            <TextField value={this.state.comment} onChange={this.handleCommentChange} autoFocus multiline margin="dense" fullWidth />
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