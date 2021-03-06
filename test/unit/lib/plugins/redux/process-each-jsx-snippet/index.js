/* eslint-env mocha */
const assert = require('chai').assert
const parse = require('../../../../../../lib/helpers/parse')
const processEachJsxSnippet = require('../../../../../../lib/plugins/redux/process-each-jsx-snippet')
const generate = require('babel-generator').default

function checkOutput (input, { code, state, action }) {
    const inputComponent = {
      ast: parse(input),
      componentName: 'User',
      pathName: 'true',
      plugins: { redux: {} },
    }

    const outputComponent = processEachJsxSnippet({component: inputComponent}).component
    const outputRedux = outputComponent.plugins.redux
    const outputAst =  outputComponent.ast

    assert.deepEqual(outputRedux.state, state)
    assert.deepEqual(outputRedux.action, action)
    assert.deepEqual(generate(outputAst, {}, '').code, code)
}

describe('lib/plugins/redux/process-each-jsx-snippet', function () {
  it('should add value and onChange to input', function () {
    checkOutput(
      '<input id="name" />',
      {
        code: '<input id="name" onChange={this.props[\'action.user.changeName\']} value={this.props[\'state.user.name\']} />;',
        state: ['state.user.name'],
        action: ['action.user.changeName']
      }
    )
  })

  it('should add value and onChange to textarea', function () {
    checkOutput(
      '<textarea id="name" />',
      {
        code: '<textarea id="name" onChange={this.props[\'action.user.changeName\']} value={this.props[\'state.user.name\']} />;',
        state: ['state.user.name'],
        action: ['action.user.changeName']
      }
    )
  })

  it('should add value and onChange to input for email', function () {
    checkOutput(
      '<input id="email" type="email" />',
      {
        code: '<input id="email" type="email" onChange={this.props[\'action.user.changeEmail\']} value={this.props[\'state.user.email\']} />;',
        state: ['state.user.email'],
        action: ['action.user.changeEmail']
      }
    )
  })

  it('should add onClick to button', function () {
    checkOutput(
      '<button id="delete" />',
      {
        code: '<button id="delete" onClick={this.props[\'action.user.clickDelete\']} />;',
        state: [],
        action: ['action.user.clickDelete']
      }
    )
  })

  it('should add onSubmit to form', function () {
    checkOutput(
      '<form id="add-user" />',
      {
        code: '<form id="add-user" onSubmit={this.props[\'action.user.submitAddUser\']} />;',
        state: [],
        action: ['action.user.submitAddUser']
      }
    )
  })

  it('should not add any props to a div', function () {
    checkOutput(
      '<div id="add-user" />',
      {
        code: '<div id="add-user" />;',
        state: [],
        action: []
      }
    )
  })

  it('should add onClick to input[type=submit]', function () {
    checkOutput(
      '<input id="name" type="submit" />',
      {
        code: '<input id="name" type="submit" onClick={this.props[\'action.user.clickName\']} />;',
        state: [],
        action: ['action.user.clickName']
      }
    )
  })

  it('should add onClick to input[type=button]', function () {
    checkOutput(
      '<input id="name" type="button" />',
      {
        code: '<input id="name" type="button" onClick={this.props[\'action.user.clickName\']} />;',
        state: [],
        action: ['action.user.clickName']
      }
    )
  })

  it('should add onChange and checked to input[type=radio]', function () {
    checkOutput(
      '<input id="name" type="radio" />',
      {
        code: '<input id="name" type="radio" onChange={this.props[\'action.user.changeName\']} checked={this.props[\'state.user.name\']} />;',
        state: ['state.user.name'],
        action: ['action.user.changeName']
      }
    )
  })

  it('should add onChange and checked to input[type=checkbox]', function () {
    checkOutput(
      '<input id="name" type="checkbox" />',
      {
        code: '<input id="name" type="checkbox" onChange={this.props[\'action.user.toggleName\']} checked={this.props[\'state.user.name\']} />;',
        state: ['state.user.name'],
        action: ['action.user.toggleName']
      }
    )
  })

  it('should add onChange and selected to select', function () {
    checkOutput(`\
<select name="select" id="user">
  <option value="value1">Value 1</option>
  <option value="value2" selected>Value 2</option>
  <option value="value3">Value 3</option>
</select>
`,
      {
        code: `\
<select name="select" id="user" onChange={this.props['action.user.selectUser']} value={this.props['state.user.user']}>
  <option value="value1">Value 1</option>
  <option value="value2" selected>Value 2</option>
  <option value="value3">Value 3</option>
</select>;`
,
        state: ['state.user.user'],
        action: ['action.user.selectUser']
      }
    )
  })

  it('should change value in the tag', function () {
    checkOutput(
      '<div data-component-redux-value="name">Replace Me</div>',
      {
        code: '<div >{this.props[\'state.user.name\']}</div>;',
        state: ['state.user.name'],
        action: []
      }
    )
  })
})
