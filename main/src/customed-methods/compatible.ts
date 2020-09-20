// 这个文件的作用是根据不同终端，决定transitionend

function getTransitionEndName(dom: HTMLElement): string | undefined {
  const cssTransition = ["transition", "webkitTransition"];
  // transitionend和webkitTransitionEnd是css3内置事件，在过渡结束后被触发
  const transitionEnd = {
    transition: "transitionend",
    webkitTransition: "webkitTransitionEnd"
  };

  for (const key of cssTransition) {
    if (dom.style[key] !== undefined) {
      return transitionEnd[key];
    }
  }

  return undefined;
}

export { getTransitionEndName };
