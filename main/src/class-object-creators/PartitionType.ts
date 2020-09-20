/**
 * 分类
 */
class PartitionType {
  constructor(
    public id: number,
    public name: string,
    public children: PartitionType[] = []
  ) { }
}

// 创建某个分类
function createPartitionTypes(data): PartitionType[] {
  return data.map((item) => new PartitionType(item.tid, item.typename));
}

// 创建某个分类及其子分类
function createPartitionTypesTree(data): PartitionType[] {
  if (data) {
    let partitionTtypes = [];
    const parentType = data["0"];
    if (parentType) {
      partitionTtypes = parentType.map((item) => {
        const id = item.tid;
        const children = createPartitionTypes(data["" + id]);
        return new PartitionType(id, item.typename, children);
      });
    }
    return partitionTtypes;
  }
}

export {
  PartitionType,
  createPartitionTypes,
  createPartitionTypesTree
}
