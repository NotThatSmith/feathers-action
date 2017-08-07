'use strict'

const pipe = require('ramda/src/pipe')
const merge = require('ramda/src/merge')
const invertObj = require('ramda/src/invertObj')
const prepend = require('ramda/src/prepend')
const toUpper = require('ramda/src/toUpper')
const map = require('ramda/src/map')
const mapObjIndexed = require('ramda/src/mapObjIndexed')
const join = require('ramda/src/join')

const { FEATHERS, DEFAULT_METHODS } = require('./constants')

module.exports = createActionTypes

function createActionTypes (options) {
  const {
    service,
    methods = DEFAULT_METHODS
  } = options

  const createActionType = ActionType(service)

  return merge(
    getActionTypesForMethods(createActionType, methods),
    {
      set: createActionType(['set']),
      setAll: createActionType(['setAll']),
      unset: createActionType(['unset']),
      unsetAll: createActionType(['unsetAll']),
      start: createActionType(['start']),
      ready: createActionType(['ready']),
      complete: createActionType(['complete']),
      error: createActionType(['error'])
    }
  )
}

const ActionType = (service) => {
  return pipe(
    prepend(service),
    prepend(FEATHERS),
    map(toUpper),
    join('_')
  )
}

const getActionTypesForMethods = (createActionType, methods) => {
  return pipe(
    invertObj,
    mapObjIndexed((_, method) => createActionType([method]))
  )(methods)
}
