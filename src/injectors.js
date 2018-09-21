import React from 'react';


/**
 * Render all `files` as style sheet tags.
 */
export const Styles = ({files, ...props})=> files.map(
  (src)=> <link key={src} href={src} rel="stylesheet" {...props} />
);


/**
 * Render all `files` as script tags.
 */
export const Scripts = ({files, ...props})=> files.map(
  (src)=> <script key={src} type="text/javascript" src={src} {...props} />
);


/**
 * Render an application component container with the given `id`.
 */ // eslint-disable-next-line no-unused-vars
export const Renderer = ({id, children, ...props})=> <div id={id} {...props} />;
