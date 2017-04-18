'use strict'

const pipe = require('ramda/src/pipe')
const mapObjIndexed = require('ramda/src/mapObjIndexed')
const merge = require('ramda/src/merge')
const invertObj = require('ramda/src/invertObj')

const { FEATHERS_ACTION, DEFAULT_METHODS } = require('./constants')

const createActionTypes = require('./action-types')

module.exports = createActionCreators

function createActionCreators (options) {
  const {
    service,
    methods = DEFAULT_METHODS
  } = options

  const actionTypes = createActionTypes.service(options)
  const requestTypes = createActionTypes.request(options)

  const getActionCreatorsForMethods = pipe(
    invertObj,
    mapObjIndexed((_, method) => Action(method, argsCreatorByMethod[method]))
  )

  return merge(
    getActionCreatorsForMethods(methods),
    {
      // special
      set,
      requestStart,
      requestComplete,
      requestError
    }
  )

  function set (id, data) {
    return {
      type: actionTypes.set,
      payload: { id, data }
    }
  }

  function requestStart (cid, call) {
    return {
      type: requestTypes.start,
      payload: call,
      meta: { cid }
    }
  }
  function requestComplete (cid, result) {
    return {
      type: requestTypes.complete,
      payload: result,
      meta: { cid }
    }
  }
  function requestError (cid, err) {
    return {
      type: requestTypes.error,
      payload: err,
      error: true,
      meta: { cid }
    }
  }

  function Action (method, argsCreator) {
    return (...args) => ({
      type: FEATHERS_ACTION,
      payload: {
        service,
        method,
        args: argsCreator(...args)
      }
    })
  }
}

const argsCreatorByMethod = {
  find: (params = {}) => ({ params }),
  get: (id, params = {}) => ({ id, params }),
  create: (data, params = {}) => ({ data, params }),
  update: (id, data, params = {}) => ({ id, data, params }),
  patch: (id, data, params = {}) => ({ id, data, params }),
  remove: (id, params = {}) => ({ id, params })
}
