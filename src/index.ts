import * as anchor from '@project-serum/anchor';
import { createAH } from './createAH';

const connection = new anchor.web3.Connection('https://devnet.genesysgo.net/');

(async () => {
  try {
    const res = await createAH(connection);
    console.log('RES', res);
  } catch (error) {
    console.log('MAIN ERROR', error);
  }
})();
