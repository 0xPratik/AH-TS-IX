import * as anchor from '@project-serum/anchor';
import { wallet } from './wallet';
import {
  createBuyInstruction,
  BuyInstructionAccounts,
  BuyInstructionArgs
} from '@metaplex-foundation/mpl-auction-house';

export const buy = async () => {
  try {
    console.log('BUY');
  } catch (error) {
    console.log('ERROR In Buy', error);
  }
};
