import {
  TableOfContentsDivider,
  TableOfContentsExternalLink,
  TableOfContentsGroup,
  TableOfContentsGroupItem,
  TableOfContentsItem,
  TableOfContentsNode,
  TableOfContentsNodeGroup,
} from './types';

export function getHtmlIdFromItemId(id: string) {
  return `sl-toc-${id}`;
}

const MAX_DEPTH_OPEN_BY_DEFAULT = 0; // Maximum group depth open by default
export function isGroupOpenByDefault(
  depth: number,
  item: TableOfContentsGroup | TableOfContentsNodeGroup,
  activeId?: string,
) {
  return (
    depth < MAX_DEPTH_OPEN_BY_DEFAULT ||
    (activeId && (('id' in item && activeId === item.id) || hasActiveItem(item.items, activeId)))
  );
}

// Recursively checks for the active idem
function hasActiveItem(items: TableOfContentsGroupItem[], activeId: string): boolean {
  return items.some(item => {
    if ('id' in item && activeId === item.id) {
      return true;
    }

    if ('items' in item) {
      return hasActiveItem(item.items, activeId);
    }

    return false;
  });
}

// Recursively finds the first node
export function findFirstNode(items: TableOfContentsItem[]): TableOfContentsNode | TableOfContentsNodeGroup | void {
  for (const item of items) {
    if (isNode(item)) {
      return item;
    }

    if (isNodeGroup(item)) {
      return item;
    }

    if (isGroup(item)) {
      const firstNode = findFirstNode(item.items);
      if (firstNode) {
        return firstNode;
      }
    }

    continue;
  }

  return;
}

export function isDivider(item: TableOfContentsItem): item is TableOfContentsDivider {
  return Object.keys(item).length === 1 && 'title' in item;
}
export function isGroup(item: TableOfContentsItem): item is TableOfContentsGroup {
  return Object.keys(item).length === 2 && 'title' in item && 'items' in item;
}
export function isNodeGroup(item: TableOfContentsItem): item is TableOfContentsNodeGroup {
  return (
    Object.keys(item).length === 6 &&
    'title' in item &&
    'items' in item &&
    'slug' in item &&
    'id' in item &&
    'meta' in item &&
    'type' in item
  );
}
export function isNode(item: TableOfContentsItem): item is TableOfContentsNode {
  return (
    Object.keys(item).length === 5 &&
    'title' in item &&
    'slug' in item &&
    'id' in item &&
    'meta' in item &&
    'type' in item
  );
}
export function isExternalLink(item: TableOfContentsItem): item is TableOfContentsExternalLink {
  return Object.keys(item).length === 2 && 'title' in item && 'url' in item;
}
