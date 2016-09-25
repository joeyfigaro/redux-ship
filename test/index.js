// @flow
import test from 'tape';
import * as Redux from 'redux';
import * as Ship from '../src/index';

type State = {
  counter: number,
};

const initialState: State = {
  counter: 0,
};

type Action = {
  type: 'Increment',
} | {
  type: 'Decrement',
};

function reduce(state: State, action: Action): State {
  switch (action.type) {
  case 'Increment':
    return {
      ...state,
      counter: state.counter + 1,
    };
  case 'Decrement':
    return {
      ...state,
      counter: state.counter - 1,
    };
  default:
    return state;
  }
}

type Effect = {
  type: 'Delay',
  ms: number,
};

function* delay<Action, State>(ms: number): Ship.t<Effect, Action, State, void> {
  yield* Ship.call({
    type: 'Delay',
    ms,
  });
}

function runCall(effect: Effect): any {
  switch (effect.type) {
  case 'Delay':
    return new Promise((resolve) =>
      setTimeout(resolve, effect.ms)
    );
  default:
    return effect.type;
  }
}

type ShipAction = {
  type: 'SlowIncrement',
};

function* slowIncrement(): Ship.t<Effect, Action, State, void> {
  yield* delay(1000);
  yield* Ship.dispatch({
    type: 'Increment',
  });
}

function* actionToShip(action: ShipAction): Ship.t<Effect, Action, State, void> {
  switch (action.type) {
  case 'SlowIncrement':
    return yield* slowIncrement();
  default:
    return;
  }
}

const store = Redux.createStore(
  reduce,
  initialState,
  Redux.applyMiddleware(Ship.middleware(runCall, actionToShip))
);

test((t) => {
  t.deepEqual(store.getState(), initialState);
  t.end();
});
