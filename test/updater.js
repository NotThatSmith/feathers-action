'use strict'

const test = require('tape')
const deepFreeze = require('deep-freeze')
const assocPath = require('ramda/src/assocPath')
const merge = require('ramda/src/merge')

const feathersAction = require('../')
const cats = feathersAction.createService('cats')
const request = feathersAction.createRequest()

const catsRecords = {
  0: { id: 0, name: 'honey', description: 'sweet and delicious.' },
  1: { id: 1, name: 'tea' },
  2: { id: 2, name: 'mug' }
}

const cat = catsRecords[0]

const defaultServiceState = { cats: {} }
const defaultRequestState = { feathersAction: {} }
const defaultState = merge(defaultServiceState, defaultRequestState)

deepFreeze(defaultState)
deepFreeze(catsRecords)

test('service updater returns correct default state', function (t) {
  const state = cats.updater({type: 'woof'})()
  t.deepEqual(state, defaultServiceState)
  t.end()
})

test('request updater returns correct default state', function (t) {
  const state = request.updater({type: 'woof'})()
  t.deepEqual(state, defaultRequestState)
  t.end()
})

test('set sets the new state by id', function (t) {
  const { actions, updater } = cats
  const expectedState = assocPath(['cats', cat.id], cat, defaultServiceState)
  const action = actions.set(cat.id, cat)

  const newState = updater(action)(defaultServiceState)
  t.deepEqual(newState, expectedState)
  t.end()
})

test('start sets the request at the cid', function (t) {
  const { actions } = cats
  const { updater } = request
  const cid = 'abcd'
  const call = {
    method: 'create',
    service: 'cats',
    args: {}
  }
  const expectedState = assocPath(['feathersAction', cid], call, defaultState)

  const action = actions.requestStart(cid, call)

  const newState = updater(action)(defaultState)
  t.deepEqual(newState, expectedState)
  t.end()
})

test('complete sets the result at the cid', function (t) {
  const { actions } = cats
  const { updater } = request
  const cid = 'abcd'
  const call = {
    method: 'create',
    service: 'cats',
    args: {}
  }
  const initialState = assocPath(['feathersAction', cid], call, defaultState)
  deepFreeze(initialState)

  const requestState = merge(call, { result: cat, error: null })
  const expectedState = assocPath(['feathersAction', cid], requestState, initialState)

  const action = actions.requestComplete(cid, cat)

  const newState = updater(action)(initialState)
  t.deepEqual(newState, expectedState)
  t.end()
})

test('error sets the error at the cid', function (t) {
  const { actions } = cats
  const { updater } = request
  const cid = 'abcd'
  const call = {
    method: 'create',
    service: 'cats',
    args: {

    }
  }
  const initialState = assocPath(['feathersAction', cid], call, defaultState)
  deepFreeze(initialState)

  const err = new Error('oh no')
  const requestState = merge(call, { result: null, error: err })
  const expectedState = assocPath(['feathersAction', cid], requestState, initialState)

  const action = actions.requestError(cid, err)

  const newState = updater(action)(initialState)
  t.deepEqual(newState, expectedState)
  t.end()
})
