import { IdentiyProvider } from "../IdentityConnector/identity/IdentityProvider";
import {createEnum} from "../utils/CommonUtils.js";

export const WalletTypes = createEnum(['NoWallet', 'plug', 'stoic', 'dfinity']);
export const CommonIdentityProvider = new IdentiyProvider();