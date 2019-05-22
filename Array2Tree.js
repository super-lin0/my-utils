export const treeTransform1 = (
  data = [],
  key = "id",
  parentKey = "parendId",
  rootPid = -1
) => {
  const parents = data.filter(
    item => item[parentKey] === rootPid || item[parentKey] === "undefined"
  );
  const children = data.filter(
    item => item[parentKey] !== rootPid && item[parentKey] !== "undefined"
  );

  // eslint-disable-next-line
  const translator = (parents, children) => {
    parents.forEach(parent => {
      children.forEach((current, index) => {
        if (current[parentKey] !== parent[key]) {
          return;
        }
        const temp = JSON.parse(JSON.stringify(children));
        temp.splice(index, 1);
        if (typeof parent.children !== "undefined") {
          parent.children.push(current);
        } else {
          parent.children = [current];
        }
        return translator([current], temp);
      });
    });
  };

  translator(parents, children);

  return parents;
};

export const treeDataTransform = (
  data = [],
  key = "id",
  parentKey = "parendId",
  rootPid = -1
) => {
  const midObj = {};
  const arr = [];

  data.sort((a, b) => b[parentKey] - a[parentKey]);

  // eslint-disable-next-line
  const translator = data => {
    if (!data || !data.length) {
      return data;
    }
    data.forEach((item, index) => {
      const nowPid = item[parentKey];
      const nowId = item[key];

      if (nowPid !== rootPid) {
        translator(item);
        delete data[index];
      }

      // 建立当前节点的父节点的children 数组
      if (midObj[nowPid]) {
        midObj[nowPid].push(item);
      } else {
        midObj[nowPid] = [];
        midObj[nowPid].push(item);
      }
      // 将children 放入合适的位置
      if (midObj[nowId]) {
        item.children = midObj[nowId];
        delete midObj[nowId];
        if (item && data[index]) {
          arr.push(item);
        }
      }
    });
  };
  translator(data);
  return arr;
};
