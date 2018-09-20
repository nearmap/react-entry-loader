import React from 'react';


/**
 * Render all `files` as style sheet tags.
 */
export const Styles = ({files})=> files.map(
  (src, key)=> <link key={key} href={src} rel="stylesheet" />
);


/**
 * Render all `files` as script tags.
 */
export const Scripts = ({files})=> files.map(
  (src, key)=> <script type="text/javascript" key={key} async src={src} />
);


/**
 * Render an application component container with the given `id`.
 */
export const Renderer = ({id})=> <div id={id} />;
