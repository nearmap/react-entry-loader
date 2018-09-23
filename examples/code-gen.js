/* eslint-env node */
import fs from 'fs';

import React from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter/prism';
import {tomorrow} from 'react-syntax-highlighter/styles/prism';
import {transform} from '@babel/core';

import {getModule, getTemplate} from '../src/code-split';


const jsx = (raw, ...args)=> {
  const source = String.raw({raw}, ...args);

  const {code} = transform(source, {
    envName: 'webpack',
    sourceMaps: false
  });
  return code;
};


const Highlighter = ({code})=> (
  <SyntaxHighlighter
    showLineNumbers
    language='javascript'
    style={tomorrow}
    customStyle={{maxWidth: '45em'}}
  >
    {code}
  </SyntaxHighlighter>
);


const GeneratedCode = ({filename})=> {
  const entry = fs.readFileSync(filename, 'utf-8');
  const module = getModule(jsx`${entry}`).code;
  const template = getTemplate(jsx`${entry}`).code;

  return (
    <div style={{display: 'inline-flex', flexFlow: 'wrap', fontSize: '12px'}}>
      <div style={{marginRight: '1em', flexGrow: 1}}>
        Entry File Code:
        <Highlighter code={entry} />
      </div>

      <div style={{display: 'flex', flexDirection: 'column', flexGrow: 1}}>
        <div>
          Extracted Entry Module:
          <Highlighter code={module} />
        </div>

        <div>
          Extracted Template:
          <Highlighter code={template} />
        </div>
      </div>
    </div>
  );
};

export default GeneratedCode;
