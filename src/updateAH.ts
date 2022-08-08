import * as anchor from '@project-serum/anchor';
import { wallet } from './wallet';
import {
  createUpdateAuctionHouseInstruction,
  UpdateAuctionHouseInstructionAccounts,
  UpdateAuctionHouseInstructionArgs
} from '@metaplex-foundation/mpl-auction-house';
import { WRAPPED_SOL_MINT } from './constants';

export const updateAH = async (connection: anchor.web3.Connection) => {
  try {
    const auctionHousePubKey = new anchor.web3.PublicKey('');

    const accounts: UpdateAuctionHouseInstructionAccounts = {
      auctionHouse: auctionHousePubKey,
      authority: wallet.publicKey,
      payer: wallet.publicKey,
      feeWithdrawalDestination: wallet.publicKey,
      newAuthority: wallet.publicKey,
      treasuryMint: WRAPPED_SOL_MINT,
      treasuryWithdrawalDestination: wallet.publicKey,
      treasuryWithdrawalDestinationOwner: wallet.publicKey
    };

    const args: UpdateAuctionHouseInstructionArgs = {
      canChangeSalePrice: false,
      requiresSignOff: false,
      sellerFeeBasisPoints: 500
    };

    const instruction = createUpdateAuctionHouseInstruction(accounts, args);

    const { blockhash } = await connection.getLatestBlockhash();

    const transaction = new anchor.web3.Transaction({
      recentBlockhash: blockhash
    });

    transaction.add(instruction);
    wallet.signTransaction(transaction);
    const rawTx = transaction.serialize();
    const sig = await connection.sendRawTransaction(rawTx);
    await connection.confirmTransaction(sig, 'confirmed');
    return sig;
  } catch (error) {
    console.log('Update Error', error);
  }
};
