import { connect } from "react-redux";
import List from "../../../views/live/list/List";

const mapStateToProps = state => ({
  firstTabBarData: state.firstTabBarData,
  secondTabBarData: state.secondTabBarData,
  secondQueryPar: state.secondQueryPar,
});

export default connect(mapStateToProps)(List);
