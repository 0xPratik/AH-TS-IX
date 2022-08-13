import * as anchor from '@project-serum/anchor';
import { wallet } from './wallet';
import {
  createBuyInstruction,
  BuyInstructionAccounts,
  BuyInstructionArgs
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

export const buy = async (connection: anchor.web3.Connection) => {
  try {
    const mint = new anchor.web3.PublicKey('');
    const tokenAccount = new anchor.web3.PublicKey('');
    const NFTMintData = await getMint(connection, mint);
    const tokenSizeAdjusted = new anchor.BN(
      await getPriceWithMantissa(1, NFTMintData.decimals)
    );
    const TreasuryMintData = await getMint(
      connection,
      new anchor.web3.PublicKey(AuctionHouse.mint)
    );
    const buyPriceAdjusted = new anchor.BN(
      await getPriceWithMantissa(1, TreasuryMintData.decimals)
    );

    const [escrowPaymentAccount, escrowBump] = await getAuctionHouseBuyerEscrow(
      new anchor.web3.PublicKey(AuctionHouse.address),
      wallet.publicKey
    );

    const [BuyertradeState, BuyertradeBump] = await getAuctionHouseTradeState(
      new anchor.web3.PublicKey(AuctionHouse.address),
      wallet.publicKey,
      tokenAccount,
      new anchor.web3.PublicKey(AuctionHouse.mint),
      mint,
      tokenSizeAdjusted,
      buyPriceAdjusted
    );

    const accounts: BuyInstructionAccounts = {
      auctionHouse: new anchor.web3.PublicKey(AuctionHouse.address),
      auctionHouseFeeAccount: new anchor.web3.PublicKey(
        AuctionHouse.feeAccount
      ),
      authority: new anchor.web3.PublicKey(AuctionHouse.authority),
      metadata: await getMetadata(mint),
      wallet: wallet.publicKey,
      // Token Account of the Token to purchase
      tokenAccount: tokenAccount,
      treasuryMint: new anchor.web3.PublicKey(AuctionHouse.mint),
      buyerTradeState: BuyertradeState,
      escrowPaymentAccount: escrowPaymentAccount,
      paymentAccount: wallet.publicKey,
      transferAuthority: wallet.publicKey
    };

    const args: BuyInstructionArgs = {
      buyerPrice: buyPriceAdjusted,
      escrowPaymentBump: escrowBump,
      tokenSize: tokenSizeAdjusted,
      tradeStateBump: BuyertradeBump
    };

    const instruction = createBuyInstruction(accounts, args);
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
    console.log('ERROR In Buy', error);
  }
};
