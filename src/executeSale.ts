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
import { getMint, getOrCreateAssociatedTokenAccount } from '@solana/spl-token';

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

    const buyerATA = await getOrCreateAssociatedTokenAccount(
      connection,
      buyer.payer,
      mint,
      buyer.publicKey
    );
    const NFTMintData = await getMint(connection, mint);
    const tokenSizeAdjusted = new anchor.BN(
      await getPriceWithMantissa(1, NFTMintData.decimals)
    );

    const [freeTradeState, freeTradeBump] = await getAuctionHouseTradeState(
      new anchor.web3.PublicKey(AuctionHouse.address),
      wallet.publicKey,
      tokenAccountPubkey,
      new anchor.web3.PublicKey(AuctionHouse.mint),
      mint,
      tokenSizeAdjusted,
      new anchor.BN(0)
    );

    const TreasuryMintData = await getMint(
      connection,
      new anchor.web3.PublicKey(AuctionHouse.mint)
    );

    const buyPriceAdjusted = new anchor.BN(
      await getPriceWithMantissa(1, TreasuryMintData.decimals)
    );

    const [SellertradeState, SellertradeBump] = await getAuctionHouseTradeState(
      new anchor.web3.PublicKey(AuctionHouse.address),
      wallet.publicKey,
      tokenAccountPubkey,
      new anchor.web3.PublicKey(AuctionHouse.mint),
      mint,
      tokenSizeAdjusted,
      buyPriceAdjusted
    );

    const [BuyertradeState, BuyertradeBump] = await getAuctionHouseTradeState(
      new anchor.web3.PublicKey(AuctionHouse.address),
      buyer.publicKey,
      tokenAccountPubkey,
      new anchor.web3.PublicKey(AuctionHouse.mint),
      mint,
      tokenSizeAdjusted,
      buyPriceAdjusted
    );

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
      tokenAccount: tokenAccountPubkey,
      buyerReceiptTokenAccount: buyerATA.address,
      freeTradeState: freeTradeState,
      sellerTradeState: SellertradeState,
      buyerTradeState: BuyertradeState
    };

    const args: ExecuteSaleInstructionArgs = {
      buyerPrice: buyPriceAdjusted,
      escrowPaymentBump: escrowBump,
      tokenSize: tokenSizeAdjusted,
      freeTradeStateBump: freeTradeBump,
      programAsSignerBump: programAsSignerBump
    };

    const instruction = createExecuteSaleInstruction(accounts, args);
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
    console.log('ERROR In Execute Sale', error);
  }
};
