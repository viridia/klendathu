module.exports = {
  "parser": "@typescript-eslint/parser",
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
  ],
  "plugins": [
    "@typescript-eslint",
    "react",
  ],
  "parserOptions": {
    "ecmaVersion": 6,
    "ecmaFeatures": {
      "jsx": true
    },
    "sourceType": "module",
    "useJSXTextNode": true,
    "project": "./client/tsconfig.json",
  },
  "settings": {
    "import/resolver": {
      "node": {
        "moduleDirectory": ["node_modules"],
        "extensions": [".js", ".ts", ".tsx"]
      }
    },
    "react": {
      "version": "detect",
    },
  },
  "env": {
    "es6": true,
    "node": true,
    "browser": true,
    "jest": true,
  },
  "rules": {
    // Require consistent use of newlines in multi-line arrays
    "array-bracket-newline": ["error", "consistent"],

    // No spaces in array brackets
    "array-bracket-spacing": ["error", "never"],

    // Enforce spacing in single-line blocks.
    "block-spacing": ["error", "always"],

    // Enforce consistent use of return.
    // "consistent-return": "error",

    // Prefer camelcase, except for properties (which are sometimes JSON)
    // "camelcase": ["error", { "properties": "never" }],

    // Require space after commas
    "comma-spacing": ["error", { "before": false, "after": true }],

    // Disallow linebreak after dot
    "dot-location": ["error", "property"],

    // Prefer dot-notation to array notation where possible.
    "dot-notation": ["error"],

    // Enforce newline at end of file
    "eol-last": ["error", "always"],

    // Enforce use of === operator
    "eqeqeq": "error",

    // Don't allow 'for in' without an if-statement
    "guard-for-in": "error",

    // Needs to be disabled because typescript has its own rule
    "indent": "off",

    // Prefer double=quotes for JSX properties
    "jsx-quotes": ["error", "prefer-double"],

    // enforces spacing between keys and values in object literal properties
    "key-spacing": ["error", { "beforeColon": false, "afterColon": true }],

    // require a space before & after certain keywords
    "keyword-spacing": ["error", {
      "before": true,
      "after": true,
    }],

    // Prevent CRLF in files
    "linebreak-style": ["error", "unix"],

    // Maximum line length: 100
    "max-len": ["error", 100],

    // Disallow multiple classes per file. We occasionally do this.
    "max-classes-per-file": "off",

    // Allow console statements.
    "no-console": "off",

    // Allow empty functions
    "no-empty-function": "off",

    // Disallow 'eval()' (it's a security risk).
    "no-eval": "error",

    // Disallow extending native types like Array or String.
    "no-extend-native": "error",

    // Detect unneeded calls to .bind().
    "no-extra-bind": "error",

    // Disallow invalid use of 'this'.
    // "no-invalid-this": "error",

    // Disallow blocks without a statement.
    "no-lone-blocks": "error",

    // disallow mixed spaces and tabs for indentation
    "no-mixed-spaces-and-tabs": "error",

    // disallow multiple empty lines and only one newline at the end
    "no-multiple-empty-lines": ["error", { "max": 2, "maxEOF": 0 }],

    // Don't allow multiple consecutive spaces
    "no-multi-spaces": ["error", { "ignoreEOLComments": true }],

    // disallow nested ternary expressions
    // "no-nested-ternary": "error",

    // disallow use of the Object constructor
    "no-new-object": "error",

    // Don't allow expressions such as 'new String'.
    "no-new-wrappers": "error",

    // Don't allow parameters to be re-assigned.
    "no-param-reassign": "error",

    // disallow certain syntax forms
    "no-restricted-syntax": [
      "error",
      {
        selector: "ForInStatement",
        message: "for..in loops iterate over the entire prototype chain, which is virtually never what you want. Use Object.{keys,values,entries}, and iterate over the resulting array.",
      },
      {
        selector: "LabeledStatement",
        message: "Labels are a form of GOTO; using them makes code confusing and hard to maintain and understand.",
      },
      {
        selector: "WithStatement",
        message: "`with` is disallowed in strict mode because it makes code impossible to predict and optimize.",
      },
    ],

    // No assignment in return expressions.
    "no-return-assign": "error",

    // Disallow variables from shadowing
    "no-shadow": "error",

    // disallow space between function identifier and application
    "no-spaced-func": "error",

    // disallow tab characters entirely
    "no-tabs": "error",

    // Don't allow throwing of literals
    "no-throw-literal": "error",

    // disallow trailing whitespace at the end of lines
    "no-trailing-spaces": "error",

    // Disabled because TypeScript compiler enforces this already
    "no-unused-vars": "off",

    // Don't use vars before they are defined
    "no-use-before-define": "error",

    // Disallow useless .call() or .apply()
    "no-useless-call": "error",

    // This rule prevents things like /[\.]/, but it's easier to read
    "no-useless-escape": "off",

    // Detect un-needed catch statements.
    "no-useless-catch": "error",

    // Disallow return when it would return anyway
    "no-useless-return": "error",

    // Detect expressions that have no effect.
    "no-unused-expressions": ["warn", {
      "allowShortCircuit": true,
      "allowTernary": true
    }],

    // require quotes around object literal property names
    "quote-props": ["error", "as-needed", { "keywords": false, "unnecessary": true, "numbers": false }],

    // specify whether double or single quotes should be used
    "quotes": ["error", "single", { "avoidEscape": true }],

    // There are still occasional use cases for this.
    "react/no-find-dom-node": "off",

    // Will be removed in future versions of React.
    "react/no-string-refs": "off",

    // require use of semicolons
    "semi": ["error", "always"],

    // enforce spacing before and after semicolons
    "semi-spacing": ["error", { "before": false, "after": true }],

    // Enforce location of semicolons
    "semi-style": ["error", "last"],

    // Rules on spaces before function parens
    "space-before-function-paren": ["error", {
      "anonymous": "always",
      "named": "never",
      "asyncArrow": "always"
    }],

    // disallow spaces inside parentheses
    "space-in-parens": ["error", "never"],

    // require spaces around operators
    "space-infix-ops": "error",

    // Disallow the Unicode Byte Order Mark
    "unicode-bom": ["error", "never"],

    // Rules for generic Array<T> expressions
    "@typescript-eslint/array-type": ["error", "array-simple"],

    // Indentation rules
    "@typescript-eslint/indent": ["error", 2, {
      "SwitchCase": 1,
      "CallExpression": {
        "arguments": 1,
      },
      "VariableDeclarator": 1,
      "MemberExpression": 1,
      "FunctionDeclaration": {
        "parameters": 2,
        "body": 1
      },
      "ObjectExpression": 1,
      "FunctionExpression": {
        "body": 1,
        "parameters": "off"
      },
      "ignoredNodes": [
        "ConditionalExpression",
      ],
    }],

    // Let TypeScript compiler figure out the return type
    "@typescript-eslint/explicit-function-return-type": "off",

    // 'any' is occasionally useful
    "@typescript-eslint/no-explicit-any": "off",

    // Disallow 'for in' with arrays.
    "@typescript-eslint/no-for-in-array": "error",

    // TypeScript compiler does this already.
    "@typescript-eslint/no-unused-vars": "off",

    // Disabled because we sometimes define properties in constructor args.
    "@typescript-eslint/no-useless-constructor": "error",

    // Parameter properties are a useful, if somewhat underutilized, TypeScript feature.
    "@typescript-eslint/no-parameter-properties": "off",

    // Disabed because there appears to be a bug in the eslint rule. I'd like to enable.
    "@typescript-eslint/explicit-member-accessibility": ["off"],
  },
};


// , {
//   "accessibility": "explicit",
//   "overrides": {
//     "accessors": "explicit",
//     "constructors": "no-public",
//     "methods": "explicit",
//     "properties": "off",
//     "parameterProperties": "explicit"
//   }
// }