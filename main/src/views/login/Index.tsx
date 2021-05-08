import * as React from "react";

import { getNavtUserInfo } from "../../api/login";

import Password from "./child-components/password/Password";

import style from "./index.styl?css-modules";

interface IndexProps {
}

const { useEffect } = React;

function Index(props: IndexProps) {

  useEffect(() => {
    getNavtUserInfo().then(res => console.log(res))
  }, []);

  return (
    <div >
      <Password />
    </div>
  );
}

export default Index;
