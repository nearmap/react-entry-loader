import React, {Fragment} from 'react';
import './app.css';


const App = ({page})=> (
  <Fragment>
    <h4>Example App for page{page}.js</h4>
    <p>
      There are two example pages, both sharing the same
      <strong> &lt;App /&gt;</strong> component.
    </p>
    <p>
      They only differ in the
      way the <strong>&lt;App /&gt;</strong> component is rendered at
      compile-time and run-time.
    </p>

    <ul>
      <li>
        <a href="./page1.html">
          Page 1 - rendered into a div at run-time
        </a>
      </li>
      <li>
        <a href="./page2.html">
          Page 2 - hydrated into a div at run-time,
          rendered into template at compile time.
        </a>
      </li>
    </ul>

    <p>
      Below you can see the source code and the extracted
      entry module and template code for this page.
    </p>
  </Fragment>
);
export default App;
