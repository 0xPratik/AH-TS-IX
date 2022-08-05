"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAH = void 0;
const anchor = __importStar(require("@project-serum/anchor"));
const wallet_1 = require("./wallet");
const mpl_auction_house_1 = require("@metaplex-foundation/mpl-auction-house");
const constants_1 = require("./constants");
const createAH = (connection) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [auctionHouse, auctionHousebump] = yield anchor.web3.PublicKey.findProgramAddress([
            Buffer.from('auction_house'),
            wallet_1.wallet.publicKey.toBuffer(),
            constants_1.WRAPPED_SOL_MINT.toBuffer()
        ], mpl_auction_house_1.PROGRAM_ID);
        const [feeAccount, feeAccountbump] = yield anchor.web3.PublicKey.findProgramAddress([
            Buffer.from('auction_house'),
            auctionHouse.toBuffer(),
            Buffer.from('fee_payer')
        ], mpl_auction_house_1.PROGRAM_ID);
        const [treasuryAccount, treasuryAccountbump] = yield anchor.web3.PublicKey.findProgramAddress([
            Buffer.from('auction_house'),
            auctionHouse.toBuffer(),
            Buffer.from('treasury')
        ], mpl_auction_house_1.PROGRAM_ID);
        const accounts = {
            auctionHouse: auctionHouse,
            auctionHouseFeeAccount: feeAccount,
            auctionHouseTreasury: treasuryAccount,
            authority: wallet_1.wallet.publicKey,
            payer: wallet_1.wallet.publicKey,
            treasuryMint: constants_1.WRAPPED_SOL_MINT,
            feeWithdrawalDestination: wallet_1.wallet.publicKey,
            treasuryWithdrawalDestination: wallet_1.wallet.publicKey,
            treasuryWithdrawalDestinationOwner: wallet_1.wallet.publicKey
        };
        const args = {
            sellerFeeBasisPoints: 300,
            canChangeSalePrice: false,
            requiresSignOff: false,
            bump: auctionHousebump,
            feePayerBump: feeAccountbump,
            treasuryBump: treasuryAccountbump
        };
        const instruction = (0, mpl_auction_house_1.createCreateAuctionHouseInstruction)(accounts, args);
        const { blockhash } = yield connection.getLatestBlockhash('finalized');
        const transaction = new anchor.web3.Transaction({
            recentBlockhash: blockhash,
            feePayer: wallet_1.wallet.publicKey
        });
        transaction.add(instruction);
        wallet_1.wallet.signTransaction(transaction);
        const rawTx = transaction.serialize();
        const sig = yield connection.sendRawTransaction(rawTx);
        yield connection.confirmTransaction(sig, 'confirmed');
        return sig;
    }
    catch (error) {
        console.log('SOME ERROR WITH CREATEAH', error);
    }
});
exports.createAH = createAH;
