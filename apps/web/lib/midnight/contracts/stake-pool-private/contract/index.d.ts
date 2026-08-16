import type * as __compactRuntime from '@midnight-ntwrk/compact-runtime';

export enum PoolState { OPEN = 0, LOCKED = 1, SETTLED = 2 }

export type Witnesses<PS> = {
  callerAddress(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
  matchIdWitness(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
}

export type ImpureCircuits<PS> = {
  stakePrivate(context: __compactRuntime.CircuitContext<PS>,
               amount_0: bigint,
               nonce_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  lockPool(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
  settleWinner(context: __compactRuntime.CircuitContext<PS>,
               winner_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
}

export type ProvableCircuits<PS> = {
  stakePrivate(context: __compactRuntime.CircuitContext<PS>,
               amount_0: bigint,
               nonce_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  lockPool(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
  settleWinner(context: __compactRuntime.CircuitContext<PS>,
               winner_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
}

export type PureCircuits = {
}

export type Circuits<PS> = {
  stakePrivate(context: __compactRuntime.CircuitContext<PS>,
               amount_0: bigint,
               nonce_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  lockPool(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
  settleWinner(context: __compactRuntime.CircuitContext<PS>,
               winner_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
}

export type Ledger = {
  readonly state: PoolState;
  readonly matchId: Uint8Array;
  readonly playerCount: bigint;
  readonly maxPlayers: bigint;
  readonly potAmount: bigint;
  readonly payoutWinner: { is_some: boolean, value: Uint8Array };
  playerStakes: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): Uint8Array;
    [Symbol.iterator](): Iterator<[Uint8Array, Uint8Array]>
  };
}

export type ContractReferenceLocations = any;

export declare const contractReferenceLocations : ContractReferenceLocations;

export declare class Contract<PS = any, W extends Witnesses<PS> = Witnesses<PS>> {
  witnesses: W;
  circuits: Circuits<PS>;
  impureCircuits: ImpureCircuits<PS>;
  provableCircuits: ProvableCircuits<PS>;
  constructor(witnesses: W);
  initialState(context: __compactRuntime.ConstructorContext<PS>, max_0: bigint): __compactRuntime.ConstructorResult<PS>;
}

export declare function ledger(state: __compactRuntime.StateValue | __compactRuntime.ChargedState): Ledger;
export declare const pureCircuits: PureCircuits;
