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
      this.intervalId = setInterval(() => {
        this.fetchData();
      }, 10000); // 10,000 ms = 10 секунд
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.loginUser !== prevProps.loginUser && this.props.loginUser) {
      this.fetchData();
    }
  }

  componentWillUnmount() {
    clearInterval(this.intervalId);
    this.source.cancel("UserList: Request canceled.");
  }

  fetchData() {
    if (!this.props.loginUser) {
      console.log("UserList: Хэрэглэгч нэвтрээгүй байна.");
      return;
    }
  
    axios
      .get("/users_with_recent_activity", { cancelToken: this.source.token })
      .then(response => {
        this.setState({ users: response.data });
        console.log("UserList: Хэрэглэгчийн жагсаалт болон хамгийн сүүлийн activity-г амжилттай авлаа :3");
      })
      .catch(error => {
        console.error("UserList: User list-ийг авахад алдаа гарлаа!", error.message);
      });
  }

  activitySentence(activityType) {
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
        return <Avatar style={{ backgroundColor: "#ea9ab2" }}>{activityType ? activityType[0] : "?"}</Avatar>;
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
                backgroundColor: "#e27396",
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
                    {`✧₊⁺ ${user.first_name} ${user.last_name}`}
                  </Typography>
                )}
                secondary={user.recentActivity ? (
                  <Typography variant="body2" style={{ color: "#6b4652", display: "flex", alignItems: "center", justifyContent: "space-between",}}>
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
                  <Typography variant="body2" style={{ color: "#6b4652" }}>
                    No recent activity
                  </Typography>
                )}
              />
            </ListItem>
          ))
        ) : (
          <Typography variant="body1" style={{ color: "#e27396" }}>
            {/* I used to fetch the model from window.cs142models.userListModel(), but now I’ve shifted to using Express.js for handling server-side logic. */}
            ౨ৎ⋆˚｡⋆(˶˃ ᵕ ˂˶)⋆°𐙚(*ᴗ͈ˬᴗ͈)ꕤ*.ﾟ⋆°⸜(｡˃ ᵕ ˂ )⸝♡⋆𐙚₊˚⊹♡ദ്ദി(˵ •̀ ᴗ - ˵ ) ✧°❀⋆.ೃ࿔*:･(˶ᵔ ᵕ ᵔ˶)౨ৎ⋆˚｡⋆ᯓ★₊˚⊹ᰔ≽^•⩊•^≼₊˚⊹♡-♡´-⭑.ᐟ₊˚⊹ᰔ⋆✿ 🫧𓇼𓏲*ੈ✩‧₊˚ദ്ദി ˉ͈̀꒳ˉ͈́ )✧ ✩₊˚.⋆☾⋆⁺₊✧(๑ᵔ⤙ᵔ๑)𓇼 ⋆.˚ 𓆉 𓆝 𓆡⋆.˚ 𓇼(ෆ˙ᵕ˙ෆ)♡✮⋆⊹₊ ⋆ᡣ𐭩ྀིྀི✮⋆˙(੭˃ᴗ˂)੭°ᡣ𐭩 . ° .ᕙ( •̀ ᗜ •́ )ᕗ𓆝 𓆟 𓆞 𓆝 𓆟( ꩜ ᯅ ꩜;)⁭ ⁭ִֶָ𓂃 ࣪˖ ִֶָ་༘࿐⸜(｡ ˃ ᵕ ˂ )⸝♡ ✮ ⋆⋆｡ﾟ☁︎｡⋆｡ ﾟ☾ ﾟ｡⋆ ˚｡𖦹 ⋆｡°✩ ⋆⭒˚.⋆(づ๑•ᴗ•๑)づ♡✧˖°..☘︎ ݁˖໒꒰ྀིᵔ ᵕ ᵔ ꒱ྀི১⋆˙⟡♡( &gt; 〰 &lt; )♡๋࣭ ⭑⚝⋆✴︎˚｡⋆(,,&gt;﹏&lt;,,)ᶻ 𝗓 𐰁 .ᐟ૮꒰ ˶• ༝ •˶꒱ა ♡⋅˚₊‧ 𐙚 ‧₊˚ ⋅° ᡣ𐭩 . ° .•⩊•⋆˚˖°𑁍ࠬܓ(˚ ˃̣̣̥⌓˂̣̣̥ ) ❀˖° •⩊• ૮꒰ྀི∩´ ᵕ ∩꒱ྀིა ⋅˚₊‧ ୨୧ ‧₊˚ ⋅(˵ •̀ ᴗ - ˵ ) ✧⊹ ࣪ ﹏𓊝﹏𓂁﹏⊹ ࣪ ˖ヾ( ˃ᴗ˂ )◞ •⋆˚✿˖° *✰｡°(°.◜ᯅ◝°)°ᰔᩚ ⋆ ˚｡⋆୨୧˚ ⋆｡ﾟ☁︎｡⋆｡ ﾟ☾ ﾟ｡⋆*ੈ⸜(｡˃ ᵕ ˂)⸝♡✩‧₊˚༺☆༻*ੈ✩‧₊જ⁀➴(¬⤙¬ )˚ ༘ ೀ⋆｡ ˚‧₊˚ ⋅ 𓐐𓎩 ‧₊˚ ⋅"૮₍ ˶•⤙•˶ ₎ა⋅˚₊‧ ଳ ‧₊˚ ⋅૮₍´˶• . • ⑅ ₎ა⋆ ˚｡⋆୨ ʚɞ ୧⋆ ˚｡⋆( ˶˘ ³˘(⋆❛ ہ ❛⋆)!♡ʚɞ˚ ༘♡ ⋆｡˚౨ৎ⋆˚｡⋆(˶˃ ᵕ ˂˶)⋆°𐙚(*ᴗ͈ˬᴗ͈)ꕤ*.ﾟ⋆°⸜(｡˃ ᵕ ˂ )⸝♡⋆𐙚₊˚⊹♡ദ്ദി(˵ •̀ ᴗ - ˵ ) ✧°❀⋆.ೃ࿔*:･(˶ᵔ ᵕ ᵔ˶)౨ৎ⋆˚｡⋆ᯓ★₊˚⊹ᰔ≽^•⩊•^≼₊˚⊹♡-♡´-⭑.ᐟ₊˚⊹ᰔ⋆✿ 🫧𓇼𓏲*ੈ✩‧₊˚ദ്ദി ˉ͈̀꒳ˉ͈́ )✧ ✩₊˚.⋆☾⋆⁺₊✧(๑ᵔ⤙ᵔ๑)𓇼 ⋆.˚ 𓆉 𓆝 𓆡⋆.˚ 𓇼(ෆ˙ᵕ˙ෆ)♡✮⋆⊹₊ ⋆ᡣ𐭩ྀིྀི✮⋆˙(੭˃ᴗ˂)੭°ᡣ𐭩 . ° .ᕙ( •̀ ᗜ •́ )ᕗ𓆝 𓆟 𓆞 𓆝 𓆟( ꩜ ᯅ ꩜;)⁭ ⁭ִֶָ𓂃 ࣪˖ ִֶָ་༘࿐⸜(｡ ˃ ᵕ ˂ )⸝♡ ✮ ⋆⋆｡ﾟ☁︎｡⋆｡ ﾟ☾ ﾟ｡⋆ ˚｡𖦹 ⋆｡°✩ ⋆⭒˚.⋆(づ๑•ᴗ•๑)づ♡✧˖°..☘︎ ݁˖໒꒰ྀིᵔ ᵕ ᵔ ꒱ྀི১⋆˙⟡♡( &gt; 〰 &lt; )♡๋࣭ ⭑⚝⋆✴︎˚｡⋆(,,&gt;﹏&lt;,,)ᶻ 𝗓 𐰁 .ᐟ૮꒰ ˶• ༝ •˶꒱ა ♡⋅˚₊‧ 𐙚 ‧₊˚ ⋅° ᡣ𐭩 . ° .•⩊•⋆˚˖°𑁍ࠬܓ(˚ ˃̣̣̥⌓˂̣̣̥ ) ❀˖° •⩊• ૮꒰ྀི∩´ ᵕ ∩꒱ྀིა ⋅˚₊‧ ୨୧ ‧₊˚ ⋅(˵ •̀ ᴗ - ˵ ) ✧⊹ ࣪ ﹏𓊝﹏𓂁﹏⊹ ࣪ ˖ヾ( ˃ᴗ˂ )◞ •⋆˚✿˖° *✰｡°(°.◜ᯅ◝°)°ᰔᩚ ⋆ ˚｡⋆୨୧˚ ⋆｡ﾟ☁︎｡⋆｡ ﾟ☾ ﾟ｡⋆*ੈ⸜(｡˃ ᵕ ˂)⸝♡✩‧₊˚༺☆༻*ੈ✩‧₊જ⁀➴(¬⤙¬ )˚ ༘ ೀ⋆｡ ˚‧₊˚ ⋅ 𓐐𓎩 ‧₊˚ ⋅"૮₍ ˶•⤙•˶ ₎ა⋅˚₊‧ ଳ ‧₊˚ ⋅૮₍´˶• . • ⑅ ₎ა⋆ ˚｡⋆୨ ʚɞ ୧⋆ ˚｡⋆( ˶˘ ³˘(⋆❛ ہ ❛⋆)!♡ʚɞ˚ ༘♡ ⋆｡˚ִֶָ་༘࿐⸜(｡ ˃ ᵕ ˂ )⸝♡ ✮ ⋆⋆｡ﾟ☁︎｡⋆｡ ﾟ☾ ﾟ｡⋆ ˚｡𖦹 ⋆｡°✩ ⋆⭒˚.⋆(づ๑•ᴗ•๑)づ♡✧˖°..☘︎ ݁˖໒꒰ྀིᵔ ᵕ ᵔ ꒱ྀི১⋆˙⟡♡( &gt; 〰 &lt; )♡๋࣭ ⭑⚝⋆✴︎˚｡⋆(,,&gt;﹏&lt;,,)ᶻ 𝗓 𐰁 .ᐟ૮꒰ ˶• ༝ •˶꒱ა ♡⋅˚₊‧ 𐙚 ‧₊˚ ⋅° ᡣ𐭩 . ° .•⩊•⋆˚˖°𑁍ࠬܓ(˚ ˃̣̣̥⌓˂̣̣̥ ) ❀˖° •⩊• ૮꒰ྀི∩´ ᵕ ∩꒱ྀིა ⋅˚₊‧ ୨୧ ‧₊˚ ⋅(˵ •̀ ᴗ - ˵ ) ✧⊹ ࣪ ﹏𓊝﹏𓂁﹏⊹ ࣪ ˖ヾ( ˃ᴗ˂ )◞ •⋆˚✿˖° *✰｡°(°.◜ᯅ◝°)°ᰔᩚ ⋆ ˚｡⋆୨୧˚ ⋆｡ﾟ☁︎｡⋆｡ ﾟ☾ ﾟ｡⋆*ੈ⸜(｡˃ ᵕ ˂)⸝♡✩‧₊˚༺☆༻*ੈ✩‧₊જ⁀➴(¬⤙¬ )˚ ༘ ೀ⋆｡ ˚‧₊˚ ⋅ 𓐐𓎩 ‧₊˚ ⋅"૮₍ ˶•⤙•˶ ₎ა⋅˚₊‧ ଳ ‧₊˚ ⋅૮₍´˶• . • ⑅ ₎ა⋆ ˚｡⋆୨ ʚɞ ୧⋆ ˚｡⋆( ˶˘ ³˘(⋆❛ ہ ❛⋆)!♡ʚɞ˚ ༘♡ ⋆｡˚౨ৎ⋆˚｡⋆(˶˃ ᵕ ˂˶)⋆°𐙚(*ᴗ͈ˬᴗ͈)ꕤ*.ﾟ⋆°⸜(｡˃ ᵕ ˂ )⸝♡⋆𐙚₊˚⊹♡ദ്ദി(˵ •̀ ᴗ - ˵ ) ✧°❀⋆.ೃ࿔*:･(˶ᵔ ᵕ ᵔ˶)౨ৎ⋆˚｡⋆ᯓ★₊˚⊹ᰔ≽^•⩊•^≼₊˚⊹♡-♡´-⭑.ᐟ₊˚⊹ᰔ⋆✿ 🫧𓇼𓏲*ੈ✩‧₊˚ദ്ദി ˉ͈̀꒳ˉ͈́ )✧ ✩₊˚.⋆☾⋆⁺₊✧(๑ᵔ⤙ᵔ๑)𓇼 ⋆.˚ 𓆉 𓆝 𓆡⋆.˚ 𓇼(ෆ˙ᵕ˙ෆ)♡✮⋆⊹₊ ⋆ᡣ𐭩ྀིྀི✮⋆˙(੭˃ᴗ˂)੭°ᡣ𐭩 . ° .ᕙ( •̀ ᗜ •́ )ᕗ𓆝 𓆟 𓆞 𓆝 𓆟( ꩜ ᯅ ꩜;)⁭ ⁭ִֶָ𓂃 ࣪˖ ִֶָ་༘࿐⸜(｡ ˃ ᵕ ˂ )⸝♡ ✮ ⋆⋆｡ﾟ☁︎｡⋆｡ ﾟ☾ ﾟ｡⋆ ˚｡𖦹 ⋆｡°✩ ⋆⭒˚.⋆(づ๑•ᴗ•๑)づ♡✧˖°..☘︎ ݁˖໒꒰ྀིᵔ ᵕ ᵔ ꒱ྀི১⋆˙⟡♡(  
          </Typography>
        )}
      </List>
    );
  }
}

export default UserList;