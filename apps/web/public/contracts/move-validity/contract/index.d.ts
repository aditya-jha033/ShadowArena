import type * as __compactRuntime from '@midnight-ntwrk/compact-runtime';

export enum GameState { WAITING_P1 = 0, WAITING_P2 = 1, REVEAL = 2, FINISHED = 3
}

export type Witnesses<PS> = {
  callerAddress(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
}

export type ImpureCircuits<PS> = {
  joinPlayer1(context: __compactRuntime.CircuitContext<PS>,
              commitment_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  joinPlayer2(context: __compactRuntime.CircuitContext<PS>,
              commitment_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  reveal(context: __compactRuntime.CircuitContext<PS>,
         p1Value_0: bigint,
         p1Nonce_0: Uint8Array,
         p2Value_0: bigint,
         p2Nonce_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
}

export type ProvableCircuits<PS> = {
  joinPlayer1(context: __compactRuntime.CircuitContext<PS>,
              commitment_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  joinPlayer2(context: __compactRuntime.CircuitContext<PS>,
              commitment_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  reveal(context: __compactRuntime.CircuitContext<PS>,
         p1Value_0: bigint,
         p1Nonce_0: Uint8Array,
         p2Value_0: bigint,
         p2Nonce_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
}

export type PureCircuits = {
}

export type Circuits<PS> = {
  joinPlayer1(context: __compactRuntime.CircuitContext<PS>,
              commitment_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  joinPlayer2(context: __compactRuntime.CircuitContext<PS>,
              commitment_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  reveal(context: __compactRuntime.CircuitContext<PS>,
         p1Value_0: bigint,
         p1Nonce_0: Uint8Array,
         p2Value_0: bigint,
         p2Nonce_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
}

export type Ledger = {
  readonly state: GameState;
  readonly p1Address: { is_some: boolean, value: Uint8Array };
  readonly p2Address: { is_some: boolean, value: Uint8Array };
  readonly p1Commitment: { is_some: boolean, value: Uint8Array };
  readonly p2Commitment: { is_some: boolean, value: Uint8Array };
  readonly winnerAddress: { is_some: boolean, value: Uint8Array };
  readonly isDraw: boolean;
}

export type ContractReferenceLocations = any;

export declare const contractReferenceLocations : ContractReferenceLocations;

export declare class Contract<PS = any, W extends Witnesses<PS> = Witnesses<PS>> {
  witnesses: W;
  circuits: Circuits<PS>;
  impureCircuits: ImpureCircuits<PS>;
  provableCircuits: ProvableCircuits<PS>;
  constructor(witnesses: W);
  initialState(context: __compactRuntime.ConstructorContext<PS>): __compactRuntime.ConstructorResult<PS>;
}

export declare function ledger(state: __compactRuntime.StateValue | __compactRuntime.ChargedState): Ledger;
export declare const pureCircuits: PureCircuits;
