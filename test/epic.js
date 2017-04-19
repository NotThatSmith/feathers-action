const test = require('tape')
const Rx = require('rxjs/Rx')
const Action$ = require('redux-observable/lib/cjs/ActionsObservable').ActionsObservable
const { values, propEq } = require('ramda')

const catsData = {
  0: { id: 0, name: 'honey', description: 'sweet and delicious.' },
  1: { id: 1, name: 'tea' },
  2: { id: 2, name: 'mug' }
}
const newCat = { name: 'honey', description: 'sweet and delicious' }

const createActionTypes = require('../action-types')
const createActionCreators = require('../actions')
const createModule = require('../')

const service = 'cats'
const cats = createModule({ service })
const actionCreators = createActionCreators({ service })

var currentCid = 100
function createCid () {
  return currentCid++
}

test('find', function (t) {
  const cid = createCid()
  const action$ = Action$.of(cats.actions.find(cid))
  const feathers = {
    find: () => Rx.Observable.of(values(catsData))
  }
  const expected = [
    actionCreators.start(cid, { service, method: 'find', args: { params: {} } }),
    actionCreators.set(cid, 0, catsData[0]),
    actionCreators.set(cid, 1, catsData[1]),
    actionCreators.set(cid, 2, catsData[2]),
    actionCreators.complete(cid)
  ]
  cats.epic(action$, undefined, { feathers })
    .toArray() // .reduce(flip(append), [])
    .subscribe((actions) => {
      t.deepEqual(actions, expected)
      t.end()
    })
})

test('get', function (t) {
  const cid = createCid()
  const action$ = Action$.of(cats.actions.get(cid, 0))
  const feathers = {
    get: (id) => Rx.Observable.of(catsData[id])
  }
  const expected = [
    actionCreators.start(cid, { service, method: 'get', args: { id: 0, params: {} } }),
    actionCreators.set(cid, 0, catsData[0]),
    actionCreators.complete(cid)
  ]
  cats.epic(action$, undefined, { feathers })
    .toArray()
    .subscribe((actions) => {
      t.deepEqual(actions, expected)
      t.end()
    })
})

test('create', function (t) {
  const cid = createCid()
  const action$ = Action$.of(cats.actions.create(cid, newCat))
  const feathers = {
    create: () => Rx.Observable.of(catsData[0])
  }
  const expected = [
    actionCreators.start(cid, { service, method: 'create', args: { data: newCat, params: {} } }),
    actionCreators.set(cid, cid, newCat),
    actionCreators.set(cid, cid, undefined),
    actionCreators.set(cid, 0, catsData[0]),
    actionCreators.complete(cid)
  ]
  cats.epic(action$, undefined, { feathers })
    .toArray()
    .subscribe((actions) => {
      t.deepEqual(actions, expected)
      t.end()
    })
})

/*

test('create is handled by epic and calls create on the feathers', function (t) {
  const cat = { name: 'fluffy' }
  const action$ = Action$.of(cats.actions.create(cat))

  const feathers = {
    create: (data, params) => {
      t.deepEqual(data, cat)
      t.deepEqual(params, {})
      t.end()
    }
  }

  cats.epic(action$, {}, { feathers })
    .filter(isType(actionTypes.create))
    .subscribe((action) => {
    })
})

test('create is handled by epic and emits request start action', function (t) {
  const cat = { name: 'fluffy' }
  const action$ = Action$.of(cats.actions.create(cat))

  const feathers = {
    create: () => {
    }
  }

  cats.epic(action$, {}, { feathers })
    .filter(isType(actionTypes.start))
    .subscribe((action) => {
      t.ok(action)
      t.end()
    })
})

test('create is handled by epic and emits set action', function (t) {
  const cat = { name: 'fluffy' }
  const action$ = Action$.of(cats.actions.create(cat))

  const feathers = {
    create: () => {
    }
  }

  cats.epic(action$, {}, { feathers })
    .filter(({type}) => type === 'FEATHERS_CATS_SET')
    .subscribe((action) => {
      t.ok(action)
      t.end()
    })
})

test('create is handled by epic and emits set action twice when request succeeds', function (t) {
  const cat = { name: 'fluffy' }
  const action$ = Action$.of(cats.actions.create(cat))
  t.plan(2)

  const feathers = {
    create: (cat) => {
      return Promise.resolve(cat)
    }
  }
  cats.epic(action$, {}, { feathers })
    .filter(({type}) => type === 'FEATHERS_CATS_SET')
    .subscribe((action) => {
      t.ok(action)
    })
})

*/

const isType = propEq('type')
