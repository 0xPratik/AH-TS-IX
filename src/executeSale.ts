import * as anchor from '@project-serum/anchor';
import { wallet } from './wallet';
import {
  createExecuteSaleInstruction,
  ExecuteSaleInstructionAccounts,
  ExecuteSaleInstructionArgs
} from '@metaplex-foundation/mpl-auction-house';

export const executeSale = async () => {
  try {
    console.log('Execute Sale');
  } catch (error) {
    console.log('ERROR In Execute Sale', error);
  }
};
