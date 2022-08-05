import * as anchor from '@project-serum/anchor';
import { wallet } from './wallet';
import {
  createCreateAuctionHouseInstruction,
  CreateAuctionHouseInstructionArgs,
  CreateAuctionHouseInstructionAccounts,
  PROGRAM_ID,
  PROGRAM_ADDRESS
} from '@metaplex-foundation/mpl-auction-house';
import { WRAPPED_SOL_MINT } from './constants';

export const createAH = async (
  connection: anchor.web3.Connection
): Promise<string | undefined> => {
  try {
    const [auctionHouse, auctionHousebump] =
      await anchor.web3.PublicKey.findProgramAddress(
        [
          Buffer.from('auction_house'),
          wallet.publicKey.toBuffer(),
          WRAPPED_SOL_MINT.toBuffer()
        ],
        PROGRAM_ID
      );

    const [feeAccount, feeAccountbump] =
      await anchor.web3.PublicKey.findProgramAddress(
        [
          Buffer.from('auction_house'),
          auctionHouse.toBuffer(),
          Buffer.from('fee_payer')
        ],
        PROGRAM_ID
      );

    const [treasuryAccount, treasuryAccountbump] =
      await anchor.web3.PublicKey.findProgramAddress(
        [
          Buffer.from('auction_house'),
          auctionHouse.toBuffer(),
          Buffer.from('treasury')
        ],
        PROGRAM_ID
      );

    const accounts: CreateAuctionHouseInstructionAccounts = {
      auctionHouse: auctionHouse,
      auctionHouseFeeAccount: feeAccount,
      auctionHouseTreasury: treasuryAccount,
      authority: wallet.publicKey,
      payer: wallet.publicKey,
      treasuryMint: WRAPPED_SOL_MINT,
      feeWithdrawalDestination: wallet.publicKey,
      treasuryWithdrawalDestination: wallet.publicKey,
      treasuryWithdrawalDestinationOwner: wallet.publicKey
    };

    const args: CreateAuctionHouseInstructionArgs = {
      sellerFeeBasisPoints: 300,
      canChangeSalePrice: false,
      requiresSignOff: false,
      bump: auctionHousebump,
      feePayerBump: feeAccountbump,
      treasuryBump: treasuryAccountbump
    };

    const instruction = createCreateAuctionHouseInstruction(accounts, args);

    const { blockhash } = await connection.getLatestBlockhash('finalized');

    const transaction = new anchor.web3.Transaction({
      recentBlockhash: blockhash,
      feePayer: wallet.publicKey
    });

    transaction.add(instruction);
    wallet.signTransaction(transaction);
    const rawTx = transaction.serialize();
    const sig = await connection.sendRawTransaction(rawTx);
    await connection.confirmTransaction(sig, 'confirmed');
    return sig;
  } catch (error) {
    console.log('SOME ERROR WITH CREATEAH', error);
  }
};
