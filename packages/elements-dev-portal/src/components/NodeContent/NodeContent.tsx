import {
  CustomLinkComponent,
  Docs,
  MarkdownComponentsProvider,
  MockingProvider,
  PersistenceContextProvider,
} from '@stoplight/elements-core';
import { CustomComponentMapping } from '@stoplight/markdown-viewer';
import { dirname, resolve } from '@stoplight/path';
import { NodeType } from '@stoplight/types';
import * as React from 'react';

import { Node } from '../../types';

export type NodeContentProps = {
  node: Node;
  Link: CustomLinkComponent;

  /**
   * Allows to hide TryIt component
   */
  hideTryIt?: boolean;

  /**
   * Allows to hide TryIt panel
   */
  hideTryItPanel?: boolean;

  /**
   * Allows to hide mocking button
   */
  hideMocking?: boolean;

  /**
   * Allows to hide export button
   * @default false
   */
  hideExport?: boolean;
};

export const NodeContent = ({ node, Link, hideTryIt, hideTryItPanel, hideMocking, hideExport }: NodeContentProps) => {
  return (
    <PersistenceContextProvider>
      <NodeLinkContext.Provider value={[node, Link]}>
        <MarkdownComponentsProvider value={{ a: LinkComponent }}>
          <MockingProvider mockUrl={node.links.mock_url} hideMocking={hideMocking}>
            <Docs
              nodeType={node.type as NodeType}
              nodeData={node.data}
              nodeTitle={node.title}
              layoutOptions={{
                hideTryIt: hideTryIt,
                hideTryItPanel: hideTryItPanel,
                hideExport: hideExport || node.links.export_url === undefined,
              }}
              useNodeForRefResolving
              exportProps={
                [NodeType.HttpService, NodeType.Model].includes(node.type as NodeType)
                  ? {
                      original: {
                        href: node.links.export_url,
                      },
                      bundled: {
                        href: getBundledUrl(node.links.export_url),
                      },
                    }
                  : undefined
              }
            />
          </MockingProvider>
        </MarkdownComponentsProvider>
      </NodeLinkContext.Provider>
    </PersistenceContextProvider>
  );
};

const NodeLinkContext = React.createContext<[Node, CustomLinkComponent] | undefined>(undefined);

const externalRegex = new RegExp('^(?:[a-z]+:)?//', 'i');
const LinkComponent: CustomComponentMapping['a'] = ({ children, href }) => {
  const ctx = React.useContext(NodeLinkContext);

  if (href && externalRegex.test(href)) {
    // Open external URL in a new tab
    return (
      <a href={href} target="_blank" rel="noreferrer">
        {children}
      </a>
    );
  }

  if (href && ctx) {
    const [node, Link] = ctx;
    // Resolve relative file URI with
    const resolvedUri = resolve(dirname(node.uri), href);
    const [resolvedUriWithoutAnchor, hash] = resolvedUri.split('#');
    const decodedUrl = decodeURIComponent(href);
    const decodedResolvedUriWithoutAnchor = decodeURIComponent(resolvedUriWithoutAnchor);
    const edge = node.outbound_edges.find(
      edge => edge.uri === decodedUrl || edge.uri === decodedResolvedUriWithoutAnchor,
    );

    if (edge) {
      return (
        <Link to={edge.slug} hash={hash}>
          {children}
        </Link>
      );
    }
  }

  return <a href={href}>{children}</a>;
};

function getBundledUrl(url: string | undefined) {
  if (url === undefined) return undefined;
  const bundledUrl = new URL(url);
  const searchParams = new URLSearchParams(bundledUrl.search);
  searchParams.append('deref', 'optimizedBundle');
  bundledUrl.search = searchParams.toString();
  return bundledUrl.toString();
}