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


export const Module = ({hydratable, children})=> {
  if (hydratable && children) {
    return children;
  }
  return null;
};
