import * as anchor from '@project-serum/anchor';
import { PROGRAM_ID } from '@metaplex-foundation/mpl-auction-house';
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID
} from '@solana/spl-token';

export const AUCTION_HOUSE = 'auction_house';

export async function getAuctionHouseProgramAsSigner(): Promise<
  [anchor.web3.PublicKey, number]
> {
  return await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from(AUCTION_HOUSE), Buffer.from('signer')],
    PROGRAM_ID
  );
}

export const getAuctionHouseTradeState = async (
  auctionHouse: anchor.web3.PublicKey,
  wallet: anchor.web3.PublicKey,
  tokenAccount: anchor.web3.PublicKey,
  treasuryMint: anchor.web3.PublicKey,
  tokenMint: anchor.web3.PublicKey,
  tokenSize: anchor.BN,
  buyPrice: anchor.BN
): Promise<[anchor.web3.PublicKey, number]> => {
  return await anchor.web3.PublicKey.findProgramAddress(
    [
      Buffer.from(AUCTION_HOUSE),
      wallet.toBuffer(),
      auctionHouse.toBuffer(),
      tokenAccount.toBuffer(),
      treasuryMint.toBuffer(),
      tokenMint.toBuffer(),
      buyPrice.toBuffer('le', 8),
      tokenSize.toBuffer('le', 8)
    ],
    PROGRAM_ID
  );
};

export const getAtaForMint = async (
  mint: anchor.web3.PublicKey,
  buyer: anchor.web3.PublicKey
): Promise<[anchor.web3.PublicKey, number]> => {
  return await anchor.web3.PublicKey.findProgramAddress(
    [buyer.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()],
    ASSOCIATED_TOKEN_PROGRAM_ID
  );
};

export async function getPriceWithMantissa(
  price: number,
  decimals: number
): Promise<number> {
  const mantissa = 10 ** decimals;

  return Math.ceil(price * mantissa);
}
