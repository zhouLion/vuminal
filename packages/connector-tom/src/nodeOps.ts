import { RendererOptions, reactive } from '@vue/runtime-core';
import { isOn } from '@vue/shared';
import { TomNode, TomElement, TomText, createTomElement, createTomText, createTomComment } from '@vuminal/tom';

export const nodeOps: RendererOptions<TomNode, TomElement> = {
  insert: (child, parent, beforeNode?) => {
    const insertIndex = beforeNode ? parent.children.indexOf(beforeNode) : parent.children.length;
    parent.children = [...parent.children.slice(0, insertIndex), child, ...parent.children.slice(insertIndex)];
  },

  remove: (child) => {
    if (!child.parentNode) return;
    if (!child.parentNode.children.includes(child)) {
      throw new Error('parent do not contain child');
    }

    child.parentNode.children = child.parentNode.children.filter((c) => c !== child);
  },

  createElement: (tag) => reactive(createTomElement(tag)),
  createText: (text) => reactive(createTomText(text)),
  createComment: (text) => reactive(createTomComment(text)),

  setText: (node: TomText, text) => {
    node.text = text;
  },

  setElementText: (el: TomElement, text) => {
    for (const child of el.children) {
      child.parentNode = null;
    }

    el.children = text === '' ? [] : [nodeOps.createText(text)];
  },

  parentNode: (node) => node.parentNode,

  nextSibling: (node) => {
    if (!node.parentNode) return null;
    const parent = node.parentNode;
    const nextSiblingIndex = parent.children.indexOf(node) + 1;
    return parent.children[nextSiblingIndex] || null;
  },

  querySelector: (_selector) => {
    throw new Error('querySelector not supported in test renderer.');
  },

  setScopeId(el, id) {
    el.props[id] = '';
  },

  patchProp(el, key, _prevValue, value) {
    if (isOn(key)) {
      const event = key.slice(2).toLowerCase();
      el.eventListeners[event] = value;
    } else {
      el.props[key] = value;
    }
  },
};
