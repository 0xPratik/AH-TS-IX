import * as anchor from '@project-serum/anchor';
import { wallet } from './wallet';
import {
  SellInstructionAccounts,
  SellInstructionArgs,
  createSellInstruction
} from '@metaplex-foundation/mpl-auction-house';

export const createSell = async (connection: anchor.web3.Connection) => {
  try {
    // const accounts: SellInstructionAccounts = {};
    // const args: SellInstructionArgs = {};
  } catch (error) {
    console.log('SELL ERROR', error);
  }
};
