// 直播二级导航栏query params
class LiveSecQueryParType {
  constructor(
    public parent_area_id: number,
    public parent_area_name: string,
    public area_id: number,
    public area_name: string,
  ) { }
}

export {
  LiveSecQueryParType,
}
