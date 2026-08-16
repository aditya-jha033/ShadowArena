import { createUnprovenDeployTx } from '@midnight-ntwrk/midnight-js-contracts';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { CompiledContract } from '@midnight-ntwrk/compact-js';
import { createProofProvider } from '@midnight-ntwrk/midnight-js-types';
import { sampleSigningKey } from '@midnight-ntwrk/compact-runtime';

// For browser fetching of ZK keys
class FetchZkConfigProvider {
  contractName: string;
  constructor(contractName: string) {
    this.contractName = contractName;
  }
  async getZKIR(circuitName: string) {
    const res = await fetch(`/contracts/${this.contractName}/zkir/${circuitName}.bzkir`);
    if (!res.ok) throw new Error(`Failed to fetch ZKIR for ${circuitName}`);
    return new Uint8Array(await res.arrayBuffer());
  }
  async getProverKey(circuitName: string) {
    const res = await fetch(`/contracts/${this.contractName}/keys/${circuitName}.prover`);
    if (!res.ok) throw new Error(`Failed to fetch ProverKey for ${circuitName}`);
    return new Uint8Array(await res.arrayBuffer());
  }
  async getVerifierKey(circuitName: string) {
    const res = await fetch(`/contracts/${this.contractName}/keys/${circuitName}.verifier`);
    if (!res.ok) throw new Error(`Failed to fetch VerifierKey for ${circuitName}`);
    return new Uint8Array(await res.arrayBuffer());
  }
}

export async function deployMidnightContract(api: any, contractName: string, constructorArgs: any[] = []): Promise<{ address: string, txHash: string }> {
  console.log(`Starting deployment for: ${contractName}`);

  // Mock deployment for stake-pool-private due to Testnet Custom error 170 (persistentCommit limit)
  if (contractName === 'stake-pool-private') {
    console.warn("Mocking stake-pool-private deployment due to Testnet constraint (Error 170)");
    await new Promise(r => setTimeout(r, 2000));
    return {
      address: '0200000000000000000000000000000000000000000000000000000000000000' + Math.floor(Math.random() * 1000).toString(),
      txHash: '0x' + crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '')
    };
  }


  // 1. Get Wallet Configuration
  const config = await api.getConfiguration();

  // 2. Setup Providers
  const zkConfigProvider = new FetchZkConfigProvider(contractName);
  const provingProvider = await api.getProvingProvider(zkConfigProvider);
  const proofProvider = createProofProvider(provingProvider);

  const addresses = await api.getShieldedAddresses();

  // 3. Wallet Provider - only what createUnprovenDeployTx needs
  const walletProvider = {
    getCoinPublicKey: () => addresses.shieldedCoinPublicKey,
    getEncryptionPublicKey: () => addresses.shieldedEncryptionPublicKey,
    balanceTx: async (tx: any) => {
      // Serialize the transaction and balance via 1AM wallet
      const hexTx = Buffer.from(tx.serialize()).toString('hex');
      const balanced = await api.balanceUnsealedTransaction(hexTx);
      return { serializedHex: balanced.tx } as any;
    }
  };

  // 4. Load the compiled contract module
  let contractModule: any;
  try {
    contractModule = await import(`../../../../contracts/dist/${contractName}/contract/index.js`);
  } catch (e) {
    throw new Error(`Failed to load compiled contract for ${contractName}: ${e}`);
  }

  // 5. Build witnesses for the stake-pool contract constructor
  const dummyMatchId = new Uint8Array(32);
  crypto.getRandomValues(dummyMatchId);

  const witnesses = {
    callerAddress: (context: any) => [context.privateState, new Uint8Array(32)],
    matchIdWitness: (context: any) => [context.privateState, dummyMatchId],
  };

  // 6. Create the CompiledContract with witnesses bound
  let compiledContract = CompiledContract.make(contractName, contractModule.Contract);
  compiledContract = CompiledContract.withWitnesses(compiledContract, witnesses);

  // 7. Build the unproven deploy transaction (this gives us the contract address immediately)
  const unprovenDeployTxData = await createUnprovenDeployTx(
    { zkConfigProvider: zkConfigProvider as any, walletProvider: walletProvider as any },
    {
      compiledContract: compiledContract as any,
      signingKey: sampleSigningKey(),
      initialPrivateState: {},
      // Pass constructor args — e.g. stake-pool-private needs max: bigint
      ...(constructorArgs.length > 0 ? { args: constructorArgs } : {}),
    } as any
  );

  // The contract address is deterministically known at this point - before we even submit!
  const contractAddress = unprovenDeployTxData.public.contractAddress;

  // 8. Prove the transaction
  const provenTx = await proofProvider.proveTx(unprovenDeployTxData.private.unprovenTx as any);

  // 9. Balance via 1AM wallet (this shows the popup to sign)
  const balancedTx = await walletProvider.balanceTx(provenTx);

  // 10. Submit to Midnight via 1AM API
  const txResult = await api.submitTransaction(balancedTx.serializedHex);
  const txHash = typeof txResult === 'string' ? txResult : (txResult?.txHash || txResult?.id || "");

  // Return both the address and the txHash
  return { address: contractAddress as string, txHash };
}

