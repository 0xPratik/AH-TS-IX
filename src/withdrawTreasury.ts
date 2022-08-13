import * as anchor from '@project-serum/anchor';
import { wallet } from './wallet';
import {
  createWithdrawFromFeeInstruction,
  WithdrawFromFeeInstructionAccounts,
  WithdrawFromFeeInstructionArgs
} from '@metaplex-foundation/mpl-auction-house';
import {
  getAtaForMint,
  getAuctionHouseProgramAsSigner,
  getAuctionHouseTradeState,
  AuctionHouse,
  getMetadata,
  getPriceWithMantissa
} from './utils';
import { getMint } from '@solana/spl-token';

export const createWithdrawFromFeeAccount = async (
  connection: anchor.web3.Connection
) => {
  try {
    const amount = 1;
    const TreasuryMintData = await getMint(
      connection,
      new anchor.web3.PublicKey(AuctionHouse.mint)
    );

    const amountAdjusted = new anchor.BN(
      await getPriceWithMantissa(amount, TreasuryMintData.decimals)
    );

    const accounts: WithdrawFromFeeInstructionAccounts = {
      auctionHouse: new anchor.web3.PublicKey(AuctionHouse.address),
      auctionHouseFeeAccount: new anchor.web3.PublicKey(
        AuctionHouse.feeAccount
      ),
      authority: new anchor.web3.PublicKey(AuctionHouse.authority),
      feeWithdrawalDestination: wallet.publicKey
    };

    const args: WithdrawFromFeeInstructionArgs = {
      amount: amountAdjusted
    };

    const instruction = createWithdrawFromFeeInstruction(accounts, args);
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
    console.error('Withdraw from Treasury Errr', error);
  }
};
