import * as anchor from '@project-serum/anchor';
import { PROGRAM_ID } from '@metaplex-foundation/mpl-auction-house';
import { TOKEN_METADATA_PROGRAM_ID } from './constants';
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID
} from '@solana/spl-token';

export const AUCTION_HOUSE = 'auction_house';

export const AuctionHouse = {
  address: 'Gr31akcY9wb7Gsnu4ej39MydBfxcT8mehZtKxFTsCAai',
  mint: 'So11111111111111111111111111111111111111112',
  authority: 'Eqp8mRhQpjk2nDYtZJjkyshJBc5EZudPDcMNhaXGuyJN',
  creator: 'Eqp8mRhQpjk2nDYtZJjkyshJBc5EZudPDcMNhaXGuyJN',
  feeAccount: 'AnUxX7EmyRZegQtv4xYaBBWMaYG5uoLdJdMHfWXu4CLo',
  treasuryAccount: 'FxaGuPmq9qNDX1qWAMrGUfwGp3cqahW1T5eViPDG7VR2',
  withdrawAccount: 'Eqp8mRhQpjk2nDYtZJjkyshJBc5EZudPDcMNhaXGuyJN',
  treasuryWithdrawAccount: 'Eqp8mRhQpjk2nDYtZJjkyshJBc5EZudPDcMNhaXGuyJN',
  ahBump: 255,
  ahFeeBump: 254,
  ahTreasuryBump: 255,
  sellerFeeBasisPoints: 500,
  canChangeSalePrice: false,
  requiresSignOff: false
};

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

export const getMetadata = async (
  mint: anchor.web3.PublicKey
): Promise<anchor.web3.PublicKey> => {
  return (
    await anchor.web3.PublicKey.findProgramAddress(
      [
        Buffer.from('metadata'),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        mint.toBuffer()
      ],
      TOKEN_METADATA_PROGRAM_ID
    )
  )[0];
};
