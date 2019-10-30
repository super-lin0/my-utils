import pathToRegexp from "path-to-regexp";
import _ from "lodash";

/**
 * 嵌套路由扁平化
 * @param {*} routers
 * @param {*} prefix
 * @param {*} routeMap
 * 
 * const routers = [
  {
    path: "/",
    name: "home",
    component: "Home",
    children: [
      {
        path: "about",
        name: "about",
        component: () =>
          import("../views/About.vue")
        }
      ]
    }
  ];  ====> this.translator(routes)

  { '/': { name: 'home', component: 'Home', path: '/' },
  '/about':
   { name: 'about',
     component: [Function: component],
     path: '/about' } }
 */
export function translator(routers, prefix = "", routeMap = {}) {
  routers.forEach(route => {
    const { children, path, ...props } = route;
    prefix += path;

    routeMap[prefix] = { ...props, path: prefix };

    if (children) {
      this.translator(children, prefix, routeMap);
    }
  });
  return routeMap;
}

export function getPlainNode(nodeList, parentPath = "") {
  const arr = [];
  nodeList.forEach(node => {
    const item = node;
    item.path = `${parentPath}/${item.path || ""}`.replace(/\/+/g, "/");
    item.exact = true;
    if (item.children) {
      arr.push(...getPlainNode(item.children, item.path));
    } else {
      if (!item.children) {
        item.exact = false;
      }
      arr.push(item);
    }
  });
  return arr;
}

function getRouterMap(item, map, pPath = "") {
  if (_.isArray(item)) {
    item.forEach(x => {
      return getRouterMap(x, map, item.path);
    });
  } else {
    let path = "";
    if (
      _.indexOf(item.path, "/") === 0 ||
      _.lastIndexOf(pPath, "/") === pPath.length - 1
    ) {
      path = `${pPath}${item.path}`;
    } else {
      path = `${pPath}/${item.path}`;
    }
    map.set(path, item);
    if (_.isEmpty(item.children)) {
      return;
    }
    item.children.forEach(x => {
      return getRouterMap(x, map, path);
    });
  }
}
/**
 * 通过path获取路径
 * @param {路由path} path
 */
export function getRouterByPath(path, routerData) {
  if (_.isEmpty(path)) {
    return null;
  }
  // 将routerData转换成map数据接口
  let routerMap = new Map();
  getRouterMap(routerData || [], routerMap);
  let item = null;

  routerMap.forEach((value, key) => {
    if (pathToRegexp(key).exec(path)) {
      item = value;
      return false;
    }
  });
  return _.isEmpty(item) ? null : item;
}
