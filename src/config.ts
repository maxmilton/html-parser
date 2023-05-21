// function createMap<T>(keys: string, value: T): Record<string, T> {
//   return keys.split(',').reduce((pre, now) => {
//     pre[now] = value;
//     return pre;
//   }, Object.create(null));
// }

// export const selfCloseTags = createMap(
//   'area,base,br,col,embed,hr,img,input,link,meta,param,source,track,wbr,!doctype,,!,!--',
//   true,
// );

// export const noNestedTags = createMap('li,option,select,textarea', true);

export const selfCloseTags = new Set([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
  '!doctype',
  '',
  '!',
  '!--',
]);

export const noNestedTags = new Set(['li', 'option', 'select', 'textarea']);
