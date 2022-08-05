import * as anchor from '@project-serum/anchor';
import fs from 'fs';

const keypair = anchor.web3.Keypair.fromSecretKey(
  Buffer.from(
    JSON.parse(
      fs.readFileSync('/Users/pratiksaria/.config/solana/id.json', 'utf8')
    )
  )
);

export const wallet = new anchor.Wallet(keypair);
