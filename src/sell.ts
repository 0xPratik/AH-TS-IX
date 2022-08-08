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
  getAuctionHouseTradeState
} from './utils';

export const createSell = async (connection: anchor.web3.Connection) => {
  try {
    // Accounts/Publickeys
    const mint = new anchor.web3.PublicKey('');
    const auctionHousePubKey = new anchor.web3.PublicKey('');
    const feeAccountPubkey = new anchor.web3.PublicKey('');
    const metadataPubkey = new anchor.web3.PublicKey('');
    const freeSellerTradeState = new anchor.web3.PublicKey('');

    const tokenAccountPubkey = (await getAtaForMint(mint, wallet.publicKey))[0];

    const [programAsSigner, programAsSignerBump] =
      await getAuctionHouseProgramAsSigner();

    const accounts: SellInstructionAccounts = {
      auctionHouse: auctionHousePubKey,
      auctionHouseFeeAccount: feeAccountPubkey,
      authority: wallet.publicKey,
      metadata: metadataPubkey,
      wallet: wallet.publicKey,
      freeSellerTradeState: freeSellerTradeState,
      programAsSigner: programAsSigner,
      tokenAccount: tokenAccountPubkey,
      sellerTradeState: programAsSigner
    };
    // const args: SellInstructionArgs = {};
  } catch (error) {
    console.log('SELL ERROR', error);
  }
};
