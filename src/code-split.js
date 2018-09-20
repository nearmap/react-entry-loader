import {parseExpression, parse} from '@babel/parser';
import traverse from '@babel/traverse';
import generate from '@babel/generator';
import {callExpression, identifier, expressionStatement} from '@babel/types';
import {importDeclaration, importSpecifier, stringLiteral} from '@babel/types';


/**
 * Return a function `f(item)` that return `true` if `item` is
 * the same as the `expected`.
 *
 * e.g.
 * ```
 * path.findParent(isSameAs(maybeParent));
 * ```
 */
const isSameAs = (expected)=> (item)=> item === expected;


/**
 * Return a function `f(item)` that returns `true` if `item`
 * has a `parentPath` as a parent.
 *
 * e.g.
 * ```
 * [path1, path2].filter(hasParent(somePath));
 * ```
 */
const hasParent = (parentPath)=> (path)=> path.findParent(isSameAs(parentPath));


/**
 * Return `true` if the `path` is a `React.createElement` call.
 */
const isReactCreateComponent = (path)=> (
  path.get('callee').matchesPattern('React.createElement')
);


/**
 * Return `true` if `path` is a `Renderer` or `Hydrator` injector component.
 */
const isInjector = (path)=> {
  if (isReactCreateComponent(path)) {
    const [comp] = path.get('arguments');
    return comp.referencesImport('react-entry-loader/injectors', 'Renderer');
  }
  return false;
};


const isAnyImportSpecifier = (path)=> (
  path.isImportSpecifier() || path.isImportDefaultSpecifier()
);


/**
 * Yield all bindings referenced by `path`.
 *
 * This will walk from the `path`'s current scope covering all parent
 * scopes, finding any binding that `path` depends on.
 */
function* getBindingsReferencedBy(path) {
  let scope = path.scope;

  while (scope) {
    for (const [, binding] of Object.entries(scope.bindings)) {
      if (binding.referencePaths.some(hasParent(path))) {
        yield binding;
      }
    }
    scope = scope.parent;
  }
}

/**
 * Yield all paths that `path` depends on directly or inderectly.
 */
function* getDependentPaths(path) {
  for (const binding of getBindingsReferencedBy(path)) {
    const bindingPath = binding.path;
    yield * getDependentPaths(bindingPath);
    yield bindingPath;
  }
}


/**
 * Return the container id from the
 * `<AppInjector id="foobar"><App /></AppInjector>`
 * given the `<App />`'s `injectedComponent`.
 */
const getContainerId = (injectedComponent)=> {
  const [, props] = injectedComponent.parent.arguments;
  return props.properties[0].value.value;
};


/**
 * Remove the `path` and its parents.
 * Only remove parent `ImportDeclarations` if `path` is the last
 * `ImportSpecifier`.
 */
const removePath = (path)=> {
  const {parentPath} = path;

  if (isAnyImportSpecifier(path) && parentPath.node.specifiers.length > 1) {
    path.remove();
    return;
  }

  parentPath.remove();
};


/**
 * Remove all paths from traversing `rootPath` that are not part of
 * any of the `requiredPaths`.
 */
const removeUnusedPaths = (rootPath, requiredPaths)=> {
  rootPath.traverse({
    ImportSpecifier(path) {
      if (!requiredPaths.has(path)) {
        removePath(path);
      }
    },

    ImportDefaultSpecifier(path) {
      if (!requiredPaths.has(path)) {
        removePath(path);
      }
    },

    VariableDeclarator(path) {
      if (!requiredPaths.has(path)) {
        path.remove();
      }
    },

    ExportDefaultDeclaration(path) {
      path.remove();
    }
  });
};


/**
 * Return the path of the component to be injected using an injector component.
 */
const getInjectedComponent = (ast)=> {
  let comp = null;

  traverse(ast, {
    CallExpression(path) {
      if (isReactCreateComponent(path) && isInjector(path.parentPath)) {
        comp = path;
      }
    }
  });

  return comp;
};


export const getModule = (source)=> {
  const ast = parse(source, {sourceType: 'module'});
  const injectedComponent = getInjectedComponent(ast);
  const id = getContainerId(injectedComponent);

  const prog = injectedComponent.findParent((path)=> path.isProgram());
  const requiredPaths = new Set(getDependentPaths(injectedComponent));

  removeUnusedPaths(prog, requiredPaths);

  prog.pushContainer('body',
    importDeclaration(
      [importSpecifier(identifier('render'), identifier('render'))],
      stringLiteral('react-dom')
    )
  );
  prog.pushContainer('body',
    expressionStatement(callExpression(identifier('render'), [
      injectedComponent.node,
      parseExpression(`document.getElementById(${JSON.stringify(id)})`)
    ]))
  );

  return generate(ast, {sourceMaps: false});
};


export const getTemplate = (source)=> {
  const ast = parse(source, {sourceType: 'module'});
  const injectedComponent = getInjectedComponent(ast);

  for (const binding of getBindingsReferencedBy(injectedComponent)) {
    const onlyUsedByApp = binding.referencePaths.every(
      (refPath)=> refPath.find(isSameAs(injectedComponent))
    );
    if (onlyUsedByApp) {
      removePath(binding.path);
    }
  }
  injectedComponent.remove();

  return generate(ast, {sourceMaps: true}, source);
};
