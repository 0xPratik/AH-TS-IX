import * as anchor from '@project-serum/anchor';
import { wallet } from './wallet';
import {
  createExecuteSaleInstruction,
  ExecuteSaleInstructionAccounts,
  ExecuteSaleInstructionArgs
} from '@metaplex-foundation/mpl-auction-house';
import {
  getAtaForMint,
  getAuctionHouseProgramAsSigner,
  getAuctionHouseTradeState,
  AuctionHouse,
  getMetadata,
  getPriceWithMantissa,
  getAuctionHouseBuyerEscrow
} from './utils';
import { getMint } from '@solana/spl-token';

export const executeSale = async (
  connection: anchor.web3.Connection,
  buyer: anchor.Wallet,
  mint: anchor.web3.PublicKey
) => {
  try {
    const [programAsSigner, programAsSignerBump] =
      await getAuctionHouseProgramAsSigner();

    const [escrowPaymentAccount, escrowBump] = await getAuctionHouseBuyerEscrow(
      new anchor.web3.PublicKey(AuctionHouse.address),
      buyer.publicKey
    );
    const tokenAccountPubkey = (await getAtaForMint(mint, wallet.publicKey))[0];

    const accounts: ExecuteSaleInstructionAccounts = {
      treasuryMint: new anchor.web3.PublicKey(AuctionHouse.mint),
      auctionHouse: new anchor.web3.PublicKey(AuctionHouse.address),
      auctionHouseFeeAccount: new anchor.web3.PublicKey(
        AuctionHouse.feeAccount
      ),
      authority: new anchor.web3.PublicKey(AuctionHouse.authority),
      programAsSigner: programAsSigner,
      auctionHouseTreasury: new anchor.web3.PublicKey(
        AuctionHouse.treasuryAccount
      ),
      seller: wallet.publicKey,
      metadata: await getMetadata(mint),
      tokenMint: mint,
      buyer: buyer.publicKey,
      escrowPaymentAccount: escrowPaymentAccount,
      sellerPaymentReceiptAccount: wallet.publicKey,
      tokenAccount:
    };

    // const args: ExecuteSaleInstructionArgs = {};
  } catch (error) {
    console.log('ERROR In Execute Sale', error);
  }
};