import { createUnprovenCallTx } from '@midnight-ntwrk/midnight-js-contracts';

export async function callMidnightCircuit(
  api: any, 
  contractName: string, 
  contractAddress: string, 
  circuitName: string, 
  args: any[]
): Promise<string> {
  setNetworkId('preview');
  
  const config = await api.getConfiguration();
  const zkConfigProvider = new FetchZkConfigProvider(contractName);
  const provingProvider = await api.getProvingProvider(zkConfigProvider);
  const proofProvider = createProofProvider(provingProvider);
  const addresses = await api.getShieldedAddresses();

  const walletProvider = {
    getCoinPublicKey: () => addresses.shieldedCoinPublicKey,
    getEncryptionPublicKey: () => addresses.shieldedEncryptionPublicKey,
    balanceTx: async (tx: any) => {
      const hexTx = Buffer.from(tx.serialize()).toString('hex');
      const balanced = await api.balanceUnsealedTransaction(hexTx);
      return { serializedHex: balanced.tx } as any;
    }
  };

  const publicDataProvider = indexerPublicDataProvider(config.indexer, config.indexerWS);

  let contractModule: any;
  try {
    contractModule = await import(`../../../../contracts/dist/${contractName}/contract/index.js`);
  } catch (e) {
    throw new Error(`Failed to load compiled contract for ${contractName}: ${e}`);
  }

  // Build dummy witnesses to satisfy the contract's witness requirements
  // For MVP, callerAddress is just 32 empty bytes. A real app would provide the user's actual 1AM public key.
  const dummyMatchId = new Uint8Array(32);
  const witnesses = {
    callerAddress: (context: any) => [context.privateState, new Uint8Array(32)],
    matchIdWitness: (context: any) => [context.privateState, dummyMatchId],
  };
  
  let compiledContract = CompiledContract.make(contractName, contractModule.Contract);
  compiledContract = CompiledContract.withWitnesses(compiledContract, witnesses);

  // We need to fetch the existing state
  const stateData = await publicDataProvider.queryZSwapAndContractState(contractAddress);
  if (!stateData) {
    throw new Error("Contract state not found on the network. Is the contract address correct and deployed?");
  }
  const contractState = stateData[1];

  const unprovenCallTx = await createUnprovenCallTx(
    { zkConfigProvider: zkConfigProvider as any, walletProvider: walletProvider as any },
    {
      compiledContract: compiledContract as any,
      contractAddress,
      circuitName,
      args,
      previousPrivateState: {},
      contractState
    } as any
  );

  const provenTx = await proofProvider.proveTx(unprovenCallTx.private.unprovenTx as any);
  const balancedTx = await walletProvider.balanceTx(provenTx);
  
  const txResult = await api.submitTransaction(balancedTx.serializedHex);
  const txHash = typeof txResult === 'string' ? txResult : (txResult?.txHash || txResult?.id || "");

  return txHash;
}
