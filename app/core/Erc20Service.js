import Web3 from 'web3';
import Engine from './Engine';
import ContractABIs from './ABIs';
import routes from '../common/routes';
import APIService from '../services/APIService';
import { addHexPrefix } from '@walletconnect/utils';

let contractAddress = '';
const rpcProvider = routes.mainNetWork.url;
const contract = () => {
  const { selectedAddress } = Engine.state.PreferencesController;
  const web3 = new Web3(new Web3.providers.HttpProvider(rpcProvider));
  return new web3.eth.Contract(ContractABIs, getContractAddress(), { from: selectedAddress });
}

export default class Erc20Service {

  getFixedFee = async () => {
    return await contract().methods.fixedFee().call();
  }

  getBalance = async (address) => {
    return await contract().methods.balanceOf(address).call();
  }

  transfer = async (to, amount) => {
    return await contract().methods.transfer(to, amount).send();
  }
}

export const getContractAddress = () => {
  if (!contractAddress && !this.request) {
    this.request = setTimeout(() => APIService.getAppList((success, json) => {
      if (success && json) {
        const klubcoinInstance = json.find(e => e.name == 'klubcoin');
        if (klubcoinInstance) {
          contractAddress = addHexPrefix(klubcoinInstance.hexCode);
          clearTimeout(this.request);
          this.request = undefined;
        }
      }
    }));
  }
  return contractAddress;
};