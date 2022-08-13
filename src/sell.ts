import * as anchor from '@project-serum/anchor';
import { wallet } from './wallet';
import {
  SellInstructionAccounts,
  SellInstructionArgs,
  createSellInstruction
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

export const createSell = async (connection: anchor.web3.Connection) => {
  try {
    const mint = new anchor.web3.PublicKey('');
    const metadataPubkey = new anchor.web3.PublicKey('');
    const freeSellerTradeState = new anchor.web3.PublicKey('');

    const tokenAccountPubkey = (await getAtaForMint(mint, wallet.publicKey))[0];
    const TreasuryMintData = await getMint(
      connection,
      new anchor.web3.PublicKey(AuctionHouse.mint)
    );
    const NFTMintData = await getMint(connection, mint);

    const [programAsSigner, programAsSignerBump] =
      await getAuctionHouseProgramAsSigner();

    const buyPriceAdjusted = new anchor.BN(
      await getPriceWithMantissa(1, TreasuryMintData.decimals)
    );

    const tokenSizeAdjusted = new anchor.BN(
      await getPriceWithMantissa(1, NFTMintData.decimals)
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

    const [freeTradeState, freeTradeBump] = await getAuctionHouseTradeState(
      new anchor.web3.PublicKey(AuctionHouse.address),
      wallet.publicKey,
      tokenAccountPubkey,
      new anchor.web3.PublicKey(AuctionHouse.mint),
      mint,
      tokenSizeAdjusted,
      new anchor.BN(0)
    );

    const accounts: SellInstructionAccounts = {
      auctionHouse: new anchor.web3.PublicKey(AuctionHouse.address),
      auctionHouseFeeAccount: new anchor.web3.PublicKey(
        AuctionHouse.feeAccount
      ),
      authority: new anchor.web3.PublicKey(AuctionHouse.authority),
      metadata: await getMetadata(mint),
      wallet: wallet.publicKey,
      programAsSigner: programAsSigner,
      freeSellerTradeState: freeTradeState,
      tokenAccount: tokenAccountPubkey,
      sellerTradeState: SellertradeState
    };
    const args: SellInstructionArgs = {
      freeTradeStateBump: freeTradeBump,
      programAsSignerBump: programAsSignerBump,
      tradeStateBump: SellertradeBump,
      buyerPrice: buyPriceAdjusted,
      tokenSize: tokenSizeAdjusted
    };

    const instruction = createSellInstruction(accounts, args);
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
    console.log('SELL ERROR', error);
  }
};
