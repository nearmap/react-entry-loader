import {parse} from '@babel/core';
import traverse from '@babel/traverse';
import generate from '@babel/generator';
import {callExpression, expressionStatement} from '@babel/types';


/**
 * Return a function `f(item)` that return `true` if `item` is
 * the same as the `expected`.
 *
 * e.g.
 * ```
 * path.findParent(isAnyOf(maybeParent));
 * ```
 */
const isAnyOf = (...expected)=> (item)=> expected.includes(item);


/**
 * Return a function `f(item)` that returns `true` if `item`
 * has a any of `parentPaths` as a parent.
 *
 * e.g.
 * ```
 * [path1, path2].filter(hasAnyParent(somePath));
 * ```
 */
const hasAnyParent = (...parentPaths)=> (path)=> (
  path.find(isAnyOf(...parentPaths))
);


/**
 * Return `true` if the `path` is a `React.createElement` call.
 */
const isReactCreateComponent = (path)=> (
  path.get('callee').matchesPattern('React.createElement')
);


/**
 * Return `true` if `path` is a `Module` injector component.
 */
const isModuleComponent = (path)=> {
  // TODO: handle functions, and calls to them, local to the module file.
  /* istanbul ignore else  */
  if (isReactCreateComponent(path)) {
    const [comp] = path.get('arguments');
    return comp.referencesImport('react-entry-loader/injectors', 'Module');
  }
  // TODO: we somehow never get here, maybe because we stop traversal
  // when we have found the module component.
  /* istanbul ignore next  */
  return false;
};


const isAnyImportSpecifier = (path)=> (
  path.isImportSpecifier() || path.isImportDefaultSpecifier()
);


const bindingOnlyReferencedBy = ({referencePaths}, ...paths)=> (
  referencePaths.every(hasAnyParent(...paths))
);

const bindingReferencesBy = ({referencePaths}, ...paths)=> (
  referencePaths && referencePaths.some(hasAnyParent(...paths))
);


function* getAllBindings(path) {
  let scope = path.scope;

  while (scope) {
    yield scope;
    for (const binding of Object.values(scope.bindings)) {
      yield binding;
    }
    scope = scope.parent;
  }
}


/**
 * Yield all bindings referenced by `paths`.
 *
 * This will walk from each `paths` item's current scope covering all parent
 * scopes, finding any binding that it depends on.
 */
function* getBindingsReferencedBy(...paths) {
  for (const path of paths) {
    for (const binding of getAllBindings(path)) {
      if (bindingReferencesBy(binding, path)) {
        yield binding;
      }
    }
  }
}

/**
 * Yield all paths that each `paths` item depends on directly or inderectly.
 */
function* getDependentPaths(...paths) {
  for (const {path} of getBindingsReferencedBy(...paths)) {
    yield * getDependentPaths(path);
    yield path;
  }
}

/**
 * Remove the `path` and its parents.
 * Only remove parent `ImportDeclaration`s if `path` is the last
 * `ImportSpecifier`.
 * Only remove parent `VariableDeclaration`s if `path` is the last
 * `Variable`.
 */
const removePathAndMaybeParent = (path)=> {
  const {parentPath} = path;

  if (isAnyImportSpecifier(path) && parentPath.node.specifiers.length > 1) {
    path.remove();
    return;
  }

  if (path.isVariableDeclarator() && parentPath.node.declarations.length > 1) {
    path.remove();
    return;
  }

  parentPath.remove();
};

const removePaths = (...paths)=> {
  for (const path of paths) {
    path.remove();
  }
};


const removeNonSharedBindings = (...paths)=> {
  for (const binding of getBindingsReferencedBy(...paths)) {
    if (bindingOnlyReferencedBy(binding, ...paths)) {
      removePathAndMaybeParent(binding.path);
    }
  }
};


/**
 * Remove all paths from `rootPath` that are not used by `paths`.
 */
const removeUnusedPaths = (rootPath, ...paths)=> {
  const pathsToKeep = new Set(getDependentPaths(...paths));

  const withMaybeParentRemover = (path)=> {
    if (!pathsToKeep.has(path)) {
      removePathAndMaybeParent(path);
    }
  };

  rootPath.traverse({
    ImportSpecifier: withMaybeParentRemover,
    ImportDefaultSpecifier: withMaybeParentRemover,
    VariableDeclarator: withMaybeParentRemover,
    ExportDefaultDeclaration: (path)=> path.remove()
  });
};


/**
 * Return the path of the `<Module>` component.
 */
const getModuleComponent = (ast)=> {
  let moduleComponent = null;

  traverse(ast, {
    CallExpression(path) {
      if (isModuleComponent(path)) {
        moduleComponent = path;
        path.stop();
      }
    }
  });

  return moduleComponent;
};


/**
 * Return the props and children of a React component.
 */
const getProps = (component)=> {
  const [, props, ...children] = component.get('arguments');

  const result = {children};

  for (const prop of props.get('properties')) {
    result[prop.node.key.name] = prop.get('value');
  }
  return result;
};


const isHydratable = (hydratablePropPath)=> (
  hydratablePropPath && hydratablePropPath.node.value
);


const getAst = (source, inputSourceMap)=> (
  parse(source, {
    sourceType: 'module',
    inputSourceMap
  })
);


export const getModule = (source, sourceMap)=> {
  const ast = getAst(source, sourceMap);

  const moduleComponent = getModuleComponent(ast);
  const {onLoad, children} = getProps(moduleComponent);

  const prog = moduleComponent.findParent((path)=> path.isProgram());
  removeUnusedPaths(prog, onLoad, ...children);

  prog.pushContainer('body',
    expressionStatement(
      callExpression(onLoad.node, children.map(({node})=> node))
    )
  );

  return generate(ast, {sourceMaps: false});
};


export const getTemplate = (source, sourceMap)=> {
  const ast = getAst(source, sourceMap);

  const moduleComponent = getModuleComponent(ast);
  const {onLoad, hydratable, children} = getProps(moduleComponent);

  removeNonSharedBindings(onLoad.parentPath);
  removePaths(onLoad.parentPath);

  if (!isHydratable(hydratable)) {
    removeNonSharedBindings(...children);
    removePaths(...children);
  }

  return generate(ast, {sourceMaps: true}, source);
};
