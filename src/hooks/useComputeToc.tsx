import { Dictionary, NodeType } from '@stoplight/types';
import { escapeRegExp, sortBy, startCase, toLower, upperFirst } from 'lodash';
import * as React from 'react';

import { IconsContext } from '../containers/Provider';
import { IContentsNodeWithId, IProjectNode, NodeIconMapping, ProjectNodeWithUri } from '../types';
import { deserializeSrn } from '../utils/srns';

const README_REGEXP = new RegExp(`${escapeRegExp('README.md')}$`, 'i'); // Regex to get the README file

/**
 * Memoized hook that computes a tree structure from an array of nodes
 */
export function useComputeToc(nodes: IProjectNode[]) {
  const icons = React.useContext(IconsContext);
  return React.useMemo(() => computeToc(nodes, icons), [nodes, icons]);
}

/**
 * Sorts project nodes into a flat array
 */

export function computeToc(_nodes: IProjectNode[], icons: NodeIconMapping): IContentsNodeWithId[] {
  // There is a chance that we pass an empty array
  if (!_nodes.length) return [];

  // Add uri to each node since it's used heavily in this function
  const nodes: ProjectNodeWithUri[] = _nodes.map(n => ({ ...n, uri: deserializeSrn(n.srn).uri }));

  let contents: IContentsNodeWithId[] = [];
  const folders: string[] = [];
  const rootNodes: IContentsNodeWithId[] = []; // These nodes will appear at the top of the tree

  /** All document nodes */
  const docsNodes = sortBy(
    nodes.filter(node => node.type === NodeType.Article),
    node => toLower(node.srn),
  );

  for (const nodeIndex in docsNodes) {
    if (!docsNodes[nodeIndex]) continue;
    const node = docsNodes[nodeIndex];

    // Strip off leading slash and the (optionally) docs since we ignore that folder
    const uri = node.uri.replace(/^\/(?:docs\/)?/, '');
    const parts = uri.split('/');

    // Handle adding the parent folders if we haven't already added them
    if (parts.length > 1) {
      // All the path parts not including the file name
      const pathToItem = parts.slice(0, -1);
      for (const pathIndex in pathToItem) {
        if (!pathToItem[pathIndex]) continue;

        // Create a folder if one doesn't already exist
        const folderName = pathToItem[pathIndex];
        if (!folders.includes(`${folderName}/${pathIndex}`)) {
          folders.push(`${folderName}/${pathIndex}`);
          contents.push({
            id: `${nodeIndex}-${pathIndex}`,
            name: folderName
              .split('-')
              .map(item => upperFirst(item))
              .join(' '),
            depth: Number(pathIndex),
            type: 'group',
            icon: icons.group,
          });
        }
      }

      contents.push({
        id: node.id,
        name: node.name,
        depth: parts.length - 1,
        type: 'item',
        icon: icons[node.type] || icons.item,
        href: node.srn,
      });
    } else {
      // if our node only has one part, it must not be listed in a folder! Lets add it to a group that we will push onto the front of the stack at the end of this loop
      const contentNode: IContentsNodeWithId = {
        id: node.id,
        name: node.name,
        depth: 0,
        type: 'item',
        icon: icons[node.type] || icons.item,
        href: node.srn,
      };

      if (README_REGEXP.test(node.uri)) {
        rootNodes.unshift(contentNode);
      } else {
        rootNodes.push(contentNode);
      }
    }
  }

  // Add the root nodes to the top of the tree
  contents = rootNodes.concat(contents);

  /** Reference folder */
  const httpServiceNodes = sortBy(
    nodes.filter(n => n.type === NodeType.HttpService),
    node => toLower(node.name),
  );

  for (const httpServiceNode of httpServiceNodes) {
    const parentUriRegexp = new RegExp(`^${escapeRegExp(httpServiceNode.uri)}\/`, 'i');
    const childNodes = nodes.filter(node => parentUriRegexp.test(node.uri) && node.type !== NodeType.HttpService);
    if (!childNodes.length) continue;

    const dividerNode: IContentsNodeWithId = {
      id: httpServiceNode.id,
      name: httpServiceNode.name,
      depth: 0,
      type: 'divider',
      icon: icons[httpServiceNode.type] || icons.divider,
    };

    if (httpServiceNode.latestVersion && httpServiceNode.latestVersion !== '0.0') {
      dividerNode.meta = `v${httpServiceNode.latestVersion}`;
    }

    contents.push(dividerNode);
    contents.push({
      id: `${httpServiceNode.id}-overview`,
      name: 'Overview',
      depth: 0,
      icon: icons.item,
      type: 'item',
      href: httpServiceNode.srn,
    });

    const tags: Dictionary<IProjectNode[], string> = {};
    const other = [];

    /** Group by Tags */
    for (const childNode of childNodes) {
      if (childNode.tags && childNode.tags.length) {
        const tag = toLower(childNode.tags[0]);
        if (!tags[tag]) {
          tags[tag] = [];
        }

        tags[tag].push(childNode);
      } else {
        other.push(childNode);
      }
    }

    /** Add tag groups to the tree */
    const sortedTags = sortBy(Object.keys(tags), t => toLower(t));
    for (const tagIndex in sortedTags) {
      if (!sortedTags[tagIndex]) continue;
      const tag = sortedTags[tagIndex];

      contents.push({
        id: `${httpServiceNode.id}-${tag}-${tagIndex}`,
        name: startCase(tag),
        depth: 0,
        type: 'group',
        icon: icons.group,
      });

      for (const tagChild of sortBy(tags[tag], 'name')) {
        contents.push({
          id: tagChild.id,
          name: tagChild.name,
          depth: 1,
          icon: icons[tagChild.type] || icons.item,
          type: 'item',
          href: tagChild.srn,
        });
      }
    }

    /** Group whatever is left into "Other" */
    if (other.length) {
      contents.push({
        id: `${httpServiceNode.id}-other`,
        name: 'Other',
        depth: 0,
        type: 'group',
        icon: icons.group,
      });

      for (const otherChild of sortBy(other, n => toLower(n.name))) {
        contents.push({
          id: otherChild.id,
          name: otherChild.name,
          depth: 1,
          icon: icons[otherChild.type] || icons.item,
          type: 'item',
          href: otherChild.srn,
        });
      }
    }
  }

  /** Models folder */
  const modelContents: IContentsNodeWithId[] = [];

  const modelNodes = sortBy(
    nodes.filter(n => n.type === NodeType.Model),
    node => toLower(node.name),
  );

  for (const modelNode of modelNodes) {
    // Only add models that aren't already in the tree
    if (contents.find(n => n.href === modelNode.srn)) continue;

    const node: IContentsNodeWithId = {
      id: modelNode.id,
      name: modelNode.name,
      href: modelNode.srn,
      depth: 0,
      type: 'item',
      icon: icons[modelNode.type] || icons.item,
    };

    if (modelNode.latestVersion && modelNode.latestVersion !== '0.0') {
      node.meta = `v${modelNode.latestVersion}`;
    }

    modelContents.push(node);
  }

  if (modelContents.length) {
    contents.push({
      id: 'models',
      name: 'Models',
      depth: 0,
      type: 'divider',
    });

    contents = contents.concat(modelContents);
  }

  return contents;
}